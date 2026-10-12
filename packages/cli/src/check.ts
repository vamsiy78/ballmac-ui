import { existsSync, readFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

import { DEFAULT_REGISTRY, Registry } from "./registry.js"
import { runtimeCheck, summariseRuntime, type RuntimeReport } from "./runtime.js"
import { CliError, c } from "./util.js"
import { audit, DOCS, formatGithub, formatPretty, RULES, type Catalog, type Report, type Style } from "./vendor/audit/index.js"

export type CheckOptions = {
  cwd: string
  paths: string[]
  format: "pretty" | "json" | "github"
  /** When to exit with failure: any error (default), any warning too, or never. */
  failOn: "error" | "warn" | "never"
  all: boolean
  /** Print the rules instead of auditing. */
  rules: boolean
  includeLibrary: boolean
  /** Do not ask the registry for the catalogue (the missing-state-prop rule is skipped). */
  offline: boolean
  /** Also check a running app in a real browser (needs playwright and axe-core in the project). */
  url?: string
  routes: string[]
  out: (line: string) => void
  /** For tests. */
  registry?: Registry
  runtime?: typeof runtimeCheck
}

const style: Style = { red: c.red, yellow: c.yellow, blue: c.cyan, green: c.green, dim: c.dim, bold: c.bold }

/** The folder to audit: the nearest one with a package.json at or above the current folder, else the current folder itself. */
export function auditRoot(cwd: string) {
  let dir = resolve(cwd)
  for (;;) {
    if (existsSync(join(dir, "package.json"))) return dir
    const parent = dirname(dir)
    if (parent === dir) return resolve(cwd)
    dir = parent
  }
}

async function loadCatalog(opts: CheckOptions, root: string): Promise<Catalog | undefined> {
  if (opts.offline) return undefined
  try {
    const lockPath = join(root, "ballmac.lock.json")
    const recorded = existsSync(lockPath) ? (JSON.parse(readFileSync(lockPath, "utf8")) as { registry?: string }).registry : undefined
    const registry = opts.registry ?? new Registry(process.env.BALLMAC_UI_URL ?? recorded ?? DEFAULT_REGISTRY, process.env.BALLMAC_LICENSE_KEY)
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timed out")), 8000).unref())
    const items = await Promise.race([registry.catalogue(), timeout])
    return Object.fromEntries(Object.entries(items).map(([name, i]) => [name, { exports: i.exports, states: i.states }]))
  } catch {
    return undefined
  }
}

export function formatRules(json: boolean) {
  if (json) return JSON.stringify(RULES, null, 2)
  const lines: string[] = []
  let area = ""
  for (const r of RULES) {
    if (r.area !== area) {
      area = r.area
      lines.push("", c.bold(area))
    }
    lines.push(`  ${r.id.padEnd(32)} ${r.defaultLevel.padEnd(5)} ${r.title}`)
  }
  lines.push("", c.dim(`Set a level in .ballmacrc.json: { "rules": { "tokens/hardcoded-color": "off" } }  ·  ${DOCS}`))
  return lines.join("\n").trimStart()
}

export type CheckResult = { report: Report; runtime?: RuntimeReport; failed: boolean }

export async function checkCommand(opts: CheckOptions): Promise<CheckResult> {
  if (opts.rules) {
    opts.out(formatRules(opts.format === "json"))
    return { report: { root: "", filesScanned: 0, filesParsed: 0, findings: [], counts: { error: 0, warn: 0, info: 0 }, byRule: {}, notes: [], rules: [] }, failed: false }
  }
  const root = auditRoot(opts.cwd)
  // Paths are given relative to where the command runs; the audit wants them relative to the project folder.
  const paths = opts.paths.map((p) => relative(root, resolve(opts.cwd, p)) || ".")
  const catalog = await loadCatalog(opts, root)
  const report = audit({ root, paths: paths.length ? paths : undefined, catalog, includeLibrary: opts.includeLibrary })

  let runtime: RuntimeReport | undefined
  if (opts.url) {
    try {
      runtime = await (opts.runtime ?? runtimeCheck)({ root, url: opts.url, routes: opts.routes })
    } catch (e) {
      if (e instanceof CliError) throw e
      throw new CliError(`The browser check failed: ${(e as Error).message}`)
    }
  }

  const runtimeProblems = runtime ? runtime.findings.length : 0
  const failed = opts.failOn === "never" ? false : report.counts.error + runtimeProblems > 0 || (opts.failOn === "warn" && report.counts.warn > 0)

  if (opts.format === "json") {
    opts.out(JSON.stringify({ ...report, ...(runtime ? { runtime } : {}) }, null, 2))
  } else if (opts.format === "github") {
    const text = formatGithub(report)
    if (text) opts.out(text)
    if (runtime) for (const f of runtime.findings) opts.out(`::error title=${f.rule}::${f.route} (${f.theme}, ${f.width}px): ${f.message}`)
  } else {
    opts.out(formatPretty(report, { style, all: opts.all }))
    if (runtime) opts.out("\n" + summariseRuntime(runtime, style))
  }
  return { report, runtime, failed }
}
