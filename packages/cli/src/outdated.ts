import { fileState, type Ctx } from "./ctx.js"
import { readLock } from "./lock.js"
import type { ChangelogEntry } from "./registry.js"
import { CliError, c, compareVersions, suggest, table } from "./util.js"

export type OutdatedRow = {
  name: string
  installed: string
  latest: string | null
  outdated: boolean
  /** Not in the registry any more. */
  removed: boolean
  /** "yes" when you changed a file, "unknown" when no base was recorded for it. */
  modified: "yes" | "no" | "unknown"
  /** A previous update left conflict markers in one of the files. */
  unresolved: string[]
  changes: ChangelogEntry[]
}

export const isTestSetup = (name: string) => name.startsWith("ballmac-test-")

export async function findOutdated(ctx: Ctx, names: string[] = []) {
  const catalogue = await ctx.registry.catalogue()
  const lock = readLock(ctx.project.root, ctx.registry.base)
  const tracked = Object.keys(lock.items).filter((n) => !isTestSetup(n))
  const unknown = names.filter((n) => !lock.items[n])
  if (unknown.length) {
    throw new CliError(`Not tracked in ballmac.lock.json: ${unknown.map((n) => `${n}${suggest(n, tracked).length ? ` (did you mean ${suggest(n, tracked).join(", ")}?)` : ""}`).join(", ")}\nTrack items you installed with plain shadcn: ballmac track <item>`)
  }
  const rows: OutdatedRow[] = (names.length ? names : tracked).map((name) => {
    const item = lock.items[name]!
    const latest = catalogue[name]
    const states = Object.entries(item.files).map(([path, f]) => ({ path, ...fileState(ctx, path, f.base) }))
    const modified = states.some((s) => s.modified === true) ? "yes" : states.some((s) => s.modified === null && s.ours !== null) ? "unknown" : "no"
    return {
      name,
      installed: item.version,
      latest: latest?.version ?? null,
      outdated: Boolean(latest) && compareVersions(latest!.version, item.version) > 0,
      removed: !latest,
      modified,
      unresolved: states.filter((s) => s.ours !== null && /^<{7} /m.test(s.ours)).map((s) => s.path),
      changes: latest ? latest.changelog.filter((e) => compareVersions(e.version, item.version) > 0) : [],
    }
  })
  return { rows: rows.sort((a, b) => a.name.localeCompare(b.name)), catalogue }
}

export async function outdatedCommand(ctx: Ctx, names: string[], opts: { json?: boolean } = {}) {
  const { rows } = await findOutdated(ctx, names)
  if (opts.json) {
    ctx.out(JSON.stringify(rows, null, 2))
    return rows.filter((r) => r.outdated).length
  }
  if (!rows.length) {
    ctx.out("Nothing is tracked yet. Install with `ballmac add <item>`, or adopt what you already have with `ballmac track`.")
    return 0
  }
  const behind = rows.filter((r) => r.outdated)
  for (const r of rows.filter((r) => r.removed)) ctx.out(c.yellow(`${r.name} is no longer in the registry (kept as it is).`))
  for (const r of rows.filter((r) => r.unresolved.length)) ctx.out(c.red(`${r.name}: unresolved conflict markers in ${r.unresolved.join(", ")}`))
  if (!behind.length) {
    ctx.out(c.green(`✓ ${rows.length} tracked item(s) are up to date.`))
    return 0
  }
  ctx.out(
    table([
      ["ITEM", "INSTALLED", "LATEST", "YOUR CHANGES", "WHAT CHANGED"],
      ...behind.map((r) => [
        c.bold(r.name),
        r.installed,
        c.green(r.latest!),
        r.modified === "yes" ? c.yellow("yes (will be merged)") : r.modified === "unknown" ? c.yellow("unknown base") : "none",
        r.changes[0] ? `${r.changes[0].breaking ? c.red("BREAKING ") : ""}${r.changes[0].note.slice(0, 90)}${r.changes[0].note.length > 90 ? "…" : ""}` : c.dim("no notes"),
      ]),
    ])
  )
  const extra = behind.filter((r) => r.changes.length > 1)
  for (const r of extra) {
    ctx.out(c.dim(`\n${r.name}, in order:`))
    for (const e of r.changes) ctx.out(`  ${e.version} ${c.dim(e.date)} ${e.breaking ? c.red("BREAKING ") : ""}${e.note}`)
  }
  ctx.out(`\n${behind.length} of ${rows.length} behind. Update with: ${c.bold("ballmac update")}${c.dim("  (add --dry-run to preview)")}`)
  return behind.length
}
