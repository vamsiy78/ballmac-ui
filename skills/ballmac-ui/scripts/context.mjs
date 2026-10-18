#!/usr/bin/env node
// Ballmac UI agent skill: prints what is true about the current project, as JSON, so you do not guess.
// Read-only. No dependencies. Needs Node.js 20 or later.
//
//   node <skill>/scripts/context.mjs [project-folder]
//
// Reports the shadcn style and base library (Radix or Base UI), React, Next.js and Tailwind versions, whether Cache Components is on,
// whether @ballmac is configured, which Ballmac items are installed (and at which version), and what to do next.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

const start = resolve(process.argv[2] ?? process.cwd())

/** Walk up from the start folder until a components.json or package.json is found. */
function findRoot(from) {
  let dir = from
  for (;;) {
    if (existsSync(join(dir, "components.json"))) return dir
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  dir = from
  for (;;) {
    if (existsSync(join(dir, "package.json"))) return dir
    const parent = dirname(dir)
    if (parent === dir) return from
    dir = parent
  }
}

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"))
  } catch {
    return undefined
  }
}
const root = findRoot(start)
const pkg = readJson(join(root, "package.json"))
const components = readJson(join(root, "components.json"))
const lock = readJson(join(root, "ballmac.lock.json"))

const deps = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) }
const major = (range) => {
  const m = typeof range === "string" ? range.match(/(\d+)(?:\.(\d+))?/) : null
  return m ? Number(m[1]) : undefined
}
const installedVersion = (name) => readJson(join(root, "node_modules", name, "package.json"))?.version

const style = components?.style
const base = !style ? undefined : style.startsWith("base-") ? "base-ui" : style.startsWith("aria-") ? "react-aria" : "radix"
const tailwind = installedVersion("tailwindcss") ?? deps.tailwindcss
const next = installedVersion("next") ?? deps.next
const react = installedVersion("react") ?? deps.react

let cacheComponents
for (const f of ["next.config.ts", "next.config.mjs", "next.config.js", "next.config.cjs"]) {
  const p = join(root, f)
  if (existsSync(p)) {
    const src = readFileSync(p, "utf8")
    cacheComponents = /cacheComponents\s*:\s*true/.test(src)
    break
  }
}

/** Ballmac items on disk: the lock file is the truth when it exists; otherwise read the folders. */
function onDisk() {
  const out = new Set()
  for (const rel of ["components/ballmac", "src/components/ballmac"]) {
    const dir = join(root, rel)
    if (!existsSync(dir)) continue
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isFile() && /\.tsx?$/.test(e.name)) out.add(e.name.replace(/\.tsx?$/, ""))
      if (e.isDirectory() && e.name === "blocks") {
        for (const b of readdirSync(join(dir, e.name), { withFileTypes: true })) if (b.isDirectory()) out.add(b.name)
      }
    }
  }
  return [...out].sort()
}
const files = onDisk()
const tracked = lock?.items ? Object.fromEntries(Object.entries(lock.items).map(([name, i]) => [name, i.version])) : undefined

const aliases = components?.aliases
const registries = components?.registries ?? {}
const hasCss = (() => {
  const css = components?.tailwind?.css
  if (!css) return undefined
  const p = join(root, css)
  return existsSync(p) && statSync(p).isFile() ? readFileSync(p, "utf8") : undefined
})()

const notes = []
const next_steps = []
if (!pkg) notes.push("No package.json found here or above: run this from inside the project.")
if (!components) next_steps.push("No components.json: run `npx shadcn@latest init`, then add Ballmac items with `npx shadcn@latest add @ballmac/<name>`.")
if (major(react) && major(react) < 19) notes.push(`React ${react}: Ballmac UI needs React 19.`)
if (tailwind && major(tailwind) < 4) notes.push(`Tailwind ${tailwind}: Ballmac UI needs Tailwind CSS 4.`)
if (components && !("@ballmac" in registries))
  notes.push("@ballmac is not in components.json `registries`. Recent shadcn CLIs resolve it from the official directory; on an older one run `npx shadcn@latest registry add @ballmac=https://ui.ballmac.com/r/{name}.json`.")
if (cacheComponents === true) notes.push("Cache Components is on: never read the current time or randomness while rendering (Date.now, Math.random); do it in an effect or event handler.")
if (!files.length && components) next_steps.push("No Ballmac items installed yet. Search the catalogue (MCP `search_items`, or references/) and add with `npx shadcn@latest add @ballmac/<name>`.")
if (files.length && !tracked) next_steps.push("Installed items are not tracked. Run `npx @ballmac/cli track` so later versions can merge into your edits.")
if (!hasCss?.includes("--motion") && files.length) next_steps.push("No Ballmac theme tokens found in the global CSS. Optional: `npx shadcn@latest add @ballmac/theme`.")
next_steps.push("When you finish building UI, run `npx @ballmac/cli check` and fix every error.")

const result = {
  root,
  shadcn: components
    ? { style, base, baseColor: components.tailwind?.baseColor, iconLibrary: components.iconLibrary, rsc: components.rsc, aliases, css: components.tailwind?.css, registries: Object.keys(registries) }
    : null,
  stack: {
    react,
    next,
    tailwind,
    cacheComponents,
    packageManager: existsSync(join(root, "pnpm-lock.yaml")) ? "pnpm" : existsSync(join(root, "yarn.lock")) ? "yarn" : existsSync(join(root, "bun.lock")) || existsSync(join(root, "bun.lockb")) ? "bun" : "npm",
    primitives: { radix: Boolean(deps["radix-ui"]), baseUi: Boolean(deps["@base-ui/react"]), reactAria: Boolean(deps["react-aria-components"]) },
    motion: Boolean(deps.motion),
    charts: Boolean(deps.recharts),
  },
  ballmac: {
    installed: files,
    tracked,
    pro: Object.keys(registries).includes("@ballmac-pro"),
  },
  notes,
  next_steps,
}
console.log(JSON.stringify(result, null, 2))
