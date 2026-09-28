import { existsSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { pathToFileURL } from "node:url"

import { itemMeta, type ItemMeta } from "@ballmac-ui/metadata"

export const ROOT = join(import.meta.dirname, "..")
export const REGISTRY_DIRS = [
  { dir: join(ROOT, "registry/ballmac"), examples: join(ROOT, "registry/examples"), pro: false },
  // Private Pro source (git submodule, Phase 3). Absent in public clones.
  { dir: join(ROOT, "registry/pro/ballmac"), examples: join(ROOT, "registry/pro/examples"), pro: true },
]

export type LoadedItem = ItemMeta & { metaPath: string; baseDir: string; examplesDir: string }

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

/** Loads and validates every `*.meta.ts`. Throws with all problems listed at once. */
export async function loadItems(): Promise<LoadedItem[]> {
  const items: LoadedItem[] = []
  const errors: string[] = []
  for (const { dir, examples, pro } of REGISTRY_DIRS) {
    for (const metaPath of walk(dir).filter((f) => f.endsWith(".meta.ts")).sort()) {
      const mod = await import(pathToFileURL(metaPath).href)
      const parsed = itemMeta.safeParse(mod.default)
      const where = relative(ROOT, metaPath)
      if (!parsed.success) {
        for (const issue of parsed.error.issues) errors.push(`${where}: ${issue.path.join(".")} ${issue.message}`)
        continue
      }
      const item = parsed.data
      if (pro && item.tier !== "pro") errors.push(`${where}: items under registry/pro must be tier "pro"`)
      if (!pro && item.tier === "pro") errors.push(`${where}: Pro items must live in registry/pro`)
      for (const f of item.files) if (!existsSync(join(dir, f.path))) errors.push(`${where}: missing file ${f.path}`)
      for (const e of item.examples) if (!existsSync(join(examples, e.file))) errors.push(`${where}: missing example ${e.file}`)
      items.push({ ...item, metaPath, baseDir: dir, examplesDir: examples })
    }
  }
  const names = new Map<string, string>()
  for (const item of items) {
    for (const name of [item.name, ...item.examples.map((e) => e.name)]) {
      if (names.has(name)) errors.push(`duplicate name "${name}" (${names.get(name)} and ${item.name})`)
      names.set(name, item.name)
    }
  }
  for (const item of items) {
    for (const dep of item.registryDependencies) {
      if (!dep.startsWith("shadcn:") && !names.has(dep)) errors.push(`${item.name}: unknown registry dependency "${dep}"`)
    }
  }
  for (const item of items) {
    for (const ref of item.ai?.composesWith ?? []) {
      if (!names.has(ref) || names.get(ref) !== ref) errors.push(`${item.name}: ai.composesWith "${ref}" is not a Ballmac item`)
    }
  }
  if (errors.length) throw new Error(`Registry metadata has ${errors.length} problem(s):\n  - ${errors.join("\n  - ")}`)
  return items
}

/**
 * Install target through the user's aliases:
 *   components/x.tsx -> @components/ballmac/x.tsx (also hooks/, lib/)
 *   app/launch/page.tsx -> app/launch/page.tsx (template pages; the CLI maps app/ for the framework)
 */
export function targetFor(path: string): string {
  const [head, ...rest] = path.split("/")
  if (head === "app") return path
  const alias = { components: "components", hooks: "hooks", lib: "lib" }[head]
  if (!alias) throw new Error(`Unsupported file location "${path}" (use components/, hooks/, lib/ or app/)`)
  return `@${alias}/ballmac/${rest.join("/")}`
}

/** The import specifier a file is reachable at once installed: components/x.tsx -> @/components/ballmac/x */
export function importPathFor(path: string): string | null {
  const [head, ...rest] = path.split("/")
  if (!["components", "hooks", "lib"].includes(head)) return null
  return `@/${head}/ballmac/${rest.join("/")}`.replace(/\.(tsx?|jsx?)$/, "").replace(/\/index$/, "")
}
