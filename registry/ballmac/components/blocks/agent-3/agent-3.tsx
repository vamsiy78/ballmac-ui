// Ballmac UI: Agent 3. https://ui.ballmac.com/blocks/agent-3
"use client"

import * as React from "react"
import { Activity, Brain, CircleAlert, CircleCheck, Database, LoaderCircle, Search, Workflow, Wrench } from "lucide-react"

import { JsonViewer } from "@/components/ballmac/json-viewer"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Agent3SpanKind = "llm" | "tool" | "retrieval" | "step"

type Agent3Span = {
  id: string
  name: string
  kind: Agent3SpanKind
  /** Milliseconds from the start of the run. */
  start: number
  /** Milliseconds. */
  duration: number
  status?: "ok" | "error"
  /** Nesting level: 0 for top-level steps, 1 for what runs inside them, and so on. */
  depth?: number
  tokens?: number
  input?: unknown
  output?: unknown
  error?: string
}

type Agent3Run = {
  id: string
  agent: string
  task: string
  status: "success" | "error" | "running"
  /** When it started, already written for people ("Today 09:14"). */
  started: string
  /** Milliseconds. */
  duration: number
  tokens: number
  /** Already formatted ("$0.12"). */
  cost?: string
  spans: Agent3Span[]
}

type Agent3Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    /** Runs, newest first. */
    runs?: Agent3Run[]
    title?: string
    /** The run selected at first. Defaults to the first one. */
    defaultRunId?: string
    /** Locale for numbers. */
    locale?: string
  }

const sample: Agent3Run[] = [
  {
    id: "run_9f2",
    agent: "Support agent",
    task: "Refund the duplicate charge on order 4821",
    status: "success",
    started: "Today 09:14",
    duration: 8420,
    tokens: 18420,
    cost: "$0.06",
    spans: [
      { id: "s1", name: "plan", kind: "llm", start: 0, duration: 1900, tokens: 2210, input: { messages: 3 }, output: { steps: 4 } },
      { id: "s2", name: "Find the order", kind: "step", start: 1900, duration: 1300 },
      { id: "s3", name: "orders.get", kind: "tool", start: 1950, duration: 420, depth: 1, input: { id: 4821 }, output: { total: "$129.00", payments: 2 } },
      { id: "s4", name: "payments.list", kind: "tool", start: 2400, duration: 610, depth: 1, input: { order: 4821 }, output: [{ id: "ch_1" }, { id: "ch_2" }] },
      { id: "s5", name: "Search refund policy", kind: "retrieval", start: 3200, duration: 880, depth: 0, input: { query: "duplicate charge refund" }, output: { documents: 3 } },
      { id: "s6", name: "decide", kind: "llm", start: 4100, duration: 2600, tokens: 9820, input: { messages: 9 }, output: { action: "refund", charge: "ch_2" } },
      { id: "s7", name: "payments.refund", kind: "tool", start: 6800, duration: 1100, input: { charge: "ch_2" }, output: { status: "succeeded" } },
      { id: "s8", name: "email.send", kind: "tool", start: 7950, duration: 470, input: { to: "jordan@acme.com", template: "refund" }, output: { id: "msg_31" } },
    ],
  },
  {
    id: "run_9e7",
    agent: "Ops agent",
    task: "Summarize failed deploys this week",
    status: "error",
    started: "Today 08:02",
    duration: 5120,
    tokens: 12904,
    cost: "$0.04",
    spans: [
      { id: "t1", name: "plan", kind: "llm", start: 0, duration: 1400, tokens: 1804 },
      { id: "t2", name: "deploys.list", kind: "tool", start: 1400, duration: 1240, output: { deploys: 142 } },
      { id: "t3", name: "logs.search", kind: "tool", start: 2700, duration: 2420, status: "error", error: "Timed out after 2.4 s: the log service did not answer.", input: { status: "failed", since: "7d" } },
    ],
  },
  {
    id: "run_9d1",
    agent: "Research agent",
    task: "Compare pricing pages of five competitors",
    status: "running",
    started: "Today 07:40",
    duration: 21300,
    tokens: 40210,
    spans: [
      { id: "u1", name: "plan", kind: "llm", start: 0, duration: 2100, tokens: 2400 },
      { id: "u2", name: "web.fetch", kind: "tool", start: 2100, duration: 9200 },
      { id: "u3", name: "extract", kind: "llm", start: 11300, duration: 10000, tokens: 21800 },
    ],
  },
]

const kindMeta: Record<Agent3SpanKind, { label: string; icon: typeof Brain; bar: string }> = {
  llm: { label: "Model call", icon: Brain, bar: "bg-chart-1" },
  tool: { label: "Tool call", icon: Wrench, bar: "bg-chart-2" },
  retrieval: { label: "Retrieval", icon: Database, bar: "bg-chart-4" },
  step: { label: "Step", icon: Workflow, bar: "bg-muted-foreground/50" },
}

const runStatus = {
  success: { label: "Succeeded", icon: CircleCheck, tone: "text-chart-2" },
  error: { label: "Failed", icon: CircleAlert, tone: "text-destructive" },
  running: { label: "Running", icon: LoaderCircle, tone: "text-muted-foreground" },
} as const

const seconds = (ms: number) => (ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(ms < 10000 ? 2 : 1)} s`)

function RunsSkeleton() {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <div className="grid gap-2 rounded-xl border p-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-9" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

/** The waterfall: one row per span, a bar placed by its start and sized by its duration, against the run's total time. */
function Trace({ run, locale }: { run: Agent3Run; locale: string }) {
  const nf = new Intl.NumberFormat(locale)
  const total = Math.max(run.duration, ...run.spans.map((s) => s.start + s.duration), 1)
  const [spanId, setSpanId] = React.useState(run.spans.find((s) => s.status === "error")?.id ?? run.spans[0]?.id)
  const span = run.spans.find((s) => s.id === spanId)
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="bg-card min-w-0 rounded-xl border">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Trace</h3>
          <ul aria-label="Legend" className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            {(Object.keys(kindMeta) as Agent3SpanKind[]).map((k) => (
              <li key={k} className="flex items-center gap-1.5">
                <span aria-hidden="true" className={cn("h-2 w-3 rounded-sm", kindMeta[k].bar)} />
                {kindMeta[k].label}
              </li>
            ))}
          </ul>
        </div>
        <ul aria-label={`Spans in ${run.task}`} className="grid p-2">
          {run.spans.map((s) => {
            const meta = kindMeta[s.kind]
            const Icon = meta.icon
            const failed = s.status === "error"
            return (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={s.id === spanId}
                  onClick={() => setSpanId(s.id)}
                  className={cn(
                    "grid w-full grid-cols-[minmax(7rem,12rem)_1fr] items-center gap-3 rounded-md px-2 py-1.5 text-start outline-none",
                    "hover:bg-accent/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-accent"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5 text-xs" style={{ paddingInlineStart: `${(s.depth ?? 0) * 0.875}rem` }}>
                    <Icon aria-hidden="true" className={cn("size-3.5 shrink-0", failed ? "text-destructive" : "text-muted-foreground")} />
                    <span dir="ltr" className="truncate font-mono">{s.name}</span>
                    <span className="sr-only">
                      , {meta.label}, starts at {seconds(s.start)}, takes {seconds(s.duration)}
                      {failed ? ", failed" : ""}
                    </span>
                  </span>
                  <span aria-hidden="true" className="bg-muted/60 relative h-4 rounded-sm">
                    <span
                      className={cn("absolute inset-y-0.5 min-w-1 rounded-sm", failed ? "bg-destructive" : meta.bar)}
                      style={{ insetInlineStart: `${(s.start / total) * 100}%`, width: `${(s.duration / total) * 100}%` }}
                    />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <div aria-hidden="true" className="text-muted-foreground flex justify-between border-t px-4 py-2 font-mono text-[10px] tabular-nums">
          <span>0</span>
          <span>{seconds(total / 2)}</span>
          <span>{seconds(total)}</span>
        </div>
      </div>

      {span ? (
        <aside aria-label="Span details" className="bg-card grid h-fit min-w-0 gap-3 rounded-xl border p-4">
          <div>
            <p className="text-muted-foreground text-xs">{kindMeta[span.kind].label}</p>
            <h4 dir="ltr" className="mt-0.5 text-start font-mono text-sm font-semibold break-all">{span.name}</h4>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-medium tabular-nums">{seconds(span.duration)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Starts at</dt>
              <dd className="font-medium tabular-nums">{seconds(span.start)}</dd>
            </div>
            {span.tokens ? (
              <div>
                <dt className="text-muted-foreground">Tokens</dt>
                <dd className="font-medium tabular-nums">{nf.format(span.tokens)}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className={cn("font-medium", span.status === "error" && "text-destructive")}>{span.status === "error" ? "Failed" : "OK"}</dd>
            </div>
          </dl>
          {span.error ? (
            <p role="note" className="border-destructive/30 bg-destructive/5 rounded-md border p-2 text-xs text-pretty">
              {span.error}
            </p>
          ) : null}
          {span.input !== undefined ? (
            <div className="grid gap-1.5">
              <h5 className="text-muted-foreground text-xs font-medium">Input</h5>
              <JsonViewer value={span.input} label="Input" defaultExpandedDepth={1} />
            </div>
          ) : null}
          {span.output !== undefined ? (
            <div className="grid gap-1.5">
              <h5 className="text-muted-foreground text-xs font-medium">Output</h5>
              <JsonViewer value={span.output} label="Output" defaultExpandedDepth={1} />
            </div>
          ) : null}
        </aside>
      ) : null}
    </div>
  )
}

/**
 * Agent runs and their traces: every run with status, time, tokens and cost, filtered by status or searched, and for the selected
 * run a waterfall of model calls, tool calls and retrieval with each span's input, output and error.
 */
function Agent3({
  runs = sample,
  title = "Runs",
  defaultRunId,
  locale = "en-US",
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Agent3Props) {
  const id = React.useId()
  const nf = new Intl.NumberFormat(locale)
  const [filter, setFilter] = React.useState<"all" | "error" | "running">("all")
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const visible = runs.filter((r) => (filter === "all" || r.status === filter) && (!q || `${r.task} ${r.agent} ${r.id}`.toLowerCase().includes(q)))
  const [runId, setRunId] = React.useState(defaultRunId ?? runs[0]?.id)
  const run = visible.find((r) => r.id === runId) ?? visible[0]
  const ready = state === "ready"

  return (
    <section data-slot="agent-3" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="flex flex-wrap items-center gap-3">
        <h2 id={`${id}-title`} className="flex-1 text-2xl font-semibold tracking-[-0.03em]">
          {title}
        </h2>
        <div className="bg-background focus-within:ring-ring/50 flex h-9 w-full items-center gap-2 rounded-md border px-2.5 focus-within:ring-[3px] sm:w-56">
          <Search aria-hidden="true" className="text-muted-foreground size-4" />
          <input type="search" aria-label="Search runs" placeholder="Search runs" value={query} onChange={(e) => setQuery(e.target.value)} disabled={!ready} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
        <SegmentedControl value={filter} onValueChange={(v) => setFilter(v as typeof filter)} aria-label="Status" size="sm" disabled={!ready}>
          <SegmentedControlItem value="all">All</SegmentedControlItem>
          <SegmentedControlItem value="error">Failed</SegmentedControlItem>
          <SegmentedControlItem value="running">Running</SegmentedControlItem>
        </SegmentedControl>
      </header>

      <StateView
        state={ready && !runs.length ? "empty" : state}
        onRetry={onRetry}
        label="Loading runs"
        loading={<RunsSkeleton />}
        empty={{ title: emptyState?.title ?? "No runs yet", description: emptyState?.description ?? "Each time an agent works on a task, its run and trace appear here.", icon: emptyState?.icon ?? <Activity />, action: emptyState?.action }}
        error={{ title: errorState?.title ?? "Runs could not be loaded", ...errorState }}
        className="mt-6"
      >
        <div className="grid gap-4">
          <div tabIndex={0} role="region" aria-label="Runs table" className="bg-card overflow-x-auto rounded-xl border outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-start text-xs">
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">Task</th>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">Status</th>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">Started</th>
                  <th scope="col" className="px-4 py-2.5 text-end font-medium">Duration</th>
                  <th scope="col" className="px-4 py-2.5 text-end font-medium">Tokens</th>
                  <th scope="col" className="px-4 py-2.5 text-end font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const s = runStatus[r.status]
                  const Icon = s.icon
                  const sel = r.id === run?.id
                  return (
                    <tr key={r.id} data-selected={sel || undefined} className="data-[selected]:bg-accent/60 border-b last:border-0">
                      <td className="max-w-80 px-4 py-2.5">
                        <button type="button" aria-pressed={sel} onClick={() => setRunId(r.id)} className="block w-full rounded-sm text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                          <span className="block truncate font-medium">{r.task}</span>
                          <span className="text-muted-foreground block truncate text-xs">{r.agent}</span>
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap">
                          <Icon aria-hidden="true" className={cn("size-3.5", s.tone)} />
                          {s.label}
                        </span>
                      </td>
                      <td className="text-muted-foreground px-4 py-2.5 text-xs whitespace-nowrap">{r.started}</td>
                      <td className="px-4 py-2.5 text-end tabular-nums">{seconds(r.duration)}</td>
                      <td className="px-4 py-2.5 text-end tabular-nums">{nf.format(r.tokens)}</td>
                      <td className="px-4 py-2.5 text-end tabular-nums">{r.cost ?? "—"}</td>
                    </tr>
                  )
                })}
                {!visible.length ? (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground px-4 py-8 text-center text-sm">
                      No runs match.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {run ? <Trace key={run.id} run={run} locale={locale} /> : null}
        </div>
      </StateView>
    </section>
  )
}

export { Agent3, type Agent3Props, type Agent3Run, type Agent3Span, type Agent3SpanKind }
