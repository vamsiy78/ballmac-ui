// Ballmac UI: Agent 5. https://ui.ballmac.com/blocks/agent-5
"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, CircleCheck, CircleX, FlaskConical, Minus, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { DiffViewer } from "@/components/ballmac/diff-viewer"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Agent5Result = { output: string; pass: boolean; score?: number }

type Agent5Case = {
  id: string
  /** What the case asks, as people would read it. */
  input: string
  expected?: string
  baseline: Agent5Result
  candidate: Agent5Result
  tags?: string[]
}

type Agent5Metric = {
  id: string
  label: string
  baseline: number
  candidate: number
  format?: "percent" | "ms" | "currency" | "number"
  /** False for latency and cost, where lower is better. */
  higherIsBetter?: boolean
}

type Agent5Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    /** The suite's name. */
    title?: string
    /** What is being compared, such as "Prompt v12 · Lyra XL". */
    baselineLabel?: string
    candidateLabel?: string
    metrics?: Agent5Metric[]
    cases?: Agent5Case[]
    locale?: string
    /** Called by "Ship candidate". Without it the button is hidden. */
    onShip?: () => void
    /** Called by "Keep baseline". */
    onKeepBaseline?: () => void
  }

const sampleMetrics: Agent5Metric[] = [
  { id: "pass", label: "Pass rate", baseline: 0.82, candidate: 0.9, format: "percent" },
  { id: "score", label: "Average score", baseline: 0.78, candidate: 0.84, format: "number" },
  { id: "latency", label: "Median time", baseline: 2140, candidate: 1680, format: "ms", higherIsBetter: false },
  { id: "cost", label: "Cost per case", baseline: 0.0041, candidate: 0.0046, format: "currency", higherIsBetter: false },
]

const sampleCases: Agent5Case[] = [
  {
    id: "c1",
    input: "A customer was charged twice for one order. Write the reply.",
    expected: "Apologizes, confirms the refund of the duplicate charge, gives the 5–10 day timeline.",
    baseline: { output: "Hi! We refunded the extra charge. Sorry!", pass: false, score: 0.4 },
    candidate: { output: "Hi Jordan, you were charged twice for order 4821. I’ve refunded the second charge; it reaches your card in 5 to 10 business days.", pass: true, score: 0.95 },
    tags: ["billing"],
  },
  {
    id: "c2",
    input: "Customer asks to delete their account and all data.",
    expected: "Explains deletion is permanent, links the confirmation step, does not delete without confirmation.",
    baseline: { output: "To delete your account, open Settings › Account and choose Delete. This cannot be undone, so we ask you to confirm first.", pass: true, score: 0.9 },
    candidate: { output: "Done! Your account and data have been deleted.", pass: false, score: 0.1 },
    tags: ["safety"],
  },
  {
    id: "c3",
    input: "Where can I download invoices?",
    expected: "Points to Billing › Invoices.",
    baseline: { output: "Invoices are in Billing › Invoices.", pass: true, score: 0.9 },
    candidate: { output: "Open Billing › Invoices to download any invoice as a PDF.", pass: true, score: 0.95 },
    tags: ["billing"],
  },
  {
    id: "c4",
    input: "Is the API down? My requests time out.",
    expected: "Links the status page and asks for a request id.",
    baseline: { output: "Everything looks fine on our side.", pass: false, score: 0.3 },
    candidate: { output: "Check status.acme.com for incidents. If it’s green, send me a request id from a timed-out call and I’ll look it up.", pass: true, score: 0.9 },
    tags: ["support"],
  },
  {
    id: "c5",
    input: "Can I get a discount for a nonprofit?",
    expected: "Explains the nonprofit discount and how to apply.",
    baseline: { output: "Yes, nonprofits get 50% off. Apply at acme.com/nonprofit with your registration number.", pass: true, score: 0.85 },
    candidate: { output: "Yes, nonprofits get 50% off. Apply at acme.com/nonprofit.", pass: true, score: 0.75 },
    tags: ["sales"],
  },
]

type Change = "regression" | "improvement" | "same"
const changeOf = (c: Agent5Case): Change => (c.baseline.pass && !c.candidate.pass ? "regression" : !c.baseline.pass && c.candidate.pass ? "improvement" : "same")

function format(v: number, f: Agent5Metric["format"], locale: string) {
  if (f === "percent") return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(v)
  if (f === "ms") return v < 1000 ? `${Math.round(v)} ms` : `${(v / 1000).toFixed(2)} s`
  if (f === "currency") return new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 4 }).format(v)
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(v)
}

function PassMark({ pass, label }: { pass: boolean; label: string }) {
  const Icon = pass ? CircleCheck : CircleX
  return (
    <span className="inline-flex items-center gap-1 text-xs whitespace-nowrap">
      <Icon aria-hidden="true" className={cn("size-3.5", pass ? "text-chart-2" : "text-destructive")} />
      {pass ? "Pass" : "Fail"}
      <span className="sr-only"> ({label})</span>
    </span>
  )
}

function EvalSkeleton() {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

/**
 * Evaluation results for a prompt or model change: the verdict, each metric against the baseline with which way is better, the cases
 * filtered to regressions or improvements, and for the selected case the input, what was expected and both answers with a diff.
 */
function Agent5({
  title = "Support replies eval",
  baselineLabel = "Prompt v12 · Lyra XL",
  candidateLabel = "Prompt v13 · Lyra XL",
  metrics = sampleMetrics,
  cases = sampleCases,
  locale = "en-US",
  onShip,
  onKeepBaseline,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Agent5Props) {
  const id = React.useId()
  const [filter, setFilter] = React.useState<"all" | "regression" | "improvement" | "failing">("all")
  const regressions = cases.filter((c) => changeOf(c) === "regression")
  const improvements = cases.filter((c) => changeOf(c) === "improvement")
  const visible = cases.filter((c) => (filter === "all" ? true : filter === "failing" ? !c.candidate.pass : changeOf(c) === filter))
  const [caseId, setCaseId] = React.useState(regressions[0]?.id ?? cases[0]?.id)
  const selected = visible.find((c) => c.id === caseId) ?? visible[0]
  const [view, setView] = React.useState<"side" | "diff">("side")
  const ready = state === "ready"

  return (
    <section data-slot="agent-5" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1 basis-72">
          <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em]">
            {title}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            <span className="text-foreground font-medium">{candidateLabel}</span> against {baselineLabel}
            {ready ? `, ${cases.length} cases` : ""}
          </p>
        </div>
        {ready && (onShip || onKeepBaseline) ? (
          <div className="flex gap-2">
            {onKeepBaseline ? (
              <Button variant="outline" size="sm" onClick={onKeepBaseline}>
                Keep baseline
              </Button>
            ) : null}
            {onShip ? (
              <Button size="sm" onClick={onShip}>
                Ship candidate
              </Button>
            ) : null}
          </div>
        ) : null}
      </header>

      <StateView
        state={ready && !cases.length ? "empty" : state}
        onRetry={onRetry}
        label="Loading eval results"
        loading={<EvalSkeleton />}
        empty={{ title: emptyState?.title ?? "No results yet", description: emptyState?.description ?? "Run the suite to compare the candidate with the baseline.", icon: emptyState?.icon ?? <FlaskConical />, action: emptyState?.action }}
        error={{ title: errorState?.title ?? "Results could not be loaded", ...errorState }}
        className="mt-6"
      >
        <div className="grid gap-6">
          <div
            role="status"
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-sm",
              regressions.length ? "border-chart-3/40 bg-chart-3/10" : "border-chart-2/40 bg-chart-2/10"
            )}
          >
            {regressions.length ? <TriangleAlert aria-hidden="true" className="text-chart-3 mt-0.5 size-4 shrink-0" /> : <CircleCheck aria-hidden="true" className="text-chart-2 mt-0.5 size-4 shrink-0" />}
            <p className="text-pretty">
              {regressions.length
                ? `${improvements.length} ${improvements.length === 1 ? "case" : "cases"} improved, but ${regressions.length} ${regressions.length === 1 ? "case that passed now fails" : "cases that passed now fail"}. Review ${regressions.length === 1 ? "it" : "them"} before shipping.`
                : `${improvements.length} ${improvements.length === 1 ? "case" : "cases"} improved and nothing that passed now fails.`}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {metrics.map((m) => {
              const diff = m.candidate - m.baseline
              const better = diff === 0 ? null : (diff > 0) === (m.higherIsBetter ?? true)
              const Arrow = diff === 0 ? Minus : diff > 0 ? ArrowUp : ArrowDown
              return (
                <div key={m.id} className="bg-card rounded-xl border p-4">
                  <dt className="text-muted-foreground text-xs">{m.label}</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{format(m.candidate, m.format, locale)}</dd>
                  <dd className="mt-1 flex flex-wrap items-center gap-1.5 text-xs tabular-nums">
                    <span className={cn("inline-flex items-center gap-0.5 font-medium", better === null && "text-muted-foreground")}>
                      <Arrow aria-hidden="true" className={cn("size-3", better === null ? "" : better ? "text-chart-2" : "text-destructive")} />
                      {better === null ? "No change" : better ? "Better" : "Worse"}
                    </span>
                    <span className="text-muted-foreground">from {format(m.baseline, m.format, locale)}</span>
                  </dd>
                </div>
              )
            })}
          </dl>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="grid min-w-0 content-start gap-3">
              <SegmentedControl value={filter} onValueChange={(v) => setFilter(v as typeof filter)} aria-label="Show cases" size="sm">
                <SegmentedControlItem value="all">All {cases.length}</SegmentedControlItem>
                <SegmentedControlItem value="regression">Regressions {regressions.length}</SegmentedControlItem>
                <SegmentedControlItem value="improvement">Improved {improvements.length}</SegmentedControlItem>
                <SegmentedControlItem value="failing">Failing</SegmentedControlItem>
              </SegmentedControl>
              <ul aria-label="Cases" className="grid gap-1.5">
                {visible.map((c) => {
                  const change = changeOf(c)
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        aria-pressed={c.id === selected?.id}
                        onClick={() => setCaseId(c.id)}
                        className="bg-card hover:bg-accent/50 aria-pressed:border-ring aria-pressed:ring-ring/20 grid w-full gap-1.5 rounded-lg border p-3 text-start outline-none aria-pressed:ring-2 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <span className="line-clamp-2 text-sm text-pretty">{c.input}</span>
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <PassMark pass={c.baseline.pass} label="baseline" />
                          <span aria-hidden="true" className="text-muted-foreground text-xs">→</span>
                          <PassMark pass={c.candidate.pass} label="candidate" />
                          {change !== "same" ? (
                            <span className={cn("rounded px-1.5 text-[10px] leading-4 font-medium uppercase", change === "regression" ? "border-destructive/40 bg-destructive/10 text-foreground border" : "border-chart-2/40 bg-chart-2/15 text-foreground border")}>
                              {change === "regression" ? "Regression" : "Improved"}
                            </span>
                          ) : null}
                          {c.tags?.map((t) => (
                            <span key={t} className="text-muted-foreground text-xs">
                              #{t}
                            </span>
                          ))}
                        </span>
                      </button>
                    </li>
                  )
                })}
                {!visible.length ? <li className="text-muted-foreground py-8 text-center text-sm">No cases here.</li> : null}
              </ul>
            </div>

            {selected ? (
              <article aria-label="Case details" className="bg-card grid h-fit min-w-0 gap-4 rounded-xl border p-5">
                <div>
                  <h3 className="text-muted-foreground text-xs font-medium">Input</h3>
                  <p className="mt-1 text-sm text-pretty">{selected.input}</p>
                </div>
                {selected.expected ? (
                  <div>
                    <h3 className="text-muted-foreground text-xs font-medium">Expected</h3>
                    <p className="mt-1 text-sm text-pretty">{selected.expected}</p>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-muted-foreground text-xs font-medium">Answers</h3>
                  <SegmentedControl value={view} onValueChange={(v) => setView(v as typeof view)} aria-label="Answer view" size="sm">
                    <SegmentedControlItem value="side">Side by side</SegmentedControlItem>
                    <SegmentedControlItem value="diff">Diff</SegmentedControlItem>
                  </SegmentedControl>
                </div>
                {view === "side" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["baseline", "candidate"] as const).map((k) => (
                      <div key={k} className={cn("rounded-lg border p-3", selected[k].pass ? "border-border" : "border-destructive/40")}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium">{k === "baseline" ? "Baseline" : "Candidate"}</p>
                          <span className="flex items-center gap-2">
                            {selected[k].score !== undefined ? <span className="text-muted-foreground text-xs tabular-nums">{selected[k].score!.toFixed(2)}</span> : null}
                            <PassMark pass={selected[k].pass} label={k} />
                          </span>
                        </div>
                        <p className="mt-2 text-[13px] leading-relaxed text-pretty">{selected[k].output}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <DiffViewer before={selected.baseline.output} after={selected.candidate.output} label="baseline → candidate" />
                )}
              </article>
            ) : null}
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Agent5, type Agent5Props, type Agent5Case, type Agent5Metric, type Agent5Result }
