import { Check, Info, Minus, TriangleAlert } from "lucide-react"

import Link from "@/components/site/link"
import { SectionHeading } from "@/components/site/section-heading"
import { formatMeasured, getScore, measured, type CheckStatus } from "@/lib/quality"
import { cn } from "@/lib/utils"

const STATUS: Record<CheckStatus, { icon: typeof Check; chip: string; word: string }> = {
  pass: { icon: Check, chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", word: "Passed" },
  fail: { icon: TriangleAlert, chip: "bg-destructive/10 text-destructive", word: "Did not pass" },
  na: { icon: Minus, chip: "bg-muted text-muted-foreground", word: "Not applicable" },
  info: { icon: Info, chip: "bg-muted text-muted-foreground", word: "For information" },
}

/** The share of checks passed, as a ring with the numbers in the middle. All passing is drawn in green, anything else in the warning colour. */
export function ScoreRing({ passed, total, size = 72, className }: { passed: number; total: number; size?: number; className?: string }) {
  const pct = total ? (passed / total) * 100 : 0
  const ok = passed === total
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} role="img" aria-label={`${passed} of ${total} checks passed`} className={cn("shrink-0", className)}>
      <circle cx="18" cy="18" r="15.9155" fill="none" strokeWidth="3" className="stroke-muted" />
      <circle
        cx="18"
        cy="18"
        r="15.9155"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${pct} ${100 - pct}`}
        transform="rotate(-90 18 18)"
        className={ok ? "stroke-emerald-500" : "stroke-amber-500"}
      />
      <text x="18" y="18" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-[10px] font-semibold tabular-nums" style={{ fontSize: 10 }}>
        {passed}/{total}
      </text>
    </svg>
  )
}

/** A small pill for the top of an item page that links down to the scorecard. */
export function ScoreChip({ name }: { name: string }) {
  const s = getScore(name)
  if (!s || !s.total) return null
  const ok = s.passed === s.total
  return (
    <Link href="#quality" className="hover:bg-accent inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors" aria-label={`Quality scorecard: ${s.passed} of ${s.total} checks passed`}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", ok ? "bg-emerald-500" : "bg-amber-500")} />
      {s.passed}/{s.total} checks
    </Link>
  )
}

/**
 * What was measured for an item, check by check, with the result in words. Everything here was observed by `pnpm quality` in a real browser or read
 * from the item's own files; the page says which. A measurement taken on an earlier version is labelled as such.
 */
export function Scorecard({ name, version }: { name: string; version: string }) {
  const s = getScore(name)
  if (!s) return null
  const current = s.measuredOn === version
  return (
    <section className="space-y-5" aria-labelledby="quality">
      <SectionHeading id="quality">Quality scorecard</SectionHeading>
      <div className="bg-card overflow-hidden rounded-2xl border">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b px-5 py-4 sm:px-6">
          {s.total > 0 && <ScoreRing passed={s.passed} total={s.total} />}
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold tracking-tight">
              {s.total === 0 ? "Not measured in a browser" : s.passed === s.total ? "Every applicable check passes" : `${s.failed.length} check${s.failed.length === 1 ? "" : "s"} did not pass`}
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Measured in {measured.tools.browser ?? "a real browser"}
              {measured.generated ? ` on ${formatMeasured(measured.generated)}` : ""}, on version {s.measuredOn}, across {s.examples} example{s.examples === 1 ? "" : "s"}.
            </p>
          </div>
          <Link href="/quality" className="text-foreground text-sm font-medium underline underline-offset-4">
            How we measure
          </Link>
        </div>
        {!current && (
          <p className="bg-muted/50 text-muted-foreground border-b px-5 py-2.5 text-sm sm:px-6" role="note">
            These numbers are from version {s.measuredOn}. This page shows version {version}, which is measured again on the next quality run.
          </p>
        )}
        <ul className="divide-y">
          {s.checks.map((c) => {
            const st = STATUS[c.status]
            const Icon = st.icon
            return (
              <li key={c.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 px-5 py-3.5 sm:px-6">
                <span className={cn("mt-0.5 flex size-6 items-center justify-center rounded-full", st.chip)} aria-hidden="true">
                  <Icon className="size-3.5" strokeWidth={2.5} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    <span className="sr-only">{st.word}: </span>
                    {c.label}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">{c.detail}</p>
                </div>
              </li>
            )
          })}
        </ul>
        <p className="text-muted-foreground border-t px-5 py-3 text-xs leading-relaxed sm:px-6">
          Automated checks find a subset of problems and do not replace testing with a screen reader and a keyboard in your own app.{" "}
          <Link href="/quality#limits" className="text-foreground underline underline-offset-4">
            What they miss
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
