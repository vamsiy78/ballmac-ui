/**
 * Base UI parity: every file under registry/ballmac/base belongs to an item (or is one of the listed helpers), none imports Radix UI, and every item
 * that depends on Radix UI has a Base UI variant, so no component is left behind. The same tests run against both variants (`pnpm --filter
 * @ballmac-ui/registry test:base`).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

import { BASE_ONLY, BASE_UI_SPEC, findVariants } from "./base-variants"
import { loadItems, ROOT } from "./lib"

const BASE = join(ROOT, "registry/ballmac/base")

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const items = (await loadItems()).filter((i) => i.tier === "free")
const variants = findVariants(items)
const problems: string[] = []

const known = new Set<string>([...BASE_ONLY.map((h) => join(BASE, h.file))])
for (const v of variants.values()) for (const file of v.swaps.values()) known.add(file)

for (const file of walk(BASE).filter((f) => /\.tsx?$/.test(f))) {
  const rel = relative(ROOT, file)
  if (!known.has(file)) problems.push(`${rel}: has no item to belong to. Put it at the same path as the Radix file it replaces, or list it in scripts/base-variants.ts.`)
  const code = readFileSync(file, "utf8")
  if (/from\s+["'](radix-ui|@radix-ui\/)/.test(code)) problems.push(`${rel}: imports Radix UI. A Base UI variant uses @base-ui/react.`)
  if (/\bdata-\[state=(open|closed|checked|unchecked|active|inactive|on|off)\]/.test(code)) problems.push(`${rel}: uses a Radix data-state selector. Base UI sets data-open, data-checked, data-active and the like.`)
}
for (const h of BASE_ONLY) if (!existsSync(join(BASE, h.file))) problems.push(`scripts/base-variants.ts: ${h.name} points at the missing file base/${h.file}.`)

for (const item of items) {
  if (item.dependencies.some((d) => /^(radix-ui|@radix-ui\/)/.test(d)) && !variants.has(item.name)) {
    problems.push(`${item.name}: depends on Radix UI but has no Base UI variant. Add one under registry/ballmac/base.`)
  }
}

const pkg = JSON.parse(readFileSync(join(ROOT, "registry/package.json"), "utf8")) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
const installed = pkg.dependencies?.["@base-ui/react"] ?? pkg.devDependencies?.["@base-ui/react"]
if (installed !== BASE_UI_SPEC.split("@base-ui/react@")[1]) problems.push(`registry/package.json tests @base-ui/react ${installed}, but the variants ask users for ${BASE_UI_SPEC}. Keep them the same.`)

if (problems.length) {
  console.error(`✗ Base UI: ${problems.length} problem(s)\n  - ${problems.join("\n  - ")}`)
  process.exit(1)
}
console.log(`✓ Base UI: ${variants.size} variant(s) and ${BASE_ONLY.length} helper(s) in step with the Radix items`)
