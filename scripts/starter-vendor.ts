/**
 * Copies Ballmac UI items (and everything they depend on) from the built registries into a starter app.
 *
 *   pnpm starter:vendor <starter-dir>            reads <starter-dir>/ballmac.vendor.json
 *
 * ballmac.vendor.json: { "items": ["button", "auth-pro-1"], "theme": "theme-indigo" }
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
  const cfg = JSON.parse(readFileSync(cfgPath, "utf8")) as { items: string[]; theme?: string }
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

  if (cfg.theme) {
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
