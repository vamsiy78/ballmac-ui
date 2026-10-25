// Ballmac UI: Eval Scorecard. https://ui.ballmac.com/components/eval-scorecard
"use client"

import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Check, ChevronDown, Loader2, Minus, RotateCw, TriangleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type EvalStatus = "pass" | "fail" | "error"

type EvalCase = {
  id: string
  name: string
  /** What the model was asked. */
  input: string
  /** What a good answer says. */
  expected: string
  /** What the model said. */
  actual: string
  status: EvalStatus
  /** The status on the baseline run. A pass that was a fail is "fixed"; a fail that was a pass is a regression. */
  previous?: EvalStatus
  /** Time taken in milliseconds. */
  ms?: number
  /** Cost in dollars. */
  cost?: number
  tags?: string[]
  /** Why it failed, in a sentence. */
  note?: string
}

type EvalScorecardProps = Omit<React.ComponentProps<"section">, "title"> & {
  title?: string
  /** Which model and prompt were tested, for example "claude-haiku-5-5 · prompt v14". */
  subject?: string
  cases: EvalCase[]
  /** Pass rates (0 to 1) of earlier runs, oldest first, drawn as a trend. */
  history?: number[]
  /** The pass rate (0 to 1) this run is compared with. Defaults to the last item of history. */
  baseline?: number
  /** Called with the ids to run again. Reject and the reason is shown. */
  onRerun?: (ids: string[]) => void | Promise<void>
}

const fmtMs = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`)
const fmtCost = (c: number) => (c < 0.01 ? `$${c.toFixed(4)}` : `$${c.toFixed(2)}`)

function Ring({ value }: { value: number }) {
  const r = 38
  const c = 2 * Math.PI * r
  return (
    <svg aria-hidden="true" viewBox="0 0 96 96" className="size-24 shrink-0 -rotate-90">
      <circle cx="48" cy="48" r={r} fill="none" strokeWidth="9" className="stroke-muted" />
      <circle cx="48" cy="48" r={r} fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} className="stroke-foreground transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none" />
    </svg>
  )
}

function Trend({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const w = 144
  const h = 44
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const span = hi - lo || 1
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 12) + 6, h - 8 - ((v - lo) / span) * (h - 16)] as const)
  const line = pts.map((p) => p.join(",")).join(" ")
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${w} ${h}`} className="h-11 w-36 shrink-0 text-foreground rtl:-scale-x-100">
      <polygon points={`${pts[0][0]},${h} ${line} ${pts[pts.length - 1][0]},${h}`} fill="currentColor" opacity="0.07" />
      <polyline points={line} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" opacity="0.55" />
      {pts.map((p, i) => (i < pts.length - 1 ? <circle key={i} cx={p[0]} cy={p[1]} r="2" fill="currentColor" opacity="0.35" /> : null))}
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill="currentColor" />
    </svg>
  )
}

/**
 * The result of testing a model or a prompt against a set of cases. The pass rate and its change from the baseline lead, in words as well as a ring; the list
 * can be narrowed to what failed or got worse; every case opens to show the question, what a good answer says and what the model said.
 */
function EvalScorecard({ title, subject, cases, history, baseline: baselineProp, onRerun, className, ...props }: EvalScorecardProps) {
  const msg = useMessages()
  const id = React.useId()
  title ??= msg("eval-scorecard.title", "Evaluation")
  const [filter, setFilter] = React.useState<"all" | "failed" | "regressed">("all")
  const [open, setOpen] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<{ text: string; error?: boolean } | null>(null)

  const passed = cases.filter((c) => c.status === "pass").length
  const rate = cases.length ? passed / cases.length : 0
  const base = baselineProp ?? history?.[history.length - 1]
  const delta = base === undefined ? undefined : Math.round((rate - base) * 100)
  const failed = cases.filter((c) => c.status !== "pass")
  const regressed = cases.filter((c) => c.status !== "pass" && c.previous === "pass")
  const fixed = cases.filter((c) => c.status === "pass" && c.previous && c.previous !== "pass")
  const timed = cases.filter((c) => c.ms !== undefined)
  const avgMs = timed.length ? timed.reduce((s, c) => s + (c.ms ?? 0), 0) / timed.length : undefined
  const totalCost = cases.reduce((s, c) => s + (c.cost ?? 0), 0)
  const list = filter === "all" ? cases : filter === "failed" ? failed : regressed

  async function rerun(key: string, ids: string[]) {
    setBusy(key)
    setStatus(null)
    try {
      await onRerun?.(ids)
      setStatus({ text: msg("eval-scorecard.rerun", "Started again: {count} cases", { count: ids.length }) })
    } catch (e) {
      setStatus({ text: e instanceof Error ? e.message : msg("eval-scorecard.failed", "That did not work. Nothing was run."), error: true })
    } finally {
      setBusy(null)
    }
  }

  const filters = [
    { key: "all" as const, label: msg("eval-scorecard.all", "All"), n: cases.length },
    { key: "failed" as const, label: msg("eval-scorecard.failedTab", "Failed"), n: failed.length },
    { key: "regressed" as const, label: msg("eval-scorecard.regressedTab", "Got worse"), n: regressed.length },
  ]

  return (
    <section data-slot="eval-scorecard" aria-labelledby={`${id}-title`} className={cn("min-w-0 rounded-xl border bg-card text-card-foreground", className)} {...props}>
      <header className="flex flex-wrap items-center gap-x-6 gap-y-4 p-5 sm:p-6">
        <div className="relative">
          <Ring value={rate} />
          <p className="absolute inset-0 flex items-center justify-center text-xl font-semibold tracking-[-0.03em] tabular-nums">{msg("eval-scorecard.percent", "{percent}%", { percent: Math.round(rate * 100) })}</p>
        </div>
        <div className="min-w-0 flex-1 basis-64">
          <Heading id={`${id}-title`} title={title} subject={subject} />
          <p className="mt-2 text-sm text-foreground">
            {msg("eval-scorecard.summary", "{passed} of {total} cases passed", { passed, total: cases.length })}
            {delta !== undefined && (
              <span className="ms-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                {delta > 0 ? <ArrowUpRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" /> : delta < 0 ? <ArrowDownRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" /> : <Minus aria-hidden="true" className="size-3.5" />}
                {delta === 0 ? msg("eval-scorecard.same", "Same as the baseline") : delta > 0 ? msg("eval-scorecard.up", "Up {points} points from the baseline", { points: delta }) : msg("eval-scorecard.down", "Down {points} points from the baseline", { points: Math.abs(delta) })}
              </span>
            )}
          </p>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            <Stat label={msg("eval-scorecard.regressions", "Got worse")} value={String(regressed.length)} />
            <Stat label={msg("eval-scorecard.fixed", "Fixed")} value={String(fixed.length)} />
            {avgMs !== undefined && <Stat label={msg("eval-scorecard.latency", "Average time")} value={fmtMs(avgMs)} />}
            {totalCost > 0 && <Stat label={msg("eval-scorecard.cost", "Cost of this run")} value={fmtCost(totalCost)} />}
            {history && history.length > 1 && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">{msg("eval-scorecard.trend", "Trend")}</dt>
                <dd className="flex items-center gap-2 ps-2">
                  <Trend values={history} />
                  <span className="sr-only">{msg("eval-scorecard.trendText", "Pass rate over the last {count} runs, from {from}% to {to}%", { count: history.length, from: Math.round(history[0] * 100), to: Math.round(history[history.length - 1] * 100) })}</span>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 border-y bg-muted/30 px-4 py-2.5 sm:px-6">
        <div role="group" aria-label={msg("eval-scorecard.filter", "Show cases")} className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn("inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none", filter === f.key ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground")}
            >
              {f.label}
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", filter === f.key ? "bg-background/20" : "bg-muted")}>{f.n}</span>
            </button>
          ))}
        </div>
        {onRerun && failed.length > 0 && (
          <button type="button" disabled={busy !== null} onClick={() => void rerun("all", failed.map((c) => c.id))} className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60">
            {busy === "all" ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <RotateCw aria-hidden="true" className="size-3.5" />}
            {msg("eval-scorecard.rerunFailed", "Run the {count} failed again", { count: failed.length })}
          </button>
        )}
      </div>

      <ul className="grid grid-cols-[minmax(0,1fr)] divide-y">
        {list.map((c) => {
          const isOpen = open === c.id
          const worse = c.status !== "pass" && c.previous === "pass"
          const better = c.status === "pass" && !!c.previous && c.previous !== "pass"
          return (
            <li key={c.id} className="min-w-0">
              <h3>
                <button type="button" aria-expanded={isOpen} aria-controls={`${id}-${c.id}`} onClick={() => setOpen(isOpen ? null : c.id)} className="flex w-full items-center gap-3 px-4 py-3 text-start outline-none hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50 sm:px-6">
                  <span aria-hidden="true" className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border [&>svg]:size-3.5", c.status === "pass" ? "bg-foreground text-background border-foreground" : "border-destructive/50 text-foreground")}>
                    {c.status === "pass" ? <Check /> : c.status === "fail" ? <X /> : <TriangleAlert />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="truncate text-sm font-medium">{c.name}</span>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {c.status === "pass" ? msg("eval-scorecard.pass", "Passed") : c.status === "fail" ? msg("eval-scorecard.fail", "Failed") : msg("eval-scorecard.error", "Errored")}
                      </span>
                      {worse && <span className="rounded-full border border-foreground px-1.5 py-px text-[11px] font-medium">{msg("eval-scorecard.worse", "Got worse")}</span>}
                      {better && <span className="rounded-full border px-1.5 py-px text-[11px] font-medium text-muted-foreground">{msg("eval-scorecard.better", "Fixed")}</span>}
                    </span>
                    {c.tags && c.tags.length > 0 && <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{c.tags.join(" · ")}</span>}
                  </span>
                  <span className="hidden shrink-0 text-end text-[11px] text-muted-foreground tabular-nums sm:block">
                    {c.ms !== undefined && <span className="block">{fmtMs(c.ms)}</span>}
                    {c.cost !== undefined && <span className="block">{fmtCost(c.cost)}</span>}
                  </span>
                  <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} />
                </button>
              </h3>
              {isOpen && (
                <div id={`${id}-${c.id}`} className="grid gap-3 bg-muted/20 px-4 pt-1 pb-4 sm:px-6">
                  {c.note && <p className="text-sm font-medium text-pretty">{c.note}</p>}
                  <Block label={msg("eval-scorecard.input", "Asked")} text={c.input} />
                  <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
                    <Block label={msg("eval-scorecard.expected", "A good answer")} text={c.expected} />
                    <Block label={msg("eval-scorecard.actual", "The model said")} text={c.actual} strong />
                  </div>
                  {onRerun && (
                    <div>
                      <button type="button" disabled={busy !== null} onClick={() => void rerun(c.id, [c.id])} className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60">
                        {busy === c.id ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <RotateCw aria-hidden="true" className="size-3.5" />}
                        {msg("eval-scorecard.rerunOne", "Run this case again")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
        {list.length === 0 && <li className="px-6 py-10 text-center text-sm text-muted-foreground">{filter === "regressed" ? msg("eval-scorecard.noneWorse", "Nothing got worse. Every case that passed before still passes.") : msg("eval-scorecard.noneFailed", "Every case passed.")}</li>}
      </ul>
      <p aria-live="polite" role={status?.error ? "alert" : undefined} className={cn("min-h-4 px-4 py-3 text-xs sm:px-6", status?.error ? "font-medium text-destructive" : "text-muted-foreground")}>{status?.text}</p>
    </section>
  )
}

function Heading({ id, title, subject }: { id: string; title: string; subject?: string }) {
  return (
    <div>
      <h2 id={id} className="text-base font-semibold tracking-[-0.02em]">{title}</h2>
      {subject && <p className="font-mono text-xs text-muted-foreground">{subject}</p>}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function Block({ label, text, strong }: { label: string; text: string; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className={cn("rounded-md border bg-card px-3 py-2 text-[13px] leading-relaxed text-pretty break-words whitespace-pre-wrap", strong && "border-foreground/25")}>{text}</p>
    </div>
  )
}

export { EvalScorecard, type EvalCase, type EvalScorecardProps, type EvalStatus }
