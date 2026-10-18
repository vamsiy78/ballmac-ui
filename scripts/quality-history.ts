/**
 * The run history shown on /quality: one line per day the measurement was run, so a visitor can see the number of failing checks come down (or not).
 * `pnpm quality` adds today's line to registry/quality-history.json after it writes registry/quality.json. A second run on the same day replaces that day's line.
 */
export type QualityRun = { date: string; items: number; examples: number; failingChecks: number }
type Measured = { checks: { status: string }[]; ex?: Record<string, unknown> }

/** The line for a finished run: items that were measured, their examples, and how many applicable checks failed. */
export function summarize(items: Record<string, Measured>, date: string): QualityRun {
  let n = 0
  let examples = 0
  let failing = 0
  for (const item of Object.values(items)) {
    if (!item.checks.length) continue
    n++
    examples += Object.keys(item.ex ?? {}).length
    failing += item.checks.filter((c) => c.status === "fail").length
  }
  return { date, items: n, examples, failingChecks: failing }
}

/** The history with `run` added, oldest first, replacing a line for the same day. */
export function record(history: QualityRun[], run: QualityRun): QualityRun[] {
  return [...history.filter((h) => h.date !== run.date), run].sort((a, b) => a.date.localeCompare(b.date))
}
