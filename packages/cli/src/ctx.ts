import { readFileSync } from "node:fs"

import { readBase, saveBase, type Lock, type LockItem } from "./lock.js"
import { absolute, resolveTarget, type Project } from "./project.js"
import type { ManifestItem, Registry } from "./registry.js"
import type { Preview, Shadcn } from "./shadcn.js"
import { exists, sha256 } from "./util.js"

export type Ctx = {
  project: Project
  registry: Registry
  shadcn: Shadcn
  out: (line: string) => void
  warn: (line: string) => void
  /** Show what would happen and change nothing. */
  dryRun?: boolean
  /** Fixed clock for tests. */
  now?: () => Date
}

export type Catalogue = Record<string, ManifestItem>

/** An item plus the Ballmac items it installs with it, each once. */
export function closure(catalogue: Catalogue, names: string[]) {
  const seen = new Set<string>()
  const visit = (n: string) => {
    if (seen.has(n) || !catalogue[n]) return
    seen.add(n)
    for (const d of catalogue[n]!.requires) visit(d)
  }
  names.forEach(visit)
  return [...seen]
}

/** The project paths an item installs. */
export const sourceFiles = (ctx: Ctx, item: ManifestItem) => item.files.map((t) => resolveTarget(ctx.project, t))

export const readText = (ctx: Ctx, rel: string) => (exists(absolute(ctx.project, rel)) ? readFileSync(absolute(ctx.project, rel), "utf8") : null)

export const stamp = (ctx: Ctx) => (ctx.now?.() ?? new Date()).toISOString().replace(/[:.]/g, "-")

export const isoNow = (ctx: Ctx) => (ctx.now?.() ?? new Date()).toISOString()

/** Everything ballmac records about a file you could have changed. */
export function fileState(ctx: Ctx, rel: string, base: string | null) {
  const ours = readText(ctx, rel)
  const baseText = readBase(ctx.project.root, base)
  return { ours, baseText, modified: ours !== null && baseText !== null ? ours !== baseText : null }
}

/**
 * Records items in the lock right after they were installed (or found already installed).
 *
 *   - a file that did not exist before the install is exactly what shadcn wrote, so it is the base;
 *   - a file that already existed was skipped by shadcn, so it is the base only if it equals what shadcn would write now;
 *     otherwise its base is unknown (see `ballmac track`).
 *
 * `existedBefore` lists project paths that were on disk before the install ran.
 * Returns whether shadcn's preview matched the files it just wrote, which proves the preview can be trusted for updates.
 */
export function recordItems(ctx: Ctx, lock: Lock, names: string[], catalogue: Catalogue, existedBefore: Set<string>, preview: Preview | null) {
  let verified = true
  for (const name of names) {
    const item = catalogue[name]!
    const files: LockItem["files"] = lock.items[name]?.files ?? {}
    for (const rel of sourceFiles(ctx, item)) {
      if (files[rel]) continue
      const ours = readText(ctx, rel)
      if (ours === null) continue
      const theirs = preview?.get(rel)?.content
      if (!existedBefore.has(rel)) {
        if (theirs !== undefined && theirs !== ours) verified = false
        files[rel] = { base: saveBase(ctx.project.root, ours), kind: "source" }
      } else if (theirs !== undefined && theirs === ours) {
        files[rel] = { base: saveBase(ctx.project.root, ours), kind: "source" }
      } else {
        files[rel] = { base: null, kind: "source" }
      }
    }
    if (Object.keys(files).length) lock.items[name] = { version: lock.items[name]?.version ?? item.version, tier: item.tier, installedAt: lock.items[name]?.installedAt ?? isoNow(ctx), files }
  }
  return verified
}

export const hashOf = (text: string) => sha256(text)
