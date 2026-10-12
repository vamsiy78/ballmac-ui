/**
 * Copies Ballmac UI items (and everything they depend on) from the built registries into a starter app.
 *
 *   pnpm starter:vendor <starter-dir>            reads <starter-dir>/ballmac.vendor.json
 *
 * ballmac.vendor.json: { "items": ["button", "auth-pro-1"], "theme": "theme-indigo" }
 * or, to carry the feel, motion and focus rules too: { "stack": ["theme", "theme-indigo", "feel-auto", "motion-native"], "themeFile": "src/theme.css" }
 * Writes src/components/ballmac, src/lib/ballmac and src/hooks/ballmac, src/app/theme.css, and
 * ballmac.vendor.lock.json (items, sha-free file list and the npm packages with the registry's ranges).
 * Needs `pnpm build:registry` to have run, with Pro present for Pro items.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

const ROOT = join(import.meta.dirname, "..")
const FREE = join(ROOT, "apps/www/public/r")
const PRO = join(ROOT, "apps/www/.registry-pro")

type RegItem = {
  name: string
  type?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files?: { path: string; content: string; target?: string }[]
  cssVars?: { light?: Record<string, string>; dark?: Record<string, string>; theme?: Record<string, string> }
  css?: CssTree
}

type CssTree = { [selector: string]: string | CssTree }

/** Renders the `css` field of a registry item (selectors, at-rules and nested rules) as CSS text. */
export function renderCss(tree: CssTree, indent = ""): string {
  return Object.entries(tree)
    .map(([key, value]) =>
      typeof value === "string" ? `${indent}${key}: ${value};` : `${indent}${key} {\n${renderCss(value, indent + "  ")}\n${indent}}`
    )
    .join("\n")
}

/** Merges two css trees; rules with the same selector are merged, later values win. */
export function mergeCss(base: CssTree, over: CssTree): CssTree {
  const out: CssTree = { ...base }
  for (const [k, v] of Object.entries(over)) {
    const prev = out[k]
    out[k] = typeof v === "object" && typeof prev === "object" ? mergeCss(prev, v) : v
  }
  return out
}

/**
 * The stylesheet for a stack of theme items, later ones overriding earlier ones: a Tailwind `@theme` block, the light and dark
 * variables, then every rule the items carry (feel scopes, focus rings, reduced motion, forced colors).
 */
export function renderStack(names: string[], read: (n: string) => RegItem = load): string {
  const merged = { theme: {} as Record<string, string>, light: {} as Record<string, string>, dark: {} as Record<string, string> }
  let css: CssTree = {}
  for (const name of names) {
    const item = read(name)
    Object.assign(merged.theme, item.cssVars?.theme)
    Object.assign(merged.light, item.cssVars?.light)
    Object.assign(merged.dark, item.cssVars?.dark)
    if (item.css) css = mergeCss(css, item.css)
  }
  const vars = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `  --${k}: ${v};`).join("\n")
  return [
    `/* Generated from ${names.join(" + ")} by pnpm starter:vendor. Edit freely; re-running overwrites this file. */`,
    `@theme {\n${vars(merged.theme)}\n}`,
    `:root {\n${vars(merged.light)}\n}`,
    `.dark {\n${vars(merged.dark)}\n}`,
    renderCss(css),
    "",
  ].join("\n\n")
}

export function depName(ref: string) {
  return ref.replace(/^https?:\/\/[^/]+\/r\//, "").replace(/^@[a-z-]+\//, "").replace(/\.json$/, "")
}

function load(name: string): RegItem {
  for (const dir of [FREE, PRO]) {
    const f = join(dir, `${name}.json`)
    if (existsSync(f)) return JSON.parse(readFileSync(f, "utf8")) as RegItem
  }
  throw new Error(`Item "${name}" is not in the built registry. Run pnpm build:registry (with Pro present for Pro items).`)
}

export function targetPath(target: string): string {
  const m = target.match(/^@(components|lib|hooks)\/(.+)$/)
  if (!m) throw new Error(`Unsupported file target "${target}"`)
  return `src/${m[1]}/${m[2]}`
}

export function resolveClosure(items: string[], read: (n: string) => RegItem = load) {
  const seen = new Map<string, RegItem>()
  const visit = (name: string) => {
    if (name === "utils" || seen.has(name)) return
    const item = read(name)
    seen.set(name, item)
    for (const dep of item.registryDependencies ?? []) visit(depName(dep))
  }
  items.forEach(visit)
  return seen
}

function main() {
  const dir = resolve(process.argv[2] ?? "")
  const cfgPath = join(dir, "ballmac.vendor.json")
  if (!process.argv[2] || !existsSync(cfgPath)) {
    console.error("Usage: pnpm starter:vendor <starter-dir> (the folder needs ballmac.vendor.json)")
    process.exit(1)
  }
  const cfg = JSON.parse(readFileSync(cfgPath, "utf8")) as { items: string[]; theme?: string; stack?: string[]; themeFile?: string }
  const closure = resolveClosure(cfg.items)
  const versions = JSON.parse(readFileSync(join(ROOT, "registry/package.json"), "utf8")) as { dependencies: Record<string, string> }

  for (const sub of ["components/ballmac", "lib/ballmac", "hooks/ballmac"]) rmSync(join(dir, "src", sub), { recursive: true, force: true })
  const files: string[] = []
  const packages = new Map<string, string>()
  for (const item of closure.values()) {
    for (const f of item.files ?? []) {
      if (!f.target) continue
      const out = targetPath(f.target)
      mkdirSync(dirname(join(dir, out)), { recursive: true })
      writeFileSync(join(dir, out), f.content)
      files.push(out)
    }
    for (const d of item.dependencies ?? []) {
      const at = d.lastIndexOf("@")
      const [pkg, pinned] = at > 0 ? [d.slice(0, at), d.slice(at + 1)] : [d, undefined]
      const range = pinned ?? versions.dependencies[pkg]
      if (!range) throw new Error(`${item.name} needs ${d}, which is not in registry/package.json`)
      // radix-ui is declared as radix-ui@^1 by some items; the registry's own range is the tested one.
      packages.set(pkg, versions.dependencies[pkg] ?? range)
    }
  }

  if (cfg.stack?.length) {
    // `stack` also carries the feel, motion and focus rules, which `theme` alone does not.
    const out = join(dir, cfg.themeFile ?? "src/app/theme.css")
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, renderStack(cfg.stack))
  } else if (cfg.theme) {
    // The base theme carries the shared tokens (easing, durations, surface); the chosen preset overrides colours.
    const base = load("theme").cssVars ?? {}
    const preset = load(cfg.theme).cssVars ?? {}
    const merged = (key: "light" | "dark" | "theme") => ({ ...(base[key] ?? {}), ...(preset[key] ?? {}) })
    const vars = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `  --${k}: ${v};`).join("\n")
    const css = `/* Generated from ${cfg.theme} by pnpm starter:vendor. Edit freely; re-running overwrites this file. */\n:root {\n${vars({ ...merged("theme"), ...merged("light") })}\n}\n\n.dark {\n${vars(merged("dark"))}\n}\n`
    mkdirSync(join(dir, "src/app"), { recursive: true })
    writeFileSync(join(dir, "src/app/theme.css"), css)
  }

  // Keep package.json in step: add what the vendored items import (never lowers or removes anything).
  const pkgPath = join(dir, "package.json")
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { dependencies: Record<string, string> }
  for (const extra of ["clsx", "tailwind-merge"]) packages.set(extra, versions.dependencies[extra]!)
  const added: string[] = []
  for (const [name, range] of packages) if (!pkg.dependencies[name]) (pkg.dependencies[name] = range, added.push(name))
  pkg.dependencies = Object.fromEntries(Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
  if (added.length) console.log(`  added to package.json: ${added.join(", ")}`)

  const utils = join(dir, "src/lib/utils.ts")
  if (!existsSync(utils)) {
    mkdirSync(dirname(utils), { recursive: true })
    writeFileSync(utils, `import { clsx, type ClassValue } from "clsx"\nimport { twMerge } from "tailwind-merge"\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs))\n}\n`)
  }

  writeFileSync(
    join(dir, "ballmac.vendor.lock.json"),
    JSON.stringify({ items: [...closure.keys()].sort(), files: files.sort(), packages: Object.fromEntries([...packages].sort()) }, null, 2) + "\n"
  )
  console.log(`✓ vendored ${closure.size} items, ${files.length} files, ${packages.size} npm packages into ${dir}`)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) main()
