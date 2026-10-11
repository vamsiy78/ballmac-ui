import { existsSync, readFileSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"

import { CliError, readJson } from "./util.js"

type ComponentsJson = {
  aliases?: Record<string, string>
  registries?: Record<string, unknown>
  [key: string]: unknown
}
type TsConfig = { compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> } }

export type Project = {
  root: string
  componentsJson: ComponentsJson
  /** Where an import alias such as "@/components" lives, relative to the project root (posix separators). */
  aliasDir: (alias: string) => string
  /** The "@" in "@/components/ballmac/button": what the project's own alias prefix is. */
  importPrefix: string
  packageManager: "pnpm" | "npm" | "yarn" | "bun"
}

/** Walks up from `cwd` to the folder with components.json (the shadcn project root). */
export function findRoot(cwd: string) {
  let dir = resolve(cwd)
  for (;;) {
    if (existsSync(join(dir, "components.json"))) return dir
    const parent = dirname(dir)
    if (parent === dir) throw new CliError("No components.json found. Run this inside a shadcn project (set one up with: npx shadcn@latest init).")
    dir = parent
  }
}

const posix = (p: string) => p.split(sep).join("/")

function readTsConfig(root: string): TsConfig {
  for (const name of ["tsconfig.json", "jsconfig.json"]) {
    const p = join(root, name)
    if (existsSync(p)) return readJson<TsConfig>(p)
  }
  return {}
}

/** Maps an import alias like "@/components" to a folder through tsconfig "paths". With no mapping, "@/" means the project root. */
export function aliasToDir(root: string, alias: string, ts: TsConfig = readTsConfig(root)) {
  const base = ts.compilerOptions?.baseUrl ?? "."
  for (const [pattern, targets] of Object.entries(ts.compilerOptions?.paths ?? {})) {
    const target = targets[0]
    if (!target) continue
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -1) // "@/"
      if (alias.startsWith(prefix) || alias === prefix.slice(0, -1)) {
        const rest = alias.slice(prefix.length)
        return posix(join(base, target.replace(/\*$/, ""), rest)).replace(/^\.\//, "")
      }
    } else if (pattern === alias) return posix(join(base, target)).replace(/^\.\//, "")
  }
  return alias.replace(/^[@~]\//, "")
}

function detectPackageManager(root: string): Project["packageManager"] {
  let dir = root
  for (;;) {
    if (existsSync(join(dir, "pnpm-lock.yaml"))) return "pnpm"
    if (existsSync(join(dir, "bun.lock")) || existsSync(join(dir, "bun.lockb"))) return "bun"
    if (existsSync(join(dir, "yarn.lock"))) return "yarn"
    if (existsSync(join(dir, "package-lock.json"))) return "npm"
    const parent = dirname(dir)
    if (parent === dir) return "npm"
    dir = parent
  }
}

export function loadProject(cwd: string): Project {
  const root = findRoot(cwd)
  const componentsJson = readJson<ComponentsJson>(join(root, "components.json"))
  const ts = readTsConfig(root)
  const aliases = componentsJson.aliases ?? {}
  return {
    root,
    componentsJson,
    aliasDir: (alias) => aliasToDir(root, alias, ts),
    importPrefix: (aliases.components ?? "@/components").split("/")[0] ?? "@",
    packageManager: detectPackageManager(root),
  }
}

/**
 * A registry file target such as "@components/ballmac/button.tsx" or "app/launch/page.tsx", as a path from the project root.
 * Page targets live in src/app when the project has a src folder.
 */
export function resolveTarget(project: Project, target: string) {
  const m = /^@(components|ui|lib|hooks|utils)\/(.*)$/.exec(target)
  if (m) {
    const alias = project.componentsJson.aliases?.[m[1]!] ?? `@/${m[1]}`
    return `${project.aliasDir(alias)}/${m[2]}`
  }
  if (target.startsWith("~/")) return target.slice(2)
  if (target.startsWith("app/") || target.startsWith("pages/")) {
    return existsSync(join(project.root, "src")) ? `src/${target}` : target
  }
  return target
}

export const absolute = (project: Project, rel: string) => join(project.root, rel)
export const relativeTo = (project: Project, abs: string) => posix(relative(project.root, abs))

/** The folder the shipped tests are installed in: next to the components, in `__tests__`. */
export const testsDir = (project: Project) => `${resolveTarget(project, "@components/ballmac")}/__tests__`

export function readEnvFile(root: string, name: string) {
  for (const file of [".env.local", ".env"]) {
    const p = join(root, file)
    if (!existsSync(p)) continue
    const m = new RegExp(`^\\s*${name}\\s*=\\s*(.*)$`, "m").exec(readFileSync(p, "utf8"))
    if (m) return m[1]!.trim().replace(/^["']|["']$/g, "")
  }
  return undefined
}
