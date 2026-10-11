/**
 * Bumps item versions and writes the changelog entry the version check asks for.
 *
 *   tsx scripts/bump.ts --note "What changed" [--minor | --major] --changed
 *   tsx scripts/bump.ts --note "What changed" [--minor | --major] button card
 *
 * `--changed` picks every item whose files differ from the committed lock while its version is unchanged: exactly the items
 * `pnpm check` would reject. Default bump is a patch.
 */
import { readFileSync, writeFileSync } from "node:fs"

import { loadItems, type LoadedItem } from "./lib"
import { itemHash, readLock } from "./versions"

export function nextVersion(version: string, kind: "patch" | "minor" | "major") {
  const [a = 0, b = 0, c = 0] = version.split(".").map(Number)
  return kind === "major" ? `${a + 1}.0.0` : kind === "minor" ? `${a}.${b + 1}.0` : `${a}.${b}.${c + 1}`
}

/** Rewrites an item's meta source: new version, date, and a changelog entry on top. */
export function bumpSource(source: string, from: string, to: string, date: string, note: string, breaking = false): string {
  const escaped = note.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  const entry = `    { version: "${to}", date: "${date}", note: "${escaped}"${breaking ? ", breaking: true" : ""} },`
  const before = source.match(/updated: "(\d{4}-\d{2}-\d{2})",/)?.[1] ?? date
  const out = source.replace(/version: "\d+\.\d+\.\d+",/, `version: "${to}",`).replace(/updated: "\d{4}-\d{2}-\d{2}",/, `updated: "${date}",`)
  // A one-line log (`changelog: [{ ... }],`) becomes multi-line with the new entry on top.
  const inline = out.match(/changelog: \[(\{.*\})\],/)
  if (inline) return out.replace(inline[0], `changelog: [\n${entry}\n    ${inline[1]},\n  ],`)
  if (/changelog: \[/.test(out)) return out.replace(/changelog: \[\n/, `changelog: [\n${entry}\n`)
  // Only a 1.0.0 item has a known history to record; for anything later the log starts with this entry.
  const first = from === "1.0.0" ? `\n    { version: "1.0.0", date: "${before}", note: "First release." },` : ""
  return out.replace(/(updated: "\d{4}-\d{2}-\d{2}",\n)/, `$1  changelog: [\n${entry}${first}\n  ],\n`)
}

function changed(items: LoadedItem[]) {
  return items.filter((item) => {
    const known = readLock(item.tier === "pro")?.[item.name]
    return known && known.version === item.version && known.hash !== itemHash(item)
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const flag = (n: string) => args.includes(`--${n}`)
  const noteAt = args.indexOf("--note")
  const note = noteAt > -1 ? args[noteAt + 1] : undefined
  const names = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--note")
  if (!note || note.length < 10 || (!flag("changed") && !names.length)) {
    console.error('usage: tsx scripts/bump.ts --note "What changed (10+ characters)" [--minor|--major] (--changed | <item>...)')
    process.exit(1)
  }
  const kind = flag("major") ? "major" : flag("minor") ? "minor" : "patch"
  const date = new Date().toISOString().slice(0, 10)
  const items = await loadItems()
  const picked = flag("changed") ? changed(items) : items.filter((i) => names.includes(i.name))
  const missing = names.filter((n) => !items.some((i) => i.name === n))
  if (missing.length) {
    console.error(`unknown item(s): ${missing.join(", ")}`)
    process.exit(1)
  }
  for (const item of picked) {
    const to = nextVersion(item.version, kind)
    writeFileSync(item.metaPath, bumpSource(readFileSync(item.metaPath, "utf8"), item.version, to, date, note, flag("major")))
    console.log(`✓ ${item.name} ${item.version} → ${to}`)
  }
  console.log(`${picked.length} item(s) bumped. Run pnpm versions:write after pnpm check to record them.`)
}
