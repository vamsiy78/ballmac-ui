import { existsSync, rmSync } from "node:fs"

import { closure, fileState, readText, recordItems, stamp, type Ctx } from "./ctx.js"
import { backup, readLock, saveBase, writeLock } from "./lock.js"
import { hasGit, merge3 } from "./merge.js"
import { findOutdated } from "./outdated.js"
import { absolute, testsDir } from "./project.js"
import { rewriteImports } from "./tests.js"
import { c, writeFile } from "./util.js"

export type FileAction = "replace" | "merge" | "conflict" | "keep" | "same" | "side-file" | "deleted"
export type FilePlan = { action: FileAction; content?: string; conflicts?: number }

/**
 * What to do with one file when a new version arrives.
 *   ours   your file now          base   the upstream file you installed          theirs   the new upstream file
 */
export function planFile(ours: string | null, base: string | null, theirs: string, labels: { ours: string; base: string; theirs: string }, git = true): FilePlan {
  if (ours === null) return { action: "deleted" }
  if (ours === theirs) return { action: "same" }
  if (base === null || !git) return { action: "side-file", content: theirs }
  if (theirs === base) return { action: "keep" }
  if (ours === base) return { action: "replace", content: theirs }
  const merged = merge3(ours, base, theirs, labels)
  return merged.conflicts ? { action: "conflict", content: merged.merged, conflicts: merged.conflicts } : { action: "merge", content: merged.merged }
}

export type FileResult = { path: string; action: FileAction | "new" | "dropped"; conflicts?: number }
export type ItemResult = { name: string; from: string; to: string; files: FileResult[]; notes: string[] }

const label: Record<FileResult["action"], string> = {
  replace: "updated ",
  merge: "merged  ",
  conflict: "CONFLICT",
  keep: "kept    ",
  same: "same    ",
  "side-file": "review  ",
  deleted: "skipped ",
  new: "new     ",
  dropped: "dropped ",
}

/**
 * `ballmac update`: for every tracked item with a newer version, merges the new upstream files into your copies.
 * Files you never touched are replaced; files you edited get a three-way merge; overlapping edits become git-style conflict markers.
 * Originals are copied to .ballmac/backup/ first.
 */
export async function updateItems(ctx: Ctx, names: string[] = []) {
  const { rows, catalogue } = await findOutdated(ctx, names)
  const pending = rows.filter((r) => r.outdated)
  if (!pending.length) {
    ctx.out(c.green("✓ Everything is up to date."))
    return { items: [] as ItemResult[], conflicts: 0 }
  }
  const git = hasGit()
  if (!git) ctx.warn(c.yellow("git was not found, so edited files are not merged. New versions are written beside them as <file>.ballmac-new."))
  const lock = readLock(ctx.project.root, ctx.registry.base)
  const when = stamp(ctx)
  const results: ItemResult[] = []

  for (const row of pending) {
    const latest = catalogue[row.name]!
    const lockItem = lock.items[row.name]!
    const address = ctx.registry.address(row.name, latest.tier)
    const preview = await ctx.shadcn.preview(address)
    const labels = { ours: "yours", base: `ballmac ${row.installed}`, theirs: `ballmac ${row.latest}` }
    const files: FileResult[] = []
    const notes = row.changes.map((e) => `${e.version}: ${e.note}`)
    const writes: { path: string; content: string }[] = []
    const rebased: Record<string, string> = {}

    // The item's own files.
    for (const [path, f] of Object.entries(lockItem.files).filter(([, f]) => f.kind === "source")) {
      const theirs = preview.get(path)?.content
      if (theirs === undefined) {
        files.push({ path, action: "dropped" })
        delete lockItem.files[path]
        continue
      }
      const { ours, baseText } = fileState(ctx, path, f.base)
      const plan = planFile(ours, baseText, theirs, labels, git)
      files.push({ path, action: plan.action, conflicts: plan.conflicts })
      if (plan.content !== undefined) writes.push({ path: plan.action === "side-file" ? `${path}.ballmac-new` : path, content: plan.content })
      if (plan.action !== "side-file") rebased[path] = theirs
    }

    // Its tests ride along with the item's version.
    const testFiles = Object.entries(lockItem.files).filter(([, f]) => f.kind === "test")
    if (testFiles.length && latest.tests) {
      const t = await ctx.registry.test(row.name)
      const theirs = rewriteImports(t.content, ctx.project.importPrefix)
      for (const [path, f] of testFiles) {
        if (path !== `${testsDir(ctx.project)}/${t.file}`) continue
        const { ours, baseText } = fileState(ctx, path, f.base)
        const plan = planFile(ours, baseText, theirs, labels, git)
        files.push({ path, action: plan.action, conflicts: plan.conflicts })
        if (plan.content !== undefined) writes.push({ path: plan.action === "side-file" ? `${path}.ballmac-new` : path, content: plan.content })
        if (plan.action !== "side-file") rebased[path] = theirs
      }
    }

    // Files the new version adds (and any new Ballmac dependency): shadcn creates them and installs new packages; nothing existing is overwritten.
    const created = [...preview].filter(([path, f]) => f.status === "create" && !existsSync(absolute(ctx.project, path))).map(([path]) => path)
    for (const path of created) files.push({ path, action: "new" })

    if (!ctx.dryRun) {
      const existedBefore = new Set([...preview.keys()].filter((p) => existsSync(absolute(ctx.project, p))))
      // Everything shadcn is about to write that already exists: kept in memory and on disk (.ballmac/backup) first.
      const snapshot = new Map([...existedBefore].map((p) => [p, readText(ctx, p) ?? ""]))
      for (const [path, content] of snapshot) backup(ctx.project.root, when, path, content)
      const restore = () => snapshot.forEach((content, path) => writeFile(absolute(ctx.project, path), content))
      try {
        // --overwrite means shadcn never asks, and installs any new packages. What it wrote is then put right file by file.
        await ctx.shadcn.add([address], { overwrite: true, silent: true })
        restore()
        for (const w of writes) writeFile(absolute(ctx.project, w.path), w.content)
        for (const f of files) if (f.action === "deleted" && existsSync(absolute(ctx.project, f.path))) rmSync(absolute(ctx.project, f.path))
      } catch (e) {
        restore()
        throw e
      }
      for (const [path, theirs] of Object.entries(rebased)) lockItem.files[path] = { base: saveBase(ctx.project.root, theirs), kind: lockItem.files[path]!.kind }
      lockItem.version = latest.version
      recordItems(ctx, lock, closure(catalogue, [row.name]), catalogue, existedBefore, preview)
      writeLock(ctx.project.root, lock)
    }
    results.push({ name: row.name, from: row.installed, to: row.latest!, files, notes })
  }

  report(ctx, results)
  const conflicts = results.flatMap((r) => r.files).filter((f) => f.action === "conflict").length
  if (!ctx.dryRun && results.length) ctx.out(c.dim(`Originals are in .ballmac/backup/${when}/`))
  return { items: results, conflicts }
}

function report(ctx: Ctx, results: ItemResult[]) {
  const verb = ctx.dryRun ? "would be " : ""
  for (const r of results) {
    ctx.out(`\n${c.bold(r.name)}  ${r.from} → ${c.green(r.to)}${ctx.dryRun ? c.dim("  (dry run)") : ""}`)
    for (const n of r.notes) ctx.out(c.dim(`  ${n}`))
    for (const f of r.files) {
      if (f.action === "same" || f.action === "keep") continue
      const text = label[f.action]
      const colored = f.action === "conflict" ? c.red(text) : f.action === "side-file" || f.action === "deleted" ? c.yellow(text) : c.green(text)
      const extra =
        f.action === "conflict"
          ? c.red(`  ${f.conflicts} conflict(s): search for <<<<<<< and choose`)
          : f.action === "merge"
            ? c.dim("  your changes kept")
            : f.action === "side-file"
              ? c.dim("  compare with the .ballmac-new file next to it")
              : f.action === "deleted"
                ? c.dim("  you deleted it")
                : ""
      ctx.out(`  ${colored} ${f.path}${extra}`)
    }
    const quiet = r.files.filter((f) => f.action === "same" || f.action === "keep").length
    if (quiet) ctx.out(c.dim(`  ${quiet} file(s) unchanged by this version`))
  }
  const total = results.flatMap((r) => r.files)
  const conflicts = total.filter((f) => f.action === "conflict").length
  const review = total.filter((f) => f.action === "side-file").length
  ctx.out(
    `\n${results.length} item(s) ${verb}updated.` +
      (conflicts ? c.red(` ${conflicts} file(s) have conflicts to resolve.`) : "") +
      (review ? c.yellow(` ${review} file(s) need a manual look (no base recorded).`) : "") +
      (ctx.dryRun ? c.dim("  Nothing was changed.") : "")
  )
  if (conflicts && !ctx.dryRun) ctx.out(c.dim("After resolving, run your tests (ballmac test) and commit."))
}

