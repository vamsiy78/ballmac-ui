import { ruleById } from "./rules/meta.js"
import type { Finding, Report, Severity } from "./types.js"

export const DOCS = "https://ui.ballmac.com/docs/check"
export const docsUrl = (rule: string) => `${DOCS}#${rule.replace("/", "-")}`

export type Style = { red: (s: string) => string; yellow: (s: string) => string; blue: (s: string) => string; green: (s: string) => string; dim: (s: string) => string; bold: (s: string) => string }
const plain: Style = { red: (s) => s, yellow: (s) => s, blue: (s) => s, green: (s) => s, dim: (s) => s, bold: (s) => s }

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/** A short line for the end of a report: "3 errors, 5 warnings, 2 notes in 7 files". */
export function summaryLine(report: Report) {
  const { error, warn, info } = report.counts
  const files = new Set(report.findings.map((f) => f.file)).size
  if (!report.findings.length) return "No findings."
  return `${plural(error, "error")}, ${plural(warn, "warning")}, ${plural(info, "note")} in ${plural(files, "file")}`
}

/** The report as text for a terminal. Findings are grouped by rule, because the fix is the same for every one of them. */
export function formatPretty(report: Report, opts: { style?: Style; perRule?: number; all?: boolean } = {}) {
  const st = opts.style ?? plain
  const limit = opts.all ? Infinity : opts.perRule ?? 8
  const out: string[] = []
  out.push(st.bold(`ballmac check`) + st.dim(`  ·  ${plural(report.filesScanned, "file")}${report.filesParsed < report.filesScanned ? `, ${report.filesParsed} read for JSX` : ""}`))
  const groups = new Map<string, Finding[]>()
  for (const f of report.findings) groups.set(f.rule, [...(groups.get(f.rule) ?? []), f])
  const rank: Record<Severity, number> = { error: 0, warn: 1, info: 2 }
  const strongest = (l: Finding[]) => Math.min(...l.map((f) => rank[f.severity]))
  const sorted = [...groups.entries()].sort(([, a], [, b]) => strongest(a) - strongest(b) || b.length - a.length)
  for (const [rule, list] of sorted) {
    const sev = list.reduce<Severity>((m, f) => (rank[f.severity] < rank[m] ? f.severity : m), "info")
    const tag = sev === "error" ? st.red("error") : sev === "warn" ? st.yellow("warn ") : st.blue("note ")
    out.push("")
    out.push(`${tag} ${st.bold(rule)} ${st.dim(`×${list.length}`)}  ${ruleById(rule)?.title ?? ""}`)
    for (const f of list.slice(0, limit)) {
      // A rule can lower a single finding (a status colour, a hand-made dark mode); say so instead of leaving it under a stronger heading.
      out.push(`  ${f.file}:${f.line}:${f.column}${f.severity !== sev ? st.dim(`  (${f.severity === "info" ? "note" : f.severity})`) : ""}`)
      out.push(`    ${f.message}`)
      if (f.snippet) out.push(st.dim(`    ${String(f.line).padStart(4)} │ ${f.snippet}`))
    }
    if (list.length > limit) out.push(st.dim(`  … and ${list.length - limit} more (run with --all to see every one)`))
    out.push(st.green(`  fix: ${list[0]!.fix}`))
    out.push(st.dim(`  ${docsUrl(rule)}`))
  }
  if (report.notes.length) {
    out.push("")
    for (const n of report.notes) out.push(st.dim(`note: ${n}`))
  }
  out.push("")
  out.push(report.counts.error ? st.red(`✗ ${summaryLine(report)}`) : report.findings.length ? st.yellow(`! ${summaryLine(report)}`) : st.green(`✓ ${summaryLine(report)}`))
  return out.join("\n")
}

/** GitHub Actions annotations, one per finding, which show up on the changed lines of a pull request. */
export function formatGithub(report: Report) {
  const esc = (s: string) => s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A")
  return report.findings
    .map((f) => `::${f.severity === "error" ? "error" : f.severity === "warn" ? "warning" : "notice"} file=${f.file},line=${f.line},col=${f.column},title=${esc(f.rule)}::${esc(`${f.message} Fix: ${f.fix}`)}`)
    .join("\n")
}
