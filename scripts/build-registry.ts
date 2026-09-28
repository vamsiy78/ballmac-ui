/**
 * Builds the Ballmac UI registry.
 *  1. Validates every *.meta.ts (packages/metadata/src/schema.ts).
 *  2. Writes shadcn-format registry.json (free) and registry-pro.json (Pro, never public).
 *  3. Runs the official `shadcn build` to produce apps/www/public/r/*.json.
 *  4. Writes apps/www/lib/generated/index.json and examples.ts for the website.
 *
 * Env: REGISTRY_URL (default https://ui.ballmac.com), used for registry dependencies.
 */
import { execFileSync } from "node:child_process"
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"

import { SCHEMA_VERSION } from "@ballmac-ui/metadata"

import { loadItems, ROOT, targetFor, type LoadedItem } from "./lib"

const REGISTRY_URL = (process.env.REGISTRY_URL ?? "https://ui.ballmac.com").replace(/\/$/, "")
const WWW = join(ROOT, "apps/www")

const defaultFileType: Record<string, string> = {
  "registry:ui": "registry:ui",
  "registry:component": "registry:component",
  "registry:block": "registry:component",
  "registry:hook": "registry:hook",
  "registry:lib": "registry:lib",
  "registry:page": "registry:page",
  "registry:file": "registry:file",
}

/** "shadcn:utils" -> "utils" (shadcn's registry); "button" -> Ballmac URL. */
function dep(name: string) {
  return name.startsWith("shadcn:") ? name.slice("shadcn:".length) : `${REGISTRY_URL}/r/${name}.json`
}

function toRegistryItems(item: LoadedItem) {
  const rel = (p: string) => relative(ROOT, p)
  const main = {
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    author: "Ballmac <https://ui.ballmac.com>",
    dependencies: item.dependencies.length ? item.dependencies : undefined,
    devDependencies: item.devDependencies.length ? item.devDependencies : undefined,
    registryDependencies: item.registryDependencies.length ? item.registryDependencies.map(dep) : undefined,
    files: item.files.length
      ? item.files.map((f) => ({
          path: rel(join(item.baseDir, f.path)),
          type: f.type ?? defaultFileType[item.type] ?? "registry:component",
          target: targetFor(f.path),
        }))
      : undefined,
    cssVars: item.cssVars,
    css: item.css,
    docs: item.docs,
    categories: [item.category, ...(item.blockCategory ? [item.blockCategory] : [])],
    meta: {
      schema: SCHEMA_VERSION,
      tier: item.tier,
      tags: item.tags,
      version: item.version,
      updated: item.updated,
      ai: item.ai,
      source: item.source,
      examples: item.examples.map((e) => e.name),
      url: `${REGISTRY_URL}/components/${item.name}`,
    },
  }
  const examples = item.examples.map((e) => ({
    name: e.name,
    type: "registry:example",
    title: `${item.title}: ${e.title}`,
    description: e.description ?? `${e.title} example of ${item.title}.`,
    registryDependencies: [dep(item.name)],
    files: [{ path: rel(join(item.examplesDir, e.file)), type: "registry:example", target: `@components/ballmac/examples/${e.file}` }],
    categories: [item.category],
    meta: { example: true, of: item.name, tier: item.tier },
  }))
  return [main, ...examples]
}

function writeRegistry(file: string, items: LoadedItem[]) {
  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "ballmac",
    homepage: REGISTRY_URL,
    items: items.flatMap(toRegistryItems),
  }
  writeFileSync(file, JSON.stringify(registry, null, 2) + "\n")
  return registry.items.length
}

function shadcnBuild(registryFile: string, output: string) {
  rmSync(output, { recursive: true, force: true })
  execFileSync(join(ROOT, "node_modules/.bin/shadcn"), ["build", registryFile, "--output", output], { cwd: ROOT, stdio: "inherit" })
}

const items = await loadItems()
const free = items.filter((i) => i.tier === "free")
const pro = items.filter((i) => i.tier === "pro")

const freeCount = writeRegistry(join(ROOT, "registry.json"), free)
shadcnBuild("registry.json", join(WWW, "public/r"))
if (pro.length) {
  writeRegistry(join(ROOT, "registry-pro.json"), pro)
  shadcnBuild("registry-pro.json", join(WWW, ".registry-pro"))
}

// Website index: metadata only (source code is read from disk at build time).
const generated = join(WWW, "lib/generated")
mkdirSync(generated, { recursive: true })
const index = items.map(({ metaPath, baseDir, examplesDir, ...meta }) => ({
  ...meta,
  files: meta.files.map((f) => ({ ...f, source: relative(ROOT, join(baseDir, f.path)), target: targetFor(f.path) })),
  examples: meta.examples.map((e) => ({ ...e, source: relative(ROOT, join(examplesDir, e.file)) })),
}))
writeFileSync(join(generated, "index.json"), JSON.stringify(index, null, 2) + "\n")

// Source code for the site's code tabs. Free items only: Pro source never enters the site bundle.
const sources: Record<string, string> = {}
for (const i of free) {
  for (const f of i.files) sources[relative(ROOT, join(i.baseDir, f.path))] = readFileSync(join(i.baseDir, f.path), "utf8")
  for (const e of i.examples) sources[relative(ROOT, join(i.examplesDir, e.file))] = readFileSync(join(i.examplesDir, e.file), "utf8")
}
writeFileSync(join(generated, "sources.json"), JSON.stringify(sources) + "\n")

// The site's tokens come from the theme item itself, so the site and @ballmac/theme can't drift.
const theme = items.find((i) => i.name === "theme")
if (theme?.cssVars) {
  const block = (vars: Record<string, string> = {}) => Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join("\n")
  writeFileSync(
    join(generated, "theme.css"),
    `/* Generated from registry/ballmac/themes/theme.meta.ts. Do not edit. */\n:root {\n${block(theme.cssVars.theme)}\n${block(theme.cssVars.light)}\n}\n\n.dark {\n${block(theme.cssVars.dark)}\n}\n`
  )
}

// Lazy map of example components for previews. Pro examples render only on the server.
const exampleEntries = items.flatMap((i) =>
  i.examples.map((e) => {
    const importPath = relative(join(generated), join(i.examplesDir, e.file)).replace(/\.tsx$/, "")
    return `  ${JSON.stringify(e.name)}: () => import(${JSON.stringify(importPath)}),`
  })
)
writeFileSync(
  join(generated, "examples.ts"),
  `// Generated by scripts/build-registry.ts. Do not edit.\nimport type { ComponentType } from "react"\n\nexport const examples: Record<string, () => Promise<{ default: ComponentType }>> = {\n${exampleEntries.join("\n")}\n}\n`
)

console.log(`\n✓ ${free.length} free item(s) → ${freeCount} registry entries (with examples) in apps/www/public/r`)
if (pro.length) console.log(`✓ ${pro.length} Pro item(s) → apps/www/.registry-pro (private)`)
