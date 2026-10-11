/**
 * Version discipline for the registry: `ballmac update` can only merge what changed if every change is a new version.
 *
 * Each item's files are hashed and compared with the committed lock (`registry/versions.lock.json`, and the private
 * `registry/pro/versions.lock.json` for Pro items):
 *   - files changed but `version` did not  -> error: bump the version and add a `changelog` entry
 *   - `version` bumped without a changelog -> error: say what changed
 *   - new items                            -> fine, recorded by `pnpm versions:write`
 *
 * Usage: tsx scripts/versions.ts [--write]      (`pnpm check` runs it without --write)
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { loadItems, ROOT, type LoadedItem } from "./lib"

export type LockEntry = { version: string; hash: string }
export type Lock = Record<string, LockEntry>

export const lockPath = (pro: boolean) => join(ROOT, pro ? "registry/pro/versions.lock.json" : "registry/versions.lock.json")

/** Hash of exactly what `ballmac add <item>` installs: every file's path and content, in path order. */
export function itemHash(item: LoadedItem) {
  const h = createHash("sha256")
  for (const f of [...item.files].sort((a, b) => a.path.localeCompare(b.path))) {
    h.update(f.path).update("\0").update(readFileSync(join(item.baseDir, f.path))).update("\0")
  }
  return h.digest("hex")
}

const compareVersions = (a: string, b: string) => {
  const x = a.split(".").map(Number)
  const y = b.split(".").map(Number)
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i]! - y[i]!
  return 0
}

export function readLock(pro: boolean): Lock | null {
  const p = lockPath(pro)
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as Lock) : null
}

export function versionProblems(items: LoadedItem[], lock: Lock | null) {
  const problems: string[] = []
  if (!lock) return problems
  for (const item of items) {
    const known = lock[item.name]
    if (!known) continue
    const hash = itemHash(item)
    const c = compareVersions(item.version, known.version)
    if (c < 0) problems.push(`${item.name}: version went back from ${known.version} to ${item.version}`)
    else if (c === 0 && hash !== known.hash) {
      problems.push(`${item.name}: its files changed but the version is still ${item.version}. Bump the version in ${item.name}.meta.ts and add a changelog entry saying what changed.`)
    } else if (c > 0 && !item.changelog.some((e) => e.version === item.version)) {
      problems.push(`${item.name}: version is ${item.version} but the changelog has no entry for it`)
    }
  }
  return problems
}

export function nextLock(items: LoadedItem[]): Lock {
  return Object.fromEntries(items.map((i) => [i.name, { version: i.version, hash: itemHash(i) }]).sort(([a], [b]) => String(a).localeCompare(String(b))))
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const write = process.argv.includes("--write")
  const items = await loadItems()
  let failed = false
  for (const pro of [false, true]) {
    const group = items.filter((i) => (i.tier === "pro") === pro)
    if (!group.length) continue
    const label = pro ? "Pro" : "free"
    const lock = readLock(pro)
    const problems = versionProblems(group, lock)
    if (problems.length) {
      failed = true
      console.error(`✗ ${label} versions:\n  - ${problems.join("\n  - ")}`)
      continue
    }
    if (write) {
      writeFileSync(lockPath(pro), JSON.stringify(nextLock(group), null, 2) + "\n")
      console.log(`✓ ${label} lock written: ${group.length} item(s) → ${lockPath(pro).replace(ROOT + "/", "")}`)
    } else if (!lock) {
      console.log(`- ${label}: no versions.lock.json yet (run pnpm versions:write); skipping the version check`)
    } else {
      const fresh = group.filter((i) => !lock[i.name]).length
      const bumped = group.filter((i) => lock[i.name] && compareVersions(i.version, lock[i.name]!.version) > 0).length
      console.log(`✓ ${label} versions: ${group.length} item(s) checked${bumped ? `, ${bumped} bumped` : ""}${fresh ? `, ${fresh} new (run pnpm versions:write to record)` : ""}`)
    }
  }
  if (failed) process.exit(1)
}
