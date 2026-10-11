import { closure, isoNow, readText, recordItems, sourceFiles, type Catalogue, type Ctx } from "./ctx.js"
import { assertKnown } from "./catalogue.js"
import { readLock, saveBase, writeLock } from "./lock.js"
import type { Preview } from "./shadcn.js"
import { CliError, c } from "./util.js"

async function previews(ctx: Ctx, catalogue: Catalogue, names: string[]): Promise<Preview> {
  const merged: Preview = new Map()
  // shadcn cannot reliably resolve hundreds of items in one run.
  for (let i = 0; i < names.length; i += 12) {
    const batch = names.slice(i, i + 12).map((n) => ctx.registry.address(n, catalogue[n]!.tier))
    for (const [path, file] of await ctx.shadcn.preview(batch)) merged.set(path, file)
  }
  return merged
}

/**
 * `ballmac track`: adopt items you installed with plain `shadcn add`, so they can be updated later.
 * A file identical to what shadcn would write today is recorded as pristine; one that differs is recorded without a base (it may be edited
 * or from an older version), and `ballmac update` will then put new versions beside it instead of merging.
 * `--rebase <item>` declares your files up to date with the latest version and records the latest as the base.
 */
export async function trackItems(ctx: Ctx, names: string[], opts: { rebase?: boolean } = {}) {
  const catalogue = await ctx.registry.catalogue()
  assertKnown(catalogue, names, Boolean(ctx.registry.licenseKey))
  const lock = readLock(ctx.project.root, ctx.registry.base)

  if (opts.rebase) {
    if (!names.length) throw new CliError("Name the items to rebase: ballmac track --rebase <item>")
    for (const name of names) {
      const item = lock.items[name]
      if (!item) throw new CliError(`${name} is not tracked yet. Run: ballmac track ${name}`)
      const preview = await ctx.shadcn.preview(ctx.registry.address(name, catalogue[name]!.tier))
      for (const [path, f] of Object.entries(item.files).filter(([, f]) => f.kind === "source")) {
        const theirs = preview.get(path)?.content
        if (theirs !== undefined) f.base = saveBase(ctx.project.root, theirs)
      }
      item.version = catalogue[name]!.version
      ctx.out(c.green(`✓ ${name} is now based on ${item.version}`))
    }
    writeLock(ctx.project.root, lock)
    return
  }

  // With no names: every catalogue item that is fully on disk and not tracked yet.
  const candidates = (names.length ? closure(catalogue, names) : Object.keys(catalogue))
    .filter((n) => !lock.items[n])
    .filter((n) => catalogue[n]!.files.length && sourceFiles(ctx, catalogue[n]!).every((p) => readText(ctx, p) !== null))
  if (!candidates.length) {
    ctx.out(names.length ? "Those items are already tracked, or not fully installed." : "No untracked Ballmac items found in this project.")
    return
  }
  const preview = await previews(ctx, catalogue, candidates)
  const existed = new Set(candidates.flatMap((n) => sourceFiles(ctx, catalogue[n]!)))
  recordItems(ctx, lock, candidates, catalogue, existed, preview)
  for (const n of candidates) if (lock.items[n]) lock.items[n]!.installedAt = isoNow(ctx)
  writeLock(ctx.project.root, lock)
  const unknown = candidates.filter((n) => Object.values(lock.items[n]?.files ?? {}).some((f) => f.base === null))
  ctx.out(c.green(`✓ ${candidates.length} item(s) tracked`) + (unknown.length ? c.yellow(`, ${unknown.length} without a base (edited or older): ${unknown.join(", ")}`) : ""))
}

