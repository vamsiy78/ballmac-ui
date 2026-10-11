import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { sha256, writeFile } from "./util.js"

export type Tier = "free" | "pro"

export type LockFile = {
  /** Content hash of the upstream version this file was installed or last updated from. `null` means unknown (see `ballmac track`). */
  base: string | null
  kind: "source" | "test"
}
export type LockItem = {
  version: string
  tier: Tier
  installedAt: string
  files: Record<string, LockFile>
}
export type Lock = {
  schema: 1
  registry: string
  items: Record<string, LockItem>
}

export const LOCK_NAME = "ballmac.lock.json"
const BASE_DIR = ".ballmac/base"

export const lockPath = (root: string) => join(root, LOCK_NAME)

export function readLock(root: string, registry: string): Lock {
  const p = lockPath(root)
  if (!existsSync(p)) return { schema: 1, registry, items: {} }
  const lock = JSON.parse(readFileSync(p, "utf8")) as Lock
  if (lock.schema !== 1) throw new Error(`${LOCK_NAME} has schema ${String(lock.schema)}; update @ballmac/cli.`)
  return lock
}

/** Stable key order so the file diffs cleanly in git. */
export function writeLock(root: string, lock: Lock) {
  const sorted: Lock = {
    schema: 1,
    registry: lock.registry,
    items: Object.fromEntries(
      Object.entries(lock.items)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, item]) => [name, { ...item, files: Object.fromEntries(Object.entries(item.files).sort(([a], [b]) => a.localeCompare(b))) }])
    ),
  }
  writeFileSync(lockPath(root), JSON.stringify(sorted, null, 2) + "\n")
}

/**
 * Keeps a copy of the upstream file as it was installed. That copy is the "base" of a three-way merge: what you changed is the
 * difference between it and your file; what Ballmac changed is the difference between it and the new version. Commit .ballmac/base.
 */
export function saveBase(root: string, content: string) {
  const hash = sha256(content)
  const dir = join(root, BASE_DIR)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
    writeFile(join(root, ".ballmac/.gitignore"), "backup/\n")
  }
  const file = join(dir, hash)
  if (!existsSync(file)) writeFileSync(file, content)
  return hash
}

export function readBase(root: string, hash: string | null) {
  if (!hash) return null
  const file = join(root, BASE_DIR, hash)
  return existsSync(file) ? readFileSync(file, "utf8") : null
}

/** Copies a file you are about to change into .ballmac/backup/<stamp>/ (ignored by git). */
export function backup(root: string, stamp: string, relPath: string, content: string) {
  writeFile(join(root, ".ballmac/backup", stamp, relPath), content)
}
