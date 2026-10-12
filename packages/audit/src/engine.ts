import { existsSync, readFileSync, statSync } from "node:fs"
import { createRequire } from "node:module"
import { join, relative, sep } from "node:path"

import type * as TS from "typescript"

import type { TsModule } from "./ast.js"
import { levelOf, loadConfig } from "./config.js"
import { cssMotionFindings } from "./rules/css.js"
import { runJsxRules } from "./rules/jsx.js"
import { RULES, ruleById } from "./rules/meta.js"
import type { AuditOptions, Finding, Report, RuleLevel, Severity } from "./types.js"
import { walk } from "./walk.js"

const ORDER: Record<RuleLevel, number> = { off: 0, info: 1, warn: 2, error: 3 }

/** TypeScript from the project being audited (so the syntax matches what it builds with), else the copy beside this code. */
export function loadTypescript(root: string): TsModule | undefined {
  for (const base of [join(root, "package.json"), import.meta.url]) {
    try {
      return createRequire(base)("typescript") as TsModule
    } catch {
      /* try the next place */
    }
  }
  return undefined
}

const lineIgnored = (lines: string[], line: number, rule: string) => {
  const check = (text: string | undefined, directive: string) => {
    const at = text?.indexOf(directive) ?? -1
    if (at < 0) return false
    const rest = text!.slice(at + directive.length).replace(/\*\/\s*}?\s*$/, "").trim()
    if (!rest || /^[-—:]/.test(rest)) return true
    return rest.split(/[\s,]+/).filter(Boolean).includes(rule)
  }
  return check(lines[line - 2], "ballmac-ignore-next-line") || check(lines[line - 1], "ballmac-ignore-line")
}

/** Audits a project folder and returns every finding. Reads files and never writes or runs anything. */
export function audit(options: AuditOptions & { ts?: TsModule }): Report {
  const root = options.root
  const notes: string[] = []
  const { config, problems } = loadConfig(root, options.config)
  notes.push(...problems)
  const maxFiles = options.maxFiles ?? 5000
  const maxBytes = options.maxFileBytes ?? 400_000

  let tokensApp = false
  try {
    const cj = JSON.parse(readFileSync(join(root, "components.json"), "utf8")) as { tailwind?: { cssVariables?: boolean } }
    tokensApp = cj.tailwind?.cssVariables !== false
  } catch {
    /* no components.json: not a shadcn-style app */
  }

  const ts = options.ts ?? loadTypescript(root)
  if (!ts) notes.push("TypeScript was not found in this project, so the rules that read JSX were skipped. Install it (npm i -D typescript) or audit from a TypeScript project. Style sheets were still checked.")
  const levels = Object.fromEntries(RULES.map((r) => [r.id, levelOf(config, r.id)]))
  const active = RULES.filter((r) => levels[r.id] !== "off").map((r) => r.id)
  if (levels["states/ballmac-state-prop"] !== "off" && !options.catalog) notes.push("Ballmac components were not checked for a missing state prop: the catalogue was not available (offline, or no registry).")

  const { files, skipped } = walk(root, { paths: options.paths, ignore: config.ignore, includeLibrary: options.includeLibrary, maxFiles })
  notes.push(...skipped)
  if (!files.length) notes.push("No source files were found to audit.")

  const findings: Finding[] = []
  let parsed = 0
  let scanned = 0

  for (const abs of files) {
    let size = 0
    try {
      size = statSync(abs).size
    } catch {
      continue
    }
    const rel = relative(root, abs).split(sep).join("/")
    if (size > maxBytes) {
      notes.push(`${rel} is ${Math.round(size / 1000)} KB, so it was skipped.`)
      continue
    }
    const text = readFileSync(abs, "utf8")
    scanned++
    if (/ballmac-ignore-file/.test(text.slice(0, 600))) continue
    const lines = text.split("\n")

    const add = (rule: string, at: TS.Node | { line: number; column: number }, message: string, opts: { fix?: string; severity?: Severity } = {}, sf?: TS.SourceFile) => {
      const meta = ruleById(rule)
      const level = levels[rule]
      if (!meta || !level || level === "off") return
      const pos = "line" in at ? at : (() => {
        const lc = sf!.getLineAndCharacterOfPosition((at as TS.Node).getStart(sf))
        return { line: lc.line + 1, column: lc.character + 1 }
      })()
      if (lineIgnored(lines, pos.line, rule)) return
      // A rule the settings name explicitly runs at that level; otherwise a finding may be lowered where the evidence is weaker.
      const explicit = config.rules[rule] !== undefined
      const severity: Severity = explicit || !opts.severity ? (level as Severity) : ORDER[opts.severity] < ORDER[level] ? opts.severity : (level as Severity)
      findings.push({ rule, severity, file: rel, line: pos.line, column: pos.column, message, fix: opts.fix ?? meta.fix, snippet: lines[pos.line - 1]?.trim().slice(0, 160) })
    }

    if (abs.endsWith(".css")) {
      if (levels["motion/endless-decorative"] !== "off") for (const f of cssMotionFindings(text)) add("motion/endless-decorative", f, f.message)
      continue
    }
    if (!ts || !/\.(?:tsx|jsx)$/.test(abs)) continue
    const kind = abs.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.JSX
    const sf = ts.createSourceFile(abs, text, ts.ScriptTarget.Latest, true, kind)
    parsed++
    runJsxRules({
      ts,
      sf,
      text,
      catalog: options.catalog,
      config,
      tokensApp,
      level: (r) => levels[r] ?? "off",
      report: (rule, at, message, opts) => add(rule, at, message, opts, sf),
    })
  }

  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column)
  const counts: Record<Severity, number> = { error: 0, warn: 0, info: 0 }
  const byRule: Record<string, number> = {}
  for (const f of findings) {
    counts[f.severity]++
    byRule[f.rule] = (byRule[f.rule] ?? 0) + 1
  }
  return { root, filesScanned: scanned, filesParsed: parsed, findings, counts, byRule, notes, rules: active }
}
