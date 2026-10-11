import { assertKnown, ensureProRegistry } from "./catalogue.js"
import { closure, recordItems, sourceFiles, readText, type Ctx } from "./ctx.js"
import { readLock, writeLock } from "./lock.js"
import { installTests } from "./tests.js"
import { c } from "./util.js"

export type AddOptions = { withTests?: boolean; installDev?: boolean }

/**
 * `ballmac add`: installs through the shadcn CLI, then records what was installed so `ballmac update` can later merge new versions
 * into your edited copies. With `withTests` the item's tests are installed next to it.
 */
export async function addItems(ctx: Ctx, names: string[], opts: AddOptions = {}) {
  const catalogue = await ctx.registry.catalogue()
  assertKnown(catalogue, names, Boolean(ctx.registry.licenseKey))
  const all = closure(catalogue, names)
  if (all.some((n) => catalogue[n]!.tier === "pro")) ensureProRegistry(ctx)

  const lock = readLock(ctx.project.root, ctx.registry.base)
  const existedBefore = new Set(all.filter((n) => !lock.items[n]).flatMap((n) => sourceFiles(ctx, catalogue[n]!)).filter((p) => readText(ctx, p) !== null))

  await ctx.shadcn.add(names.map((n) => ctx.registry.address(n, catalogue[n]!.tier)))

  // One preview of everything just installed: it is compared with what landed on disk, and decides the base of files that already existed.
  const toRecord = all.filter((n) => !lock.items[n])
  const requested = names.filter((n) => toRecord.includes(n))
  const preview = requested.length ? new Map((await Promise.all(requested.map((n) => ctx.shadcn.preview(ctx.registry.address(n, catalogue[n]!.tier))))).flatMap((p) => [...p])) : null
  const verified = recordItems(ctx, lock, toRecord, catalogue, existedBefore, preview)
  writeLock(ctx.project.root, lock)

  if (!verified) ctx.warn(c.yellow("shadcn's preview did not match the files it wrote. Run `ballmac update --dry-run` before updating, and keep shadcn and @ballmac/cli up to date."))
  const unknownBase = all.flatMap((n) => Object.entries(lock.items[n]?.files ?? {}).filter(([, f]) => f.base === null).map(([p]) => p))
  if (unknownBase.length) ctx.out(c.yellow(`${unknownBase.length} file(s) already existed and differ from the registry, so they are tracked without a base: ${unknownBase.join(", ")}`))

  ctx.out(c.green(`✓ ${all.length} item(s) tracked in ballmac.lock.json`) + c.dim(" (commit it and the .ballmac folder)"))
  if (opts.withTests) await installTests(ctx, names, { installDev: opts.installDev })
}

