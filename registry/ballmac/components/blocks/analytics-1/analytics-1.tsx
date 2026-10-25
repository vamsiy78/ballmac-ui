// Ballmac UI: Analytics 1. https://ui.ballmac.com/blocks/analytics-1
"use client"

import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

import { BarList, type BarListItem } from "@/components/ballmac/bar-list"
import { FunnelChart, type FunnelStep } from "@/components/ballmac/funnel-chart"
import { Skeleton } from "@/components/ballmac/skeleton"
import { Sparkline } from "@/components/ballmac/sparkline"
import { SplitBar, type SplitSegment } from "@/components/ballmac/split-bar"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Analytics1Metric = { id: string; label: string; value: string; change: number; series: number[] }
type Analytics1Period = {
  id: string
  label: string
  metrics: Analytics1Metric[]
  funnel: FunnelStep[]
  lists: { id: string; label: string; items: BarListItem[] }[]
  devices: SplitSegment[]
}

type Analytics1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    periods?: Analytics1Period[]
    /** The period shown first (an id). */
    defaultPeriod?: string
    onPeriodChange?: (id: string) => void
  }

const sparkline = (n: number, trend: number, wobble = 0.18) => Array.from({ length: 14 }, (_, i) => Math.round(n * (1 + trend * (i / 13) + Math.sin(i * 1.7 + n) * wobble * 0.3)))

const samplePeriods: Analytics1Period[] = [
  {
    id: "7d",
    label: "7 days",
    metrics: [
      { id: "v", label: "Visitors", value: "48,210", change: 8.2, series: sparkline(6800, 0.12) },
      { id: "s", label: "Signups", value: "1,930", change: 14.6, series: sparkline(270, 0.2) },
      { id: "c", label: "Conversion", value: "4.0%", change: 0.3, series: sparkline(40, 0.04) },
      { id: "r", label: "Revenue", value: "$18,420", change: -2.1, series: sparkline(2600, -0.04) },
    ],
    funnel: [
      { id: "visit", label: "Visited the site", value: 48210, hint: "Unique visitors" },
      { id: "pricing", label: "Viewed pricing", value: 19800 },
      { id: "start", label: "Started checkout", value: 4120 },
      { id: "pay", label: "Paid", value: 1385 },
    ],
    lists: [
      { id: "pages", label: "Pages", items: [{ id: "p1", label: "/pricing", value: 12840 }, { id: "p2", label: "/docs/getting-started", value: 9310 }, { id: "p3", label: "/blog/launch-week", value: 7420 }, { id: "p4", label: "/components", value: 5180 }, { id: "p5", label: "/changelog", value: 3960 }, { id: "p6", label: "/about", value: 1210 }] },
      { id: "sources", label: "Sources", items: [{ id: "s1", label: "Google", value: 18200 }, { id: "s2", label: "Direct", value: 11400 }, { id: "s3", label: "Hacker News", value: 8300 }, { id: "s4", label: "X", value: 5100 }, { id: "s5", label: "Newsletter", value: 2900 }] },
      { id: "countries", label: "Countries", items: [{ id: "c1", label: "United States", value: 16400 }, { id: "c2", label: "Germany", value: 6100 }, { id: "c3", label: "United Kingdom", value: 5900 }, { id: "c4", label: "India", value: 4800 }, { id: "c5", label: "France", value: 3200 }] },
    ],
    devices: [{ id: "d", label: "Desktop", value: 27600 }, { id: "m", label: "Mobile", value: 17900 }, { id: "t", label: "Tablet", value: 2710 }],
  },
  {
    id: "30d",
    label: "30 days",
    metrics: [
      { id: "v", label: "Visitors", value: "196,480", change: 11.9, series: sparkline(6500, 0.18) },
      { id: "s", label: "Signups", value: "7,820", change: 9.4, series: sparkline(260, 0.1) },
      { id: "c", label: "Conversion", value: "3.9%", change: -0.2, series: sparkline(39, -0.03) },
      { id: "r", label: "Revenue", value: "$74,960", change: 6.8, series: sparkline(2500, 0.1) },
    ],
    funnel: [
      { id: "visit", label: "Visited the site", value: 196480, hint: "Unique visitors" },
      { id: "pricing", label: "Viewed pricing", value: 80300 },
      { id: "start", label: "Started checkout", value: 16900 },
      { id: "pay", label: "Paid", value: 5610 },
    ],
    lists: [
      { id: "pages", label: "Pages", items: [{ id: "p1", label: "/pricing", value: 51200 }, { id: "p2", label: "/docs/getting-started", value: 38100 }, { id: "p3", label: "/blog/launch-week", value: 30200 }, { id: "p4", label: "/components", value: 21400 }, { id: "p5", label: "/changelog", value: 16100 }, { id: "p6", label: "/about", value: 5100 }] },
      { id: "sources", label: "Sources", items: [{ id: "s1", label: "Google", value: 74800 }, { id: "s2", label: "Direct", value: 46100 }, { id: "s3", label: "Hacker News", value: 33200 }, { id: "s4", label: "X", value: 20900 }, { id: "s5", label: "Newsletter", value: 11800 }] },
      { id: "countries", label: "Countries", items: [{ id: "c1", label: "United States", value: 66900 }, { id: "c2", label: "Germany", value: 24800 }, { id: "c3", label: "United Kingdom", value: 23700 }, { id: "c4", label: "India", value: 19600 }, { id: "c5", label: "France", value: 13100 }] },
    ],
    devices: [{ id: "d", label: "Desktop", value: 112400 }, { id: "m", label: "Mobile", value: 73200 }, { id: "t", label: "Tablet", value: 10880 }],
  },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-80 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>
    </div>
  )
}

/**
 * A product analytics page that reads like a report: four metrics with their change and a trend, the funnel from visit to payment with where people drop out,
 * a tabbed ranking of pages, sources or countries, and how traffic splits by device. Switching the period swaps all of it.
 */
function Analytics1({ title = "Analytics", description = "How people find the product, and where they stop.", periods = samplePeriods, defaultPeriod, onPeriodChange, state = "ready", onRetry, emptyState, errorState, className, ...props }: Analytics1Props) {
  const id = React.useId()
  const [pid, setPid] = React.useState(defaultPeriod ?? periods[1]?.id ?? periods[0]?.id)
  const [tab, setTab] = React.useState<string>("pages")
  const [step, setStep] = React.useState<string | null>(null)
  const period = periods.find((p) => p.id === pid) ?? periods[0]
  const view = state === "ready" && !period ? "empty" : state
  const list = period?.lists.find((l) => l.id === tab) ?? period?.lists[0]
  const total = period?.devices.reduce((s, d) => s + d.value, 0) ?? 0

  return (
    <section data-slot="analytics-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
        </div>
        {period && (
          <div role="radiogroup" aria-label="Period" className="flex gap-0.5 rounded-lg border bg-card p-0.5">
            {periods.map((p) => (
              <label key={p.id} className="relative">
                <input type="radio" name={`${id}-period`} className="peer sr-only" checked={pid === p.id} onChange={() => { setPid(p.id); onPeriodChange?.(p.id) }} />
                <span className="flex h-8 cursor-pointer items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 motion-reduce:transition-none">{p.label}</span>
              </label>
            ))}
          </div>
        )}
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading analytics" loading={<Skel />} empty={{ title: "No data for this period", description: "When people visit, their activity appears here.", ...emptyState }} error={{ title: "Analytics could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {period && (
          <div className="grid gap-6">
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              {period.metrics.map((m) => (
                <div key={m.id} className="grid min-w-0 gap-1 rounded-xl border bg-card p-4">
                  <dt className="text-xs font-medium text-muted-foreground">{m.label}</dt>
                  <dd className="text-2xl font-semibold tracking-[-0.03em] tabular-nums">{m.value}</dd>
                  <dd className="flex flex-wrap items-center gap-x-1 text-xs font-medium whitespace-nowrap tabular-nums">
                    {m.change > 0 ? <ArrowUpRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" /> : m.change < 0 ? <ArrowDownRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" /> : <Minus aria-hidden="true" className="size-3.5" />}
                    {m.change === 0 ? "No change" : `${m.change > 0 ? "Up" : "Down"} ${Math.abs(m.change)}%`}
                    <span className="font-normal text-muted-foreground max-sm:sr-only">vs the period before</span>
                  </dd>
                  <dd className="mt-1 text-foreground/70"><Sparkline values={m.series} label={`${m.label} over the period`} height={28} showEnd={false} /></dd>
                </div>
              ))}
            </dl>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <div className="grid gap-3 rounded-xl border bg-card p-5">
                <h2 className="text-sm font-semibold">Visit to purchase</h2>
                <FunnelChart steps={period.funnel} selected={step} onSelect={setStep} />
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3 rounded-xl border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold">Top {list?.label.toLowerCase()}</h2>
                    <div role="tablist" aria-label="Ranking" className="flex gap-0.5">
                      {period.lists.map((l) => (
                        <button key={l.id} role="tab" type="button" id={`${id}-tab-${l.id}`} aria-selected={list?.id === l.id} aria-controls={`${id}-panel`} tabIndex={list?.id === l.id ? 0 : -1} onClick={() => setTab(l.id)} onKeyDown={(e) => {
                          const i = period.lists.findIndex((x) => x.id === l.id)
                          const n = e.key === "ArrowRight" ? (i + 1) % period.lists.length : e.key === "ArrowLeft" ? (i - 1 + period.lists.length) % period.lists.length : -1
                          if (n < 0) return
                          e.preventDefault()
                          setTab(period.lists[n].id)
                          document.getElementById(`${id}-tab-${period.lists[n].id}`)?.focus()
                        }} className="h-8 rounded-md px-2.5 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-selected:bg-accent aria-selected:text-foreground">{l.label}</button>
                      ))}
                    </div>
                  </div>
                  <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${list?.id}`}>
                    {list && <BarList items={list.items} limit={5} showShare />}
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-5">
                  <SplitBar title="Devices" total={total.toLocaleString("en-US")} segments={period.devices} />
                </div>
              </div>
            </div>
          </div>
        )}
      </StateView>
    </section>
  )
}

export { Analytics1, type Analytics1Metric, type Analytics1Period, type Analytics1Props }
