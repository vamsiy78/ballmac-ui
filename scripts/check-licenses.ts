/**
 * License provenance: any file that says it is "Based on" outside code must belong to
 * an item with meta.source, and vice versa. Also regenerates THIRD_PARTY_NOTICES.md.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { loadItems, ROOT } from "./lib"

const items = await loadItems()
const problems: string[] = []
for (const item of items) {
  const mentions = item.files.some((f) => /Based on /.test(readFileSync(join(item.baseDir, f.path), "utf8")))
  if (mentions && !item.source) problems.push(`${item.name}: a file says "Based on …" but meta.source is missing`)
  if (item.source && !mentions) problems.push(`${item.name}: meta.source is set but no file header credits ${item.source.name}`)
}
if (problems.length) {
  console.error(`✗ License check failed:\n  - ${problems.join("\n  - ")}`)
  process.exit(1)
}

const credited = items.filter((i) => i.source && i.tier === "free")
const notices = [
  "# Third-party notices",
  "",
  "Ballmac UI (MIT) includes code adapted from the projects below. Their notices are preserved in each file header.",
  "",
  ...credited.map((i) => `- **${i.title}** (\`${i.name}\`) is based on [${i.source!.name}](${i.source!.url}), ${i.source!.license}, ${i.source!.copyright}.`),
  "",
]
writeFileSync(join(ROOT, "THIRD_PARTY_NOTICES.md"), notices.join("\n"))
console.log(`✓ License provenance OK (${credited.length} credited item(s)); THIRD_PARTY_NOTICES.md updated`)
