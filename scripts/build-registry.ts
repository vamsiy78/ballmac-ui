/**
 * Builds the Ballmac UI registry.
 *  1. Validates every *.meta.ts (packages/metadata/src/schema.ts).
 *  2. Writes shadcn-format registry.json (free) and registry-pro.json (Pro, never public).
 *  3. Runs the official `shadcn build` to produce apps/www/public/r/*.json.
 *  4. Writes apps/www/lib/generated/index.json and examples.ts for the website.
 *
 * Env: REGISTRY_URL (default https://ui.ballmac.com; the preview deploy sets the preview's address), used for registry dependencies.
 */
import { execFileSync } from "node:child_process"
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"

import { SCHEMA_VERSION } from "@ballmac-ui/metadata"
import { FONT_FACES } from "@ballmac-ui/theme-engine"

import { RULES } from "../packages/audit/src/rules/meta"
import { extractProps } from "./extract-props"
import { importPathFor, loadItems, ROOT, targetFor, type LoadedItem } from "./lib"
import { BASE_ONLY, BASE_UI_SPEC, baseDependencies, findVariants, type BaseVariant } from "./base-variants"
import { exportsOf, planTests, writeTests, writeVersions } from "./registry-extras"
import { registryUrl } from "./registry-url"

const REGISTRY_URL = registryUrl(process.env)
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
// Pro items are served by the private registry, which needs the licence key. The shadcn CLI only sends the key
// for a namespaced registry, so dependencies on Pro items are written as @ballmac-pro/<name>.
let proNames = new Set<string>()
let testPlan = new Map<string, unknown>()
// While the Base UI registry is being written, a dependency that has a Base UI variant points at it.
let baseNames = new Set<string>()
let baseMode = false
function dep(name: string) {
  if (name.startsWith("shadcn:")) return name.slice("shadcn:".length)
  if (baseMode && baseNames.has(name)) return `${REGISTRY_URL}/r/base/${name}.json`
  return proNames.has(name) ? `@ballmac-pro/${name}` : `${REGISTRY_URL}/r/${name}.json`
}

// Which item owns each installable import path (for example dependencies).
let owners = new Map<string, string>()
function exampleDependencies(item: LoadedItem, file: string) {
  const code = readFileSync(join(item.examplesDir, file), "utf8")
  const deps = new Set<string>([item.name])
  let utils = false
  for (const m of code.matchAll(/from\s+["'](@\/[^"']+)["']/g)) {
    if (m[1] === "@/lib/utils") utils = true
    const owner = owners.get(m[1]) ?? owners.get(`${m[1]}/index`)
    if (owner) deps.add(owner)
  }
  return [...[...deps].map(dep), ...(utils ? ["utils"] : [])]
}
const npmOf = (spec: string) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0])
// Version range for each npm package, taken from the items that declare it, so examples install the same major.
let specs = new Map<string, string>()
function exampleNpmDependencies(item: LoadedItem, file: string) {
  const code = readFileSync(join(item.examplesDir, file), "utf8")
  const pkgs = new Set<string>()
  for (const m of code.matchAll(/from\s+["']([^"'.@][^"']*|@[^/"'][^"']*)["']/g)) {
    const pkg = npmOf(m[1])
    if (!["react", "react-dom", "next"].includes(pkg)) pkgs.add(specs.get(pkg) ?? pkg)
  }
  return [...pkgs]
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
          type: f.type ?? (f.path.startsWith("app/") ? "registry:page" : defaultFileType[item.type] ?? "registry:component"),
          target: targetFor(f.path),
        }))
      : undefined,
    cssVars: item.cssVars,
    css: item.css,
    font: item.font,
    docs: item.docs,
    categories: [item.category, ...(item.blockCategory ? [item.blockCategory] : [])],
    meta: {
      schema: SCHEMA_VERSION,
      tier: item.tier,
      tags: item.tags,
      version: item.version,
      updated: item.updated,
      changelog: item.changelog.length ? item.changelog : undefined,
      tests: testPlan.has(item.name) ? true : undefined,
      ai: item.ai,
      states: item.states.length ? item.states : undefined,
      statesNone: item.statesNone,
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
    registryDependencies: exampleDependencies(item, e.file),
    dependencies: exampleNpmDependencies(item, e.file).length ? exampleNpmDependencies(item, e.file) : undefined,
    files: [{ path: rel(join(item.examplesDir, e.file)), type: "registry:example", target: `@components/ballmac/examples/${e.file}` }],
    categories: [item.category],
    meta: { example: true, of: item.name, tier: item.tier },
  }))
  return [main, ...examples]
}

/** The Base UI variant of an item and of its examples: the same item with its files, npm packages and registry dependencies swapped. */
/** The registry items a Base UI variant builds on: what the item declares, what its Base UI files import, and the Base UI helpers. */
function baseRegistryNames(v: BaseVariant) {
  const deps = new Set(v.item.registryDependencies)
  for (const file of v.swaps.values()) {
    for (const m of readFileSync(file, "utf8").matchAll(/from\s+["'](@\/[^"']+)["']/g)) {
      const owner = owners.get(m[1]!) ?? owners.get(`${m[1]}/index`)
      if (owner && owner !== v.item.name) deps.add(owner)
    }
  }
  for (const h of v.helpers) deps.add(h)
  return deps
}

function toBaseItems(v: BaseVariant) {
  const { item } = v
  const [main, ...examples] = toRegistryItems(item)
  const deps = baseRegistryNames(v)
  return [
    {
      ...main,
      dependencies: baseDependencies(item.dependencies),
      registryDependencies: [...deps].map(dep),
      files: main.files?.map((f, i) => {
        const swapped = v.swaps.get(item.files[i]!.path)
        return swapped ? { ...f, path: relative(ROOT, swapped) } : f
      }),
      meta: { ...main.meta, base: true },
    },
    ...examples.map((e) => ({ ...e, meta: { ...e.meta, base: true } })),
  ]
}

/** Helpers only Base UI needs: they have no Radix counterpart, so they are not catalog items. */
function baseOnlyItems() {
  return BASE_ONLY.map((h) => {
    const path = join(ROOT, "registry/ballmac/base", h.file)
    return {
      name: h.name,
      type: "registry:lib",
      title: h.title,
      description: h.description,
      author: "Ballmac <https://ui.ballmac.com>",
      dependencies: readFileSync(path, "utf8").includes("@base-ui/react") ? [BASE_UI_SPEC] : undefined,
      files: [{ path: relative(ROOT, path), type: "registry:lib", target: targetFor(h.file) }],
      categories: ["foundation"],
      meta: { schema: SCHEMA_VERSION, tier: "free", base: true, url: `${REGISTRY_URL}/docs/guides/base-ui` },
    }
  })
}

function writeBaseRegistry(file: string, variants: Map<string, BaseVariant>) {
  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "ballmac-base",
    homepage: REGISTRY_URL,
    items: [...[...variants.values()].flatMap(toBaseItems), ...baseOnlyItems()],
  }
  writeFileSync(file, JSON.stringify(registry, null, 2) + "\n")
  return registry.items.length
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
owners = new Map(items.flatMap((i) => i.files.map((f) => [importPathFor(f.path), i.name] as const)).filter((e): e is [string, string] => !!e[0]))
specs = new Map(
  items.flatMap((i) => i.dependencies).filter((d) => /^@?[^@]+@/.test(d)).map((d) => [npmOf(d.replace(/(.)@[^@/]*$/, "$1")), d] as const)
)
const free = items.filter((i) => i.tier === "free")
const pro = items.filter((i) => i.tier === "pro")
proNames = new Set(pro.map((i) => i.name))
testPlan = planTests(items)
// Free items and their examples must never pull in Pro code.
for (const i of free) {
  const proDep = i.registryDependencies.find((d) => proNames.has(d))
  if (proDep) throw new Error(`${i.name} is free but depends on the Pro item ${proDep}`)
  for (const e of i.examples) {
    for (const m of readFileSync(join(i.examplesDir, e.file), "utf8").matchAll(/from\s+["'](@\/[^"']+)["']/g)) {
      const owner = owners.get(m[1]!) ?? owners.get(`${m[1]}/index`)
      if (owner && proNames.has(owner)) throw new Error(`${e.name} (free) imports the Pro item ${owner}`)
    }
  }
}

const freeCount = writeRegistry(join(ROOT, "registry.json"), free)
shadcnBuild("registry.json", join(WWW, "public/r"))
// Base UI variants: public/r/base/<name>.json, served for /r/{style}/<name>.json when the style is a Base UI one (worker/routes/style.ts).
const variants = findVariants(free)
baseNames = new Set([...variants.keys(), ...BASE_ONLY.map((h) => h.name)])
baseMode = true
const baseCount = writeBaseRegistry(join(ROOT, "registry-base.json"), variants)
baseMode = false
shadcnBuild("registry-base.json", join(WWW, "public/r/base"))
writeFileSync(
  join(WWW, "public/r/base-manifest.json"),
  JSON.stringify({ schema: 1, base: BASE_UI_SPEC, items: [...variants.values()].map((v) => ({ name: v.item.name, version: v.item.version })), helpers: BASE_ONLY.map((h) => h.name) }, null, 2) + "\n"
)
console.log(`✓ ${variants.size} Base UI variant(s) → ${baseCount} entries in apps/www/public/r/base`)
// What `ballmac outdated`, `update` and `add --with-tests` read (see scripts/registry-extras.ts).
writeVersions(free, REGISTRY_URL, join(WWW, "public/r"))
const freeTests = writeTests(items, join(WWW, "public/r/tests"))
console.log(`✓ versions.json and ${freeTests} test file(s) → apps/www/public/r`)
if (pro.length) {
  writeRegistry(join(ROOT, "registry-pro.json"), pro)
  shadcnBuild("registry-pro.json", join(WWW, ".registry-pro"))
  writeVersions(pro, REGISTRY_URL, join(WWW, ".registry-pro"))
  console.log("✓ Pro versions.json → apps/www/.registry-pro (private)")
  // Pro starter apps are packed into the private build too, served only with a licence key (see /r/pro/starters).
  const startersDir = join(ROOT, "registry/pro/starters")
  rmSync(join(WWW, ".registry-pro/starters"), { recursive: true, force: true })
  if (existsSync(startersDir)) {
    for (const starter of readdirSync(startersDir).filter((n) => existsSync(join(startersDir, n, "package.json")))) {
      execFileSync("npx", ["tsx", "scripts/starter-pack.ts", starter, "--out", "apps/www/.registry-pro/starters", "--latest"], { cwd: ROOT, stdio: "inherit" })
    }
  }
  // The Figma design tokens (W3C format) for every theme, as a licensed download.
  const kits = join(WWW, ".registry-pro/kits")
  rmSync(kits, { recursive: true, force: true })
  mkdirSync(join(kits, "ballmac-figma-tokens"), { recursive: true })
  execFileSync("npx", ["tsx", "scripts/figma-tokens.ts", "--out", "apps/www/.registry-pro/kits/ballmac-figma-tokens"], { cwd: ROOT, stdio: "inherit" })
  execFileSync("tar", ["-czf", join(kits, "ballmac-figma-tokens.tar.gz"), "-C", kits, "ballmac-figma-tokens"], { stdio: "inherit" })
  rmSync(join(kits, "ballmac-figma-tokens"), { recursive: true, force: true })
} else {
  // No Pro source in this checkout: clear any earlier Pro build so removed items are not served.
  rmSync(join(WWW, ".registry-pro"), { recursive: true, force: true })
  rmSync(join(ROOT, "registry-pro.json"), { force: true })
}

// Website index: metadata only (source code is read from disk at build time).
const generated = join(WWW, "lib/generated")
mkdirSync(generated, { recursive: true })
const index = items.map(({ metaPath, baseDir, examplesDir, ...meta }) => ({
  ...meta,
  files: meta.files.map((f) => ({ ...f, source: relative(ROOT, join(baseDir, f.path)), target: targetFor(f.path) })),
  props: meta.files.filter((f) => f.path.endsWith(".tsx")).flatMap((f) => extractProps(readFileSync(join(baseDir, f.path), "utf8"), f.path)),
  // Whether a test ships with the item (`ballmac add --with-tests`).
  tests: testPlan.has(meta.name),
  // Whether the item also has a Base UI variant (registry/ballmac/base).
  base: variants.has(meta.name)
    ? {
        files: meta.files.map((f) => ({ source: relative(ROOT, variants.get(meta.name)!.swaps.get(f.path) ?? join(baseDir, f.path)), target: targetFor(f.path) })),
        dependencies: baseDependencies(meta.dependencies),
        registryDependencies: [...baseRegistryNames(variants.get(meta.name)!)].filter((d) => !d.startsWith("shadcn:")),
      }
    : false,
  // Export names of the main file, so Pro items can show an import line without their source.
  exports: meta.files[0] ? exportsOf(readFileSync(join(baseDir, meta.files[0].path), "utf8")) : [],
  examples: meta.examples.map((e) => ({ ...e, source: relative(ROOT, join(examplesDir, e.file)) })),
}))
writeFileSync(join(generated, "index.json"), JSON.stringify(index, null, 2) + "\n")

// The measured quality scorecards (registry/quality.json, written by `pnpm quality`), without the raw per-example numbers the pages do not use.
{
  const file = join(ROOT, "registry/quality.json")
  const q = existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as { schema: number; generated: string; tools: unknown; items: Record<string, { v: string; checks: unknown; size: unknown; ex: Record<string, unknown> }> }) : { schema: 1, generated: "", tools: {}, items: {} }
  const slim = { ...q, items: Object.fromEntries(Object.entries(q.items).map(([name, i]) => [name, { v: i.v, checks: i.checks, size: i.size, examples: Object.keys(i.ex ?? {}).length }])) }
  writeFileSync(join(generated, "quality.json"), JSON.stringify(slim) + "\n")
}

// The run history for /quality (registry/quality-history.json, appended by `pnpm quality`).
{
  const file = join(ROOT, "registry/quality-history.json")
  writeFileSync(join(generated, "quality-history.json"), (existsSync(file) ? readFileSync(file, "utf8").trim() : "[]") + "\n")
}

// The rules `ballmac check` applies, for the /docs/guides/check-your-app page. One list feeds the CLI, the MCP server and the docs.
writeFileSync(join(generated, "check-rules.json"), JSON.stringify(RULES, null, 2) + "\n")

// Source code for the site's code tabs. Free items only: Pro source never enters the site bundle.
const sources: Record<string, string> = {}
for (const i of free) {
  for (const f of i.files) sources[relative(ROOT, join(i.baseDir, f.path))] = readFileSync(join(i.baseDir, f.path), "utf8")
  for (const e of i.examples) sources[relative(ROOT, join(i.examplesDir, e.file))] = readFileSync(join(i.examplesDir, e.file), "utf8")
  for (const file of variants.get(i.name)?.swaps.values() ?? []) sources[relative(ROOT, file)] = readFileSync(file, "utf8")
}
for (const h of BASE_ONLY) sources[`registry/ballmac/base/${h.file}`] = readFileSync(join(ROOT, "registry/ballmac/base", h.file), "utf8")
writeFileSync(join(generated, "sources.json"), JSON.stringify(sources) + "\n")

// Every built-in string, with its English default, for translators: /i18n/en.json and the i18n docs page.
const messages: Record<string, string> = {}
for (const i of free) {
  for (const f of i.files) {
    const code = readFileSync(join(i.baseDir, f.path), "utf8")
    for (const m of code.matchAll(/msg(?:\.rich)?\(\s*"([^"]+)"\s*,\s*"((?:[^"\\]|\\.)*)"/g)) messages[m[1]!] = JSON.parse(`"${m[2]}"`)
    // Plural forms: msg("k", { one: "…", other: "…" }, { count })
    for (const m of code.matchAll(/msg\(\s*"([^"]+)"\s*,\s*\{([^}]*)\}/g))
      for (const form of m[2]!.matchAll(/(zero|one|two|few|many|other)\s*:\s*"((?:[^"\\]|\\.)*)"/g)) messages[`${m[1]}_${form[1]}`] = JSON.parse(`"${form[2]}"`)
  }
}
const sortedMessages = Object.fromEntries(Object.entries(messages).sort(([a], [b]) => a.localeCompare(b)))
mkdirSync(join(WWW, "public/i18n"), { recursive: true })
writeFileSync(join(WWW, "public/i18n/en.json"), JSON.stringify(sortedMessages, null, 2) + "\n")
writeFileSync(join(generated, "messages.json"), JSON.stringify(sortedMessages) + "\n")
console.log(`✓ ${Object.keys(sortedMessages).length} translatable message(s) → apps/www/public/i18n/en.json`)

// Items that keep a fixed layout in right-to-left, with the reason (shown on the RTL docs page).
{
  const exceptions = JSON.parse(readFileSync(join(ROOT, "scripts/rtl-exceptions.json"), "utf8")) as { file: string; reason: string }[]
  const byName = exceptions.flatMap((e) => {
    const item = items.find((i) => i.files.some((f) => join("registry/ballmac", f.path) === e.file))
    return item ? [{ name: item.name, title: item.title, reason: e.reason }] : []
  })
  writeFileSync(join(generated, "rtl-exceptions.json"), JSON.stringify(byName) + "\n")
}

// The site's tokens come from the theme item itself, so the site and @ballmac/theme can't drift.
const theme = items.find((i) => i.name === "theme")
if (theme?.cssVars) {
  const block = (vars: Record<string, string> = {}) => Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join("\n")
  // `theme` keys are Tailwind theme keys (duration scales, easings, shadows), so they belong in @theme, not :root.
  // `css` holds at-rules such as `@media` (selectors nested inside) and plain selector rules (properties directly inside).
  const decls = (props: Record<string, string>, indent: string) => Object.entries(props).map(([k, v]) => `${indent}${k}: ${v};`).join("\n")
  const atRules = Object.entries((theme.css ?? {}) as Record<string, Record<string, string | Record<string, string>>>).map(([rule, body]) => {
    if (Object.values(body).every((v) => typeof v === "string")) return `${rule} {\n${decls(body as Record<string, string>, "  ")}\n}`
    return `${rule} {\n${Object.entries(body).map(([sel, vars]) => `  ${sel} {\n${decls(vars as Record<string, string>, "    ")}\n  }`).join("\n")}\n}`
  })
  // The scoped feel blocks (`[data-feel="macos"] { ... }`) from the Feel Auto item, so any part of the site can show any feel.
  const auto = items.find((i) => i.name === "feel-auto")
  const scopes = Object.entries((auto?.css ?? {}) as Record<string, Record<string, string>>)
    .filter(([sel]) => sel.startsWith("[data-feel="))
    .map(([sel, props]) => `${sel} {\n${decls(props, "  ")}\n}`)
  writeFileSync(
    join(generated, "theme.css"),
    `/* Generated from registry/ballmac/themes/theme.meta.ts. Do not edit. */\n:root {\n${block(theme.cssVars.light)}\n}\n\n.dark {\n${block(theme.cssVars.dark)}\n}\n\n@theme inline {\n${block(theme.cssVars.theme)}\n}\n${atRules.length ? "\n" + atRules.join("\n\n") + "\n" : ""}${scopes.length ? "\n" + scopes.join("\n\n") + "\n" : ""}`
  )
}

// The typefaces a theme can ask for, for the site's previews: only the Latin file of each, copied from its Fontsource package, and the @font-face rules for
// them. A declared face costs nothing until text uses it, so the page downloads only the fonts it shows.
{
  const dir = join(WWW, "public/fonts")
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const rules = FONT_FACES.map((f) => {
    const from = join(WWW, "node_modules", f.dependency, "files", f.latinFile)
    if (!existsSync(from)) throw new Error(`${f.dependency} has no ${f.latinFile}: run pnpm install`)
    cpSync(from, join(dir, f.latinFile))
    return `@font-face {\n  font-family: '${f.fontFamily}';\n  font-style: normal;\n  font-display: swap;\n  font-weight: 100 900;\n  src: url(/fonts/${f.latinFile}) format('woff2-variations');\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n}`
  })
  writeFileSync(join(generated, "fonts.css"), `/* Generated by scripts/build-registry.ts from the theme engine's FONT_FACES. Do not edit. */\n${rules.join("\n")}\n`)
  console.log(`✓ ${FONT_FACES.length} typefaces → apps/www/public/fonts`)
}

// Lazy map of Pro example components for previews. Pro examples render only on the server.
// Free examples are not listed here: any import reachable from a page is bundled for it, so they live in examples-client.tsx.
const exampleEntries = pro.flatMap((i) =>
  i.examples.map((e) => {
    const importPath = relative(join(generated), join(i.examplesDir, e.file)).replace(/\.tsx$/, "")
    return `  ${JSON.stringify(e.name)}: () => import(${JSON.stringify(importPath)}),`
  })
)
writeFileSync(
  join(generated, "examples.ts"),
  `// Generated by scripts/build-registry.ts. Do not edit.\nimport type { ComponentType } from "react"\n\nexport const examples: Record<string, () => Promise<{ default: ComponentType }>> = {\n${exampleEntries.join("\n")}\n}\n`
)

// Client-side lazy map for free examples: each example is its own chunk, so a page only downloads the examples it shows.
const clientEntries = free.flatMap((i) =>
  i.examples.map((e) => {
    const importPath = relative(join(generated), join(i.examplesDir, e.file)).replace(/\.tsx$/, "")
    return `  ${JSON.stringify(e.name)}: dynamic(() => import(${JSON.stringify(importPath)})),`
  })
)
writeFileSync(
  join(generated, "examples-client.tsx"),
  `// Generated by scripts/build-registry.ts. Do not edit.\n"use client"\n\nimport dynamic from "next/dynamic"\nimport type { ComponentType } from "react"\n\nconst examples: Record<string, ComponentType> = {\n${clientEntries.join("\n")}\n}\n\n/** Renders one free example. Only that example's code is downloaded. */\nexport function ExampleRenderer({ name }: { name: string }) {\n  const Example = examples[name]\n  return Example ? <Example /> : null\n}\n`
)
writeFileSync(
  join(generated, "example-names.ts"),
  `// Generated by scripts/build-registry.ts. Do not edit.\nexport const freeExampleNames: ReadonlySet<string> = new Set(${JSON.stringify(free.flatMap((i) => i.examples.map((e) => e.name)))})\n`
)

console.log(`\n✓ ${free.length} free item(s) → ${freeCount} registry entries (with examples) in apps/www/public/r`)
if (pro.length) console.log(`✓ ${pro.length} Pro item(s) → apps/www/.registry-pro (private)`)

// Gallery thumbnails of Pro items live in the private repo (registry/pro/thumbs); the site build serves them from public/thumbs/pro (git-ignored).
const proThumbs = join(ROOT, "registry/pro/thumbs")
rmSync(join(ROOT, "apps/www/public/thumbs/pro"), { recursive: true, force: true })
if (existsSync(proThumbs)) {
  cpSync(proThumbs, join(ROOT, "apps/www/public/thumbs/pro"), { recursive: true })
  console.log("✓ Pro gallery thumbnails → apps/www/public/thumbs/pro")
}
