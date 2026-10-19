import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { builtinModules } from "node:module"
import { tmpdir } from "node:os"
import { basename, dirname, join, resolve } from "node:path"

import { CliError, c } from "./util.js"
import { audit, loadTypescript } from "./vendor/audit/index.js"

/**
 * `ballmac verify`: scores any shadcn-compatible registry on what can be checked without running a browser, and says exactly how. The same checks
 * run on Ballmac's own registry, so a score from here is comparable with ours. Nothing is sent anywhere: the registry is read and the files are
 * audited in a temporary folder.
 */

export type RegistryFile = { path?: string; type?: string; target?: string; content?: string }
export type RegistryItem = {
  name: string
  type: string
  title?: string
  description?: string
  author?: string
  license?: string
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  files?: RegistryFile[]
  docs?: string
  meta?: Record<string, unknown>
}
export type RegistrySource = {
  name?: string
  homepage?: string
  /** Where it was read from, shown on the scorecard. */
  source: string
  items: RegistryItem[]
  /** The full item (with file contents) when the catalog lists it without them. */
  fetchItem: (name: string) => Promise<RegistryItem | undefined>
}

export type CheckId = "schema" | "describe" | "deps" | "a11y" | "tokens" | "states" | "motion" | "rtl" | "docs" | "author"
export type Outcome = "pass" | "fail" | "na"

type CheckDef = { id: CheckId; label: string; what: string; weight: number }
export const CHECKS: CheckDef[] = [
  { id: "a11y", label: "Accessibility", what: "No unlabelled controls, missing alt text, clickable non-interactive elements, removed focus outlines or hand-made dialogs in the source.", weight: 25 },
  { id: "schema", label: "Valid item", what: "A kebab-case name, a known type, and at least one file with a path and content.", weight: 15 },
  { id: "deps", label: "Dependencies declared", what: "Every package the code imports is in dependencies, and every shared registry component it imports is in registryDependencies.", weight: 15 },
  { id: "tokens", label: "Theme tokens", what: "Colors come from theme tokens, not hard-coded hex or rgb values, so the item follows the theme and dark mode.", weight: 10 },
  { id: "states", label: "States", what: "Data views handle loading, empty and error, not only the filled case.", weight: 10 },
  { id: "motion", label: "Motion", what: "No endless decorative animation, which cannot be paused for people who ask for less motion.", weight: 5 },
  { id: "rtl", label: "Right to left", what: "Logical classes (ms-, pe-, text-start) instead of physical ones (ml-, pr-, text-left), so the layout mirrors.", weight: 5 },
  { id: "describe", label: "Described", what: "A title and a description that says what the item is (20 characters or more).", weight: 5 },
  { id: "docs", label: "Documented", what: "A docs note, or at least one example item in the registry.", weight: 5 },
  { id: "author", label: "Attributed", what: "The item names its author or license, so you know who maintains it.", weight: 5 },
]

const SCORED = new Set(["registry:ui", "registry:block", "registry:component", "registry:hook", "registry:lib", "registry:page"])
const KNOWN_TYPES = new Set([...SCORED, "registry:example", "registry:theme", "registry:font", "registry:style", "registry:base", "registry:item", "registry:file", "registry:internal", "registry:ai"])
const VISUAL = new Set(["registry:ui", "registry:block", "registry:component", "registry:page"])
const IMPLICIT = new Set(["react", "react-dom", "next", "tailwindcss", "typescript", "server-only", "client-only", ...builtinModules])

/* ---------------------------------- reading a registry ---------------------------------- */

const isUrl = (s: string) => /^https?:\/\//i.test(s)

async function getJson<T>(url: string, fetchImpl: typeof fetch): Promise<T> {
  let res: Response
  try {
    res = await fetchImpl(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(30_000) })
  } catch (e) {
    throw new CliError(`Could not reach ${url}: ${(e as Error).message}`)
  }
  if (!res.ok) throw new CliError(`${url} answered ${res.status}`)
  try {
    return (await res.json()) as T
  } catch {
    throw new CliError(`${url} did not return JSON.`)
  }
}

type Catalog = { name?: string; homepage?: string; items?: RegistryItem[] }

/** A registry from an address (`https://acme.com`, `https://acme.com/r/registry.json`) or a path (a registry.json or a folder holding one). */
export async function loadRegistry(input: string, opts: { fetchImpl?: typeof fetch; itemUrl?: string } = {}): Promise<RegistrySource> {
  const fetchImpl = opts.fetchImpl ?? fetch
  if (isUrl(input)) {
    const catalogUrl = /\.json(?:\?.*)?$/.test(input) ? input : `${input.replace(/\/+$/, "")}/r/registry.json`
    const catalog = await getJson<Catalog>(catalogUrl, fetchImpl)
    if (!Array.isArray(catalog.items)) throw new CliError(`${catalogUrl} is not a shadcn registry: it has no "items" list.`)
    const dir = catalogUrl.replace(/[^/]*$/, "")
    return {
      name: catalog.name,
      homepage: catalog.homepage,
      source: catalogUrl,
      items: catalog.items,
      fetchItem: async (name) => {
        const url = (opts.itemUrl ?? `${dir}{name}.json`).replace("{name}", name).replace("{style}", "default")
        try {
          return await getJson<RegistryItem>(url, fetchImpl)
        } catch {
          return undefined
        }
      },
    }
  }
  let path = resolve(input)
  if (!existsSync(path)) throw new CliError(`${input} does not exist.`)
  if (statSync(path).isDirectory()) {
    const found = [join(path, "registry.json"), join(path, "r", "registry.json"), join(path, "public", "r", "registry.json")].find((p) => existsSync(p))
    if (!found) throw new CliError(`No registry.json found in ${input}. Point at the file, or build the registry first.`)
    path = found
  }
  let catalog: Catalog
  try {
    catalog = JSON.parse(readFileSync(path, "utf8")) as Catalog
  } catch (e) {
    throw new CliError(`${path} is not valid JSON: ${(e as Error).message}`)
  }
  if (!Array.isArray(catalog.items)) throw new CliError(`${path} is not a shadcn registry: it has no "items" list.`)
  const dir = dirname(path)
  return {
    name: catalog.name,
    homepage: catalog.homepage,
    source: path,
    items: catalog.items,
    fetchItem: async (name) => {
      const file = join(dir, `${name}.json`)
      try {
        return JSON.parse(readFileSync(file, "utf8")) as RegistryItem
      } catch {
        return undefined
      }
    },
  }
}

/* ---------------------------------- scoring ---------------------------------- */

export type ItemResult = { name: string; type: string; score: number; checks: Partial<Record<CheckId, Outcome>>; problems: string[] }
export type CheckResult = { id: CheckId; label: string; what: string; weight: number; pass: number; fail: number; na: number; pct: number }
export type Grade = "A" | "B" | "C" | "D" | "F"
export type Scorecard = {
  schema: 1
  tool: string
  registry: { name: string; homepage?: string; source: string }
  generated: string
  /** Items in the catalog, and how many of them were scored (components, blocks, hooks, libs and pages). */
  items: { total: number; scored: number }
  score: number
  grade: Grade
  checks: CheckResult[]
  /** The lowest-scoring items with what failed, so a maintainer knows where to start. */
  weakest: ItemResult[]
  notes: string[]
}

export const gradeOf = (score: number): Grade => (score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F")

/** The package an import specifier names, or undefined when it is not a package (a relative path, an alias, a built-in). */
export function packageOf(specifier: string): string | undefined {
  if (/^(\.|\/|@\/|~\/|#|data:|https?:)/.test(specifier)) return undefined
  if (specifier.startsWith("node:")) return undefined
  const parts = specifier.split("/")
  const name = specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!
  return name || undefined
}

const stripVersion = (dep: string) => {
  const at = dep.lastIndexOf("@")
  return at > 0 ? dep.slice(0, at) : dep
}

const IMPORT = /(?:^|[\n;])\s*(?:import|export)\s+(type\s+)?(?:[^'"`;]*?\sfrom\s*)?["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g

/** Runtime imports of a source file: [specifier, isTypeOnly]. */
export function importsOf(code: string): string[] {
  const out: string[] = []
  for (const m of code.matchAll(IMPORT)) {
    if (m[1]) continue
    const spec = m[2] ?? m[3]
    if (spec) out.push(spec)
  }
  return out
}

/** Names of shared registry components an import path points at: `@/components/ui/button` and `@/registry/x/ui/button` both name `button`. */
function sharedComponent(specifier: string): string | undefined {
  const m = specifier.match(/^@\/(?:components(?:\/[a-z0-9-]+)?\/ui|components\/[a-z0-9-]+|registry\/[a-z0-9-]+\/ui|ui)\/([a-z0-9-]+)$/)
  return m?.[1]
}

const registryDepName = (dep: string) => dep.replace(/\.json$/, "").split("/").pop()!.replace(/^@[^/]*\//, "")

const isCode = (path: string) => /\.(?:tsx?|jsx?)$/.test(path)

function depsOutcome(item: RegistryItem, problems: string[]): Outcome {
  const files = (item.files ?? []).filter((f) => f.content && f.path && isCode(f.path))
  if (!files.length) return "na"
  const declared = new Set([...(item.dependencies ?? []), ...(item.devDependencies ?? [])].map(stripVersion))
  const shared = new Set((item.registryDependencies ?? []).map(registryDepName))
  const missing = new Set<string>()
  const missingShared = new Set<string>()
  for (const f of files) {
    for (const spec of importsOf(f.content!)) {
      const comp = sharedComponent(spec)
      if (comp) {
        if (comp !== item.name && !shared.has(comp)) missingShared.add(comp)
        continue
      }
      const pkg = packageOf(spec)
      if (pkg && !IMPORT_OK(pkg) && !declared.has(pkg)) missing.add(pkg)
    }
  }
  if (missing.size) problems.push(`imports ${[...missing].join(", ")} but does not list ${missing.size === 1 ? "it" : "them"} in dependencies`)
  if (missingShared.size) problems.push(`imports ${[...missingShared].join(", ")} but does not list ${missingShared.size === 1 ? "it" : "them"} in registryDependencies`)
  return missing.size || missingShared.size ? "fail" : "pass"
}
const IMPORT_OK = (pkg: string) => IMPLICIT.has(pkg)

function schemaOutcome(item: RegistryItem, problems: string[]): Outcome {
  const bad: string[] = []
  if (!/^[a-z0-9][a-z0-9-]*$/.test(item.name ?? "")) bad.push("name is not kebab-case")
  if (!KNOWN_TYPES.has(item.type)) bad.push(`type "${item.type}" is not a registry type`)
  const files = item.files ?? []
  if (item.type !== "registry:theme" && item.type !== "registry:font" && item.type !== "registry:style" && !files.length) bad.push("has no files")
  for (const f of files) {
    if (!f.path) bad.push("a file has no path")
    else if (f.content === undefined && item.type !== "registry:theme") bad.push(`${basename(f.path)} has no content`)
  }
  problems.push(...bad)
  return bad.length ? "fail" : "pass"
}

const mapLimit = async <T, R>(list: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> => {
  const out: R[] = new Array(list.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, list.length) }, async () => {
      while (next < list.length) {
        const i = next++
        out[i] = await fn(list[i]!)
      }
    })
  )
  return out
}

export type VerifyOptions = {
  /** Where to find TypeScript, which the accessibility rules need (the project the command runs in). */
  cwd: string
  /** Score at most this many items, for a quick look. */
  limit?: number
  /** Called as items are fetched, for a progress line. */
  progress?: (done: number, total: number) => void
  tool?: string
  now?: Date
  /** List every item that lost points, not only the weakest few. */
  all?: boolean
}

export async function verifyRegistry(source: RegistrySource, opts: VerifyOptions): Promise<Scorecard> {
  const notes: string[] = []
  const ts = loadTypescript(opts.cwd)
  if (!ts) throw new CliError("verify reads the source with TypeScript, which was not found. Install it (npm i -D typescript) and run again.")

  const names = new Set(source.items.map((i) => i.name))
  let scoredItems = source.items.filter((i) => SCORED.has(i.type))
  if (opts.limit) scoredItems = scoredItems.slice(0, opts.limit)
  const exampleOwners = new Set<string>()
  for (const i of source.items) if (i.type === "registry:example") for (const n of names) if (i.name === n || i.name.startsWith(`${n}-`)) exampleOwners.add(n)

  // The catalog may list items without their files; fetch the full item when it does.
  let done = 0
  const full = await mapLimit(scoredItems, 8, async (item) => {
    const hasContent = (item.files ?? []).some((f) => f.content !== undefined)
    const resolved = hasContent ? item : ((await source.fetchItem(item.name)) ?? item)
    opts.progress?.(++done, scoredItems.length)
    return { ...item, ...resolved, name: item.name, type: item.type }
  })

  const unread = full.filter((i) => !(i.files ?? []).some((f) => f.content !== undefined))
  if (unread.length) notes.push(`${unread.length} of ${full.length} items had no file contents and could not be fetched (first: ${unread[0]!.name}). Build the registry so each item's JSON sits next to registry.json, or pass --item-url.`)

  // Audit every item's source files in a temporary folder, one subfolder per item.
  const dir = mkdtempSync(join(tmpdir(), "ballmac-verify-"))
  const byFolder = new Map<string, number>()
  try {
    writeFileSync(join(dir, "components.json"), JSON.stringify({ tailwind: { cssVariables: true } }))
    full.forEach((item, i) => {
      const folder = `i${String(i).padStart(5, "0")}`
      byFolder.set(folder, i)
      ;(item.files ?? []).forEach((f, j) => {
        if (!f.content || !f.path || !/\.(?:tsx|jsx|css)$/.test(f.path)) return
        const target = join(dir, folder, `${j}-${basename(f.path)}`)
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, f.content)
      })
    })
    const report = audit({ root: dir, includeLibrary: true, ts, maxFiles: 100_000, config: { rtl: true, rules: { "states/ballmac-state-prop": "off", "rtl/physical-direction": "warn" } } })
    notes.push(...report.notes.filter((n) => !/catalogue/i.test(n)))
    const findings = new Map<number, typeof report.findings>()
    for (const f of report.findings) {
      const index = byFolder.get(f.file.split("/")[0]!)
      if (index !== undefined) findings.set(index, [...(findings.get(index) ?? []), f])
    }

    const weight = Object.fromEntries(CHECKS.map((k) => [k.id, k.weight])) as Record<CheckId, number>
    const results: ItemResult[] = full.map((item, i) => {
      const problems: string[] = []
      const mine = findings.get(i) ?? []
      const hasJsx = (item.files ?? []).some((f) => f.content && f.path && /\.(?:tsx|jsx)$/.test(f.path))
      const hasStyle = (item.files ?? []).some((f) => f.content && f.path && /\.(?:tsx|jsx|css)$/.test(f.path))
      const byArea = (area: string, rules?: string[]): Outcome => {
        const hits = mine.filter((f) => f.rule.startsWith(`${area}/`) && (!rules || rules.includes(f.rule)))
        for (const h of hits.slice(0, 2)) problems.push(`${h.rule}: ${h.message}`)
        return hits.length ? "fail" : "pass"
      }
      const checks: Partial<Record<CheckId, Outcome>> = {
        schema: schemaOutcome(item, problems),
        describe: item.title && (item.description ?? "").trim().length >= 20 ? "pass" : "fail",
        deps: depsOutcome(item, problems),
        a11y: hasJsx ? byArea("a11y") : "na",
        tokens: hasStyle ? byArea("tokens") : "na",
        states: hasJsx && VISUAL.has(item.type) ? byArea("states") : "na",
        motion: hasStyle ? byArea("motion") : "na",
        rtl: hasStyle ? byArea("rtl") : "na",
        docs: VISUAL.has(item.type) ? (item.docs || exampleOwners.has(item.name) ? "pass" : "fail") : "na",
        author: item.author || item.license || (item.meta && (item.meta.license || item.meta.author)) ? "pass" : "fail",
      }
      if (checks.describe === "fail") problems.push("needs a title and a description of 20 characters or more")
      let got = 0
      let possible = 0
      for (const k of CHECKS) {
        const o = checks[k.id]
        if (o === "na" || !o) continue
        possible += weight[k.id]
        if (o === "pass") got += weight[k.id]
      }
      return { name: item.name, type: item.type, score: possible ? Math.round((got / possible) * 100) : 100, checks, problems }
    })

    const checkResults: CheckResult[] = CHECKS.map((k) => {
      let pass = 0
      let fail = 0
      let na = 0
      for (const r of results) {
        const o = r.checks[k.id]
        if (o === "pass") pass++
        else if (o === "fail") fail++
        else na++
      }
      return { id: k.id, label: k.label, what: k.what, weight: k.weight, pass, fail, na, pct: pass + fail ? Math.round((pass / (pass + fail)) * 1000) / 10 : 100 }
    })
    let num = 0
    let den = 0
    for (const k of checkResults) {
      if (k.pass + k.fail === 0) continue
      num += k.weight * (k.pass / (k.pass + k.fail))
      den += k.weight
    }
    const score = den ? Math.round((num / den) * 100) : 0
    if (!results.length) notes.push("The registry has no components, blocks, hooks, libs or pages to score.")
    const weakest = [...results].filter((r) => r.score < 100).sort((a, b) => a.score - b.score || a.name.localeCompare(b.name)).slice(0, opts.all ? Infinity : 15)
    return {
      schema: 1,
      tool: opts.tool ?? "ballmac verify",
      registry: { name: source.name ?? "registry", homepage: source.homepage, source: source.source },
      generated: (opts.now ?? new Date()).toISOString(),
      items: { total: source.items.length, scored: results.length },
      score,
      grade: gradeOf(score),
      checks: checkResults,
      weakest,
      notes: [...new Set(notes)],
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/* ---------------------------------- output ---------------------------------- */

export function formatScorecard(card: Scorecard, style: { green: (s: string) => string; yellow: (s: string) => string; red: (s: string) => string; dim: (s: string) => string; bold: (s: string) => string } = c): string {
  const out: string[] = []
  const tone = card.score >= 80 ? style.green : card.score >= 60 ? style.yellow : style.red
  out.push(`${style.bold(card.registry.name)}  ${tone(`${card.score}/100  grade ${card.grade}`)}  ${style.dim(`${card.items.scored} of ${card.items.total} items scored`)}`)
  out.push("")
  for (const k of card.checks) {
    const total = k.pass + k.fail
    const bar = total ? `${"█".repeat(Math.round(k.pct / 10))}${"░".repeat(10 - Math.round(k.pct / 10))}` : "··········"
    out.push(`  ${k.label.padEnd(24)} ${bar} ${total ? `${String(k.pct).padStart(5)}%  ${k.pass}/${total}` : style.dim("not applicable")}`)
  }
  if (card.weakest.length) {
    out.push("", style.bold("Start here"))
    for (const r of card.weakest.slice(0, 8)) out.push(`  ${r.name.padEnd(28)} ${String(r.score).padStart(3)}  ${style.dim(r.problems[0] ?? "")}`)
  }
  for (const n of card.notes) out.push("", style.dim(`note: ${n}`))
  out.push("", style.dim("Static checks on the source. Browser checks (axe, phone width, reduced motion) need ballmac check --url."))
  return out.join("\n")
}

/** Text width in pixels for the badge, close enough for Verdana 11px without measuring a font. */
const textWidth = (s: string) => Math.round(s.length * 6.4 + 1)

const GRADE_COLOR: Record<Grade, string> = { A: "#1a7f37", B: "#4d7c0f", C: "#a16207", D: "#c2410c", F: "#b91c1c" }

/** A flat badge: "Ballmac Verified | 94 · A". White text on colors that keep at least 4.5:1 contrast. */
export function badgeSvg(card: Pick<Scorecard, "score" | "grade">): string {
  const left = "Ballmac Verified"
  const right = `${card.score} · ${card.grade}`
  const lw = textWidth(left) + 20
  const rw = textWidth(right) + 20
  const w = lw + rw
  const label = `${left}: ${card.score} out of 100, grade ${card.grade}`
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="22" viewBox="0 0 ${w} 22" role="img" aria-label="${label}">`,
    `<title>${label}</title>`,
    `<clipPath id="r"><rect width="${w}" height="22" rx="4"/></clipPath>`,
    `<g clip-path="url(#r)"><rect width="${lw}" height="22" fill="#374151"/><rect x="${lw}" width="${rw}" height="22" fill="${GRADE_COLOR[card.grade]}"/></g>`,
    `<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">`,
    `<text x="${lw / 2}" y="15">${left}</text>`,
    `<text x="${lw + rw / 2}" y="15" font-weight="bold">${right}</text>`,
    `</g></svg>`,
    ``,
  ].join("\n")
}
