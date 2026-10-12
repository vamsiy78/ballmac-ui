import { existsSync, statSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join, parse, resolve } from "node:path"

import type { Catalog } from "./catalog.js"
import { audit, docsUrl, RULES, type Catalog as AuditCatalog, type Severity } from "./vendor/audit/index.js"

const RANK: Record<Severity, number> = { error: 0, warn: 1, info: 2 }

/** The rules, written so an agent can follow them while it writes the UI instead of finding out afterwards. */
export function qualityRules() {
  return {
    howToUse: [
      "Read these rules before you write or change UI, and build to them from the start.",
      "When you are done, call audit_project on the project folder and fix every error; fix warnings unless the code is intentional.",
      "To keep a deliberate exception, put // ballmac-ignore-next-line <rule> above the line (or {/* ballmac-ignore-next-line <rule> */} in JSX).",
    ],
    rules: RULES.map((r) => ({ id: r.id, area: r.area, title: r.title, why: r.why, fix: r.fix, defaultLevel: r.defaultLevel, ...(r.example ? { example: r.example } : {}), docs: docsUrl(r.id) })),
  }
}

/** The project folder for a path: the nearest folder at or above it that has a package.json. Refuses anything that is not clearly a project. */
export function projectRoot(path: string): string {
  const start = resolve(path)
  if (!existsSync(start) || !statSync(start).isDirectory()) throw new Error(`"${path}" is not a folder.`)
  if (start === parse(start).root || start === homedir()) throw new Error("Point audit_project at a project folder, not at the home folder or the filesystem root.")
  let dir = start
  for (let i = 0; i < 12; i++) {
    if (existsSync(join(dir, "package.json"))) return dir
    const up = dirname(dir)
    if (up === dir || up === homedir()) break
    dir = up
  }
  throw new Error(`"${path}" does not look like a JavaScript project: there is no package.json in it or above it.`)
}

/** The exports and states of every item, for the rule that spots a Ballmac component used without its state prop. */
export async function auditCatalog(catalog: Catalog): Promise<AuditCatalog | undefined> {
  try {
    const v = await catalog.versions()
    return Object.fromEntries(Object.entries(v.items).map(([name, i]) => [name, { exports: i.exports, states: i.states }]))
  } catch {
    return undefined
  }
}

export type AuditInput = { path?: string; paths?: string[]; minSeverity?: Severity; limit?: number; includeLibrary?: boolean }

/** Audits a project and answers in a shape an agent can act on: a verdict, the findings worst first with their fixes, and what to do next. */
export async function auditProject(input: AuditInput, catalog: Catalog, cwd = process.cwd()) {
  const root = projectRoot(input.path ?? cwd)
  const report = audit({ root, paths: input.paths, catalog: await auditCatalog(catalog), includeLibrary: input.includeLibrary })
  const min = RANK[input.minSeverity ?? "warn"]
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200)
  const shown = report.findings.filter((f) => RANK[f.severity] <= min).sort((a, b) => RANK[a.severity] - RANK[b.severity] || a.file.localeCompare(b.file) || a.line - b.line)
  const findings = shown.slice(0, limit).map((f) => ({ rule: f.rule, severity: f.severity, file: f.file, line: f.line, column: f.column, message: f.message, fix: f.fix, ...(f.snippet ? { snippet: f.snippet } : {}) }))
  const { error, warn, info } = report.counts
  const verdict = error ? `${error} error${error === 1 ? "" : "s"} to fix${warn ? `, plus ${warn} warning${warn === 1 ? "" : "s"}` : ""}.` : warn ? `No errors, ${warn} warning${warn === 1 ? "" : "s"} to review.` : info ? `Clean apart from ${info} note${info === 1 ? "" : "s"}.` : "Clean: no findings."
  const byRule = Object.entries(report.byRule)
    .map(([rule, count]) => ({ rule, count, fix: RULES.find((r) => r.id === rule)?.fix ?? "" }))
    .sort((a, b) => b.count - a.count)
  return {
    root,
    verdict,
    summary: { filesScanned: report.filesScanned, filesRead: report.filesParsed, errors: error, warnings: warn, notes: info, rulesRun: report.rules.length },
    findings,
    truncated: shown.length > findings.length,
    totalShown: shown.length,
    byRule,
    notes: report.notes,
    next: error || warn
      ? ["Fix the errors first, then the warnings, then call audit_project again until it is clean.", "Fix the cause, not the symptom: for a missing label add the label, do not add an ignore comment. Use // ballmac-ignore-next-line <rule> only for code that is intentionally an exception."]
      : ["Nothing to fix. If the app is running, load it in a browser and check the states by hand: slow network, empty data and a failed request."],
  }
}
