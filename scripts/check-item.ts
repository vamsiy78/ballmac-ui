/**
 * Read-only check for one or more items while authoring (safe to run in parallel):
 * validates all metadata, then checks dependency truth and license headers for the named items.
 * It does not write any generated files.
 *
 * Usage: tsx scripts/check-item.ts button number-ticker
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { dependencyProblems, portabilityProblems } from "./check-deps"
import { loadItems } from "./lib"

const names = new Set(process.argv.slice(2))
if (!names.size) {
  console.error("Usage: tsx scripts/check-item.ts <name> [name…]")
  process.exit(2)
}
const items = await loadItems()
const missing = [...names].filter((n) => !items.some((i) => i.name === n))
const problems = missing.map((n) => `${n}: no item with this name (is <name>.meta.ts in place?)`)
problems.push(...dependencyProblems(items, names), ...portabilityProblems(items, names))
for (const item of items.filter((i) => names.has(i.name))) {
  const mentions = item.files.some((f) => /Based on /.test(readFileSync(join(item.baseDir, f.path), "utf8")))
  if (mentions !== !!item.source) problems.push(`${item.name}: "Based on …" file header and meta.source must go together`)
  for (const f of item.files) {
    const code = readFileSync(join(item.baseDir, f.path), "utf8")
    if (!code.startsWith("// Ballmac UI:") && !code.startsWith('"use client"')) problems.push(`${item.name}: ${f.path} must start with the "// Ballmac UI: …" header (after "use client" if present)`)
    if (/#[0-9a-fA-F]{3,8}\b/.test(code.replace(/\/\/.*$/gm, ""))) problems.push(`${item.name}: ${f.path} uses a hex color; use theme tokens`)
  }
  if (item.category !== "foundation" && !item.examples.length) problems.push(`${item.name}: needs at least one example (<name>-demo first)`)
  if (item.examples[0] && item.examples[0].name !== `${item.name}-demo`) problems.push(`${item.name}: first example must be "${item.name}-demo"`)
  if (!item.ai?.whenToUse?.length) problems.push(`${item.name}: ai.whenToUse is empty`)
}
if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n  - ${problems.join("\n  - ")}`)
  process.exit(1)
}
console.log(`✓ ${[...names].join(", ")}: metadata, dependencies and headers OK`)
