import "server-only"

import history from "@/lib/generated/quality-history.json"
import raw from "@/lib/generated/quality.json"

export type CheckStatus = "pass" | "fail" | "na" | "info"
export type Check = { id: string; label: string; status: CheckStatus; detail: string }
type StoredItem = { v: string; checks: Check[]; size: { files: number; gzip: number }; examples: number }
type Stored = { schema: number; generated: string; tools: { axe?: string; browser?: string; playwright?: string }; items: Record<string, StoredItem> }

const data = raw as unknown as Stored

export type ItemScore = {
  /** The item version these were measured on. */
  measuredOn: string
  checks: Check[]
  passed: number
  /** Checks that apply: passed and failed (not applicable and informational ones are left out). */
  total: number
  failed: Check[]
  examples: number
}

/** The scorecard for an item, or undefined when it has not been measured yet. */
export function getScore(name: string): ItemScore | undefined {
  const q = data.items[name]
  if (!q || !q.checks.length) return undefined
  const passed = q.checks.filter((c) => c.status === "pass").length
  const failed = q.checks.filter((c) => c.status === "fail")
  return { measuredOn: q.v, checks: q.checks, passed, total: passed + failed.length, failed, examples: q.examples }
}

export const measured = { generated: data.generated, tools: data.tools }

/** One line per day the measurement was run, oldest first (registry/quality-history.json). */
export const runs = history as { date: string; items: number; examples: number; failingChecks: number }[]

export function formatMeasured(iso: string) {
  return iso ? new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : ""
}

/** Totals across the whole catalogue, for the quality page. */
export function overview() {
  const names = Object.keys(data.items)
  const byCheck = new Map<string, { label: string; pass: number; fail: number; na: number; info: number }>()
  const failing: { name: string; failed: Check[] }[] = []
  let examples = 0
  let perfect = 0
  let applicable = 0
  for (const name of names) {
    const s = getScore(name)
    if (!s) continue
    examples += s.examples
    applicable++
    if (!s.failed.length) perfect++
    else failing.push({ name, failed: s.failed })
    for (const c of s.checks) {
      const row = byCheck.get(c.id) ?? { label: c.label, pass: 0, fail: 0, na: 0, info: 0 }
      row[c.status]++
      byCheck.set(c.id, row)
    }
  }
  return {
    items: applicable,
    examples,
    // Each example is loaded in light, dark, reduced motion and right to left, so the number of page loads is a few times larger.
    pageLoads: examples * 7,
    perfect,
    byCheck: [...byCheck.entries()].map(([id, v]) => ({ id, ...v })),
    failing: failing.sort((a, b) => a.name.localeCompare(b.name)),
  }
}
