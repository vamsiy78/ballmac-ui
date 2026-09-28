/**
 * Dependency truth: every npm package an item's files import must be declared in
 * `dependencies`, every Ballmac import in `registryDependencies`, and nothing
 * declared may be unused. A registry that lies about dependencies breaks installs.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { importPathFor, loadItems, type LoadedItem } from "./lib"

// Provided by every React + shadcn project; never declared per item.
const IMPLICIT = new Set(["react", "react-dom", "next"])

function packageOf(spec: string) {
  const parts = spec.split("/")
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}
const stripVersion = (d: string) => d.replace(/(?<=.)@[^/]*$/, "")

export function dependencyProblems(items: LoadedItem[], only?: Set<string>) {
  const problems: string[] = []

  // Which item owns each installable import path.
  const owner = new Map<string, string>()
  for (const item of items) for (const f of item.files) {
    const spec = importPathFor(f.path)
    if (spec) owner.set(spec, item.name)
  }
  const resolveOwner = (spec: string) => owner.get(spec) ?? owner.get(`${spec}/index`)

  for (const item of items) {
    if (only && !only.has(item.name)) continue
    const usedPkgs = new Set<string>()
    const usedBallmac = new Set<string>()
    let usesUtils = false
    for (const f of item.files) {
      const code = readFileSync(join(item.baseDir, f.path), "utf8")
      for (const m of code.matchAll(/(?:import|export)[\s\S]*?from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)) {
        const spec = m[1] ?? m[2]
        if (spec.startsWith(".")) continue
        if (spec === "@/lib/utils") usesUtils = true
        else if (spec.startsWith("@/")) {
          const dep = resolveOwner(spec)
          if (dep && dep !== item.name) usedBallmac.add(dep)
          else if (!dep) problems.push(`${item.name}: imports "${spec}", which isn't a Ballmac item or @/lib/utils`)
        } else if (!IMPLICIT.has(packageOf(spec))) usedPkgs.add(packageOf(spec))
      }
    }
    const declared = new Set(item.dependencies.map(stripVersion))
    const declaredReg = new Set(item.registryDependencies)
    for (const p of usedPkgs) if (!declared.has(p)) problems.push(`${item.name}: imports "${p}" but doesn't declare it in dependencies`)
    for (const p of declared) if (!usedPkgs.has(p)) problems.push(`${item.name}: declares "${p}" but never imports it`)
    if (usesUtils && !declaredReg.has("shadcn:utils")) problems.push(`${item.name}: imports @/lib/utils; add "shadcn:utils" to registryDependencies`)
    if (!usesUtils && declaredReg.has("shadcn:utils")) problems.push(`${item.name}: declares shadcn:utils but never imports @/lib/utils`)
    for (const b of usedBallmac) if (!declaredReg.has(b)) problems.push(`${item.name}: imports Ballmac item "${b}" but doesn't declare it`)
    for (const d of declaredReg) if (!d.startsWith("shadcn:") && !usedBallmac.has(d) && item.type !== "registry:style") problems.push(`${item.name}: declares "${d}" but never imports it`)
  }
  return problems
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const items = await loadItems()
  const problems = dependencyProblems(items)
  if (problems.length) {
    console.error(`✗ Dependency check failed:\n  - ${problems.join("\n  - ")}`)
    process.exit(1)
  }
  console.log(`✓ Dependencies match imports for ${items.length} item(s)`)
}
