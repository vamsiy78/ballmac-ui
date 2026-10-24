// Ballmac UI: Cost 1. https://ui.ballmac.com/blocks/cost-1
"use client"

import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Check, Minus, TriangleAlert } from "lucide-react"

import { BulletChart } from "@/components/ballmac/bullet-chart"
import { Button } from "@/components/ballmac/button"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Treemap, type TreemapItem } from "@/components/ballmac/treemap"
import { WaterfallChart, type WaterfallStep } from "@/components/ballmac/waterfall-chart"
import { cn } from "@/lib/utils"

type Cost1Anomaly = {
  id: string
  /** What looks wrong, in a sentence. */
  text: string
  /** How much extra it cost, in the ledger's currency. */
  amount: number
  /** Where it was seen, such as "Model inference". */
  service: string
}

type Cost1Period = {
  id: string
  /** For example "This month". */
  label: string
  /** Spend in the period. */
  total: number
  /** Spend in the period before it, for the comparison. */
  previous: number
  /** A budget for the period, if there is one. */
  budget?: number
  /** Spend by service. */
  items: TreemapItem[]
  /** How the previous period's total became this one's: a start, the changes and an end. */
  bridge: WaterfallStep[]
  anomalies?: Cost1Anomaly[]
}

type Cost1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    periods?: Cost1Period[]
    title?: string
    /** ISO currency code. */
    currency?: string
    /** The period shown at first. */
    defaultPeriod?: string
    /** Called when someone marks an unusual cost as looked at. Reject and it stays with the message. */
    onAcknowledge?: (anomaly: Cost1Anomaly) => void | Promise<void>
  }

const items = (a: [string, number, string][]): TreemapItem[] => a.map(([label, value, group]) => ({ id: label.toLowerCase().replace(/\W+/g, "-"), label, value, group }))
const sample: Cost1Period[] = [
  {
    id: "now",
    label: "This month",
    total: 15760,
    previous: 14120,
    budget: 16000,
    items: items([["Compute", 4210, "Production"], ["Database", 2380, "Production"], ["CDN", 1120, "Production"], ["Queues", 340, "Production"], ["Model inference", 3150, "AI"], ["Vector store", 760, "AI"], ["Embeddings", 410, "AI"], ["CI runners", 920, "Developer"], ["Logs", 1450, "Observability"], ["Metrics", 530, "Observability"], ["Traces", 210, "Observability"], ["Other", 280, "Other"]]),
    bridge: [{ id: "s", label: "Last month", value: 14120, kind: "total" }, { id: "a", label: "Inference", value: 1180 }, { id: "b", label: "Compute", value: 640 }, { id: "c", label: "Logs", value: 410 }, { id: "d", label: "CDN", value: -290 }, { id: "e", label: "Other", value: -300 }, { id: "t", label: "This month", value: 15760, kind: "total" }],
    anomalies: [
      { id: "an1", service: "Model inference", amount: 640, text: "Spend on model calls jumped 38% on 14 October and has stayed there. The new assistant went live that day." },
      { id: "an2", service: "Logs", amount: 210, text: "The checkout service started logging every request body on 9 October." },
    ],
  },
  {
    id: "last",
    label: "Last month",
    total: 14120,
    previous: 13880,
    budget: 15000,
    items: items([["Compute", 3570, "Production"], ["Database", 2310, "Production"], ["CDN", 1410, "Production"], ["Queues", 330, "Production"], ["Model inference", 1970, "AI"], ["Vector store", 740, "AI"], ["Embeddings", 390, "AI"], ["CI runners", 880, "Developer"], ["Logs", 1040, "Observability"], ["Metrics", 510, "Observability"], ["Traces", 200, "Observability"], ["Other", 580, "Other"]]),
    bridge: [{ id: "s", label: "August", value: 13880, kind: "total" }, { id: "a", label: "Inference", value: 420 }, { id: "b", label: "Logs", value: 150 }, { id: "c", label: "Compute", value: -210 }, { id: "d", label: "Other", value: -120 }, { id: "t", label: "Last month", value: 14120, kind: "total" }],
  },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="aspect-[16/8] rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

/**
 * Where the cloud bill goes: the total against last period and the budget, spend by service as a treemap, how the total moved from last period as a waterfall,
 * and anything that looks unusual with what caused it. Switch period with the control; the comparison is always written in words, never only an arrow.
 */
function Cost1({ periods = sample, title = "Cloud cost", currency = "USD", defaultPeriod, onAcknowledge, state = "ready", onRetry, emptyState, errorState, className, ...props }: Cost1Props) {
  const id = React.useId()
  const [pid, setPid] = React.useState(defaultPeriod ?? periods[0]?.id)
  const [seen, setSeen] = React.useState<string[]>([])
  const [note, setNote] = React.useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const view = state === "ready" && periods.length === 0 ? "empty" : state
  const p = periods.find((x) => x.id === pid) ?? periods[0]
  const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)
  const delta = p ? p.total - p.previous : 0
  const pct = p && p.previous ? (delta / p.previous) * 100 : 0
  const open = (p?.anomalies ?? []).filter((a) => !seen.includes(a.id))

  async function acknowledge(a: Cost1Anomaly) {
    setBusy(a.id)
    setNote(null)
    try {
      await onAcknowledge?.(a)
      setSeen((s) => [...s, a.id])
      setNote({ ok: true, text: `Marked as looked at: ${a.service}.` })
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : "That did not go through, so it is still listed." })
    } finally {
      setBusy(null)
    }
  }

  return (
    <section data-slot="cost-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-pretty">What the infrastructure costs, where it goes, and what changed since last time.</p>
        </div>
        {view === "ready" && periods.length > 1 && (
          <SegmentedControl aria-label="Period" value={p?.id ?? ""} onValueChange={(v) => setPid(v)}>
            {periods.map((x) => (
              <SegmentedControlItem key={x.id} value={x.id}>{x.label}</SegmentedControlItem>
            ))}
          </SegmentedControl>
        )}
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading costs" loading={<Skel />} empty={{ title: "No cost data yet", description: "Connect a cloud account and its spend will be broken down here.", ...emptyState }} error={{ title: "Costs could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {p && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-card rounded-xl border p-4">
                <p className="text-muted-foreground text-xs">{p.label}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{money(p.total)}</p>
              </div>
              <div className="bg-card rounded-xl border p-4">
                <p className="text-muted-foreground text-xs">Compared with before</p>
                <p className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight tabular-nums">
                  {delta > 0 ? <ArrowUpRight aria-hidden="true" className="size-6 rtl:-scale-x-100" /> : delta < 0 ? <ArrowDownRight aria-hidden="true" className="size-6 rtl:-scale-x-100" /> : <Minus aria-hidden="true" className="size-6" />}
                  {Math.abs(Math.round(pct * 10) / 10)}%
                </p>
                <p className="text-muted-foreground mt-1 text-xs tabular-nums">{delta === 0 ? "No change" : `${money(Math.abs(delta))} ${delta > 0 ? "more" : "less"} than the period before`}</p>
              </div>
              <div className="bg-card rounded-xl border p-4">
                <p className="text-muted-foreground text-xs">Budget</p>
                {p.budget ? (
                  <>
                    <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{Math.round((p.total / p.budget) * 100)}%</p>
                    <p className={cn("mt-1 flex items-center gap-1.5 text-xs tabular-nums", p.total > p.budget ? "text-destructive font-medium" : "text-muted-foreground")}>
                      {p.total > p.budget ? <TriangleAlert aria-hidden="true" className="size-3.5" /> : <Check aria-hidden="true" className="size-3.5" />}
                      {p.total > p.budget ? `${money(p.total - p.budget)} over ${money(p.budget)}` : `${money(p.budget - p.total)} left of ${money(p.budget)}`}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground mt-2 text-sm">No budget set.</p>
                )}
              </div>
            </div>

            {p.budget && (
              <div className="bg-card mt-4 rounded-xl border p-4">
                <BulletChart items={[{ id: "b", label: "Spend against budget", value: p.total, target: p.budget, lowerIsBetter: true, max: Math.max(p.total, p.budget) * 1.15, ranges: [p.budget * 0.7, p.budget * 0.9] }]} format={money} />
              </div>
            )}

            <h2 className="mt-8 mb-3 text-lg font-semibold tracking-tight">By service</h2>
            <Treemap items={p.items} format={money} aspect={2.2} />

            <h2 className="mt-8 mb-3 text-lg font-semibold tracking-tight">What changed</h2>
            <WaterfallChart steps={p.bridge} format={(v) => money(v)} title={`Spend, ${p.bridge[0]?.label} to ${p.bridge[p.bridge.length - 1]?.label}`} />

            <h2 className="mt-8 mb-3 text-lg font-semibold tracking-tight">Unusual costs</h2>
            <div aria-live="polite">
              {note && <p role={note.ok ? "status" : "alert"} className={cn("mb-3 text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}
              {open.length ? (
                <ul className="grid gap-3">
                  {open.map((a) => (
                    <li key={a.id} className="bg-card flex flex-wrap items-start justify-between gap-3 rounded-xl border p-4">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-medium"><TriangleAlert aria-hidden="true" className="text-chart-3 size-4" /> {a.service} <span className="text-muted-foreground font-normal tabular-nums">· {money(a.amount)} extra</span></p>
                        <p className="text-muted-foreground mt-1 max-w-xl text-sm text-pretty">{a.text}</p>
                      </div>
                      <Button size="sm" variant="outline" disabled={busy === a.id} onClick={() => void acknowledge(a)} aria-label={`Mark the ${a.service} cost as looked at`}>Mark as looked at</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm">Nothing unusual in {p.label.toLowerCase()}.</p>
              )}
            </div>
          </>
        )}
      </StateView>
    </section>
  )
}

export { Cost1, type Cost1Anomaly, type Cost1Period, type Cost1Props }
