// Ballmac UI: Portfolio 1. https://ui.ballmac.com/blocks/portfolio-1
"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Briefcase, TrendingDown, TrendingUp } from "lucide-react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Portfolio1Holding = {
  id: string
  symbol: string
  name: string
  /** The group it belongs to, such as "Stocks" or "Bonds". */
  kind: string
  shares: number
  price: number
  /** Change today, as a percent. */
  dayPct: number
  /** Recent prices, oldest first, for the small line. */
  spark: number[]
}

type Portfolio1Range = "1W" | "1M" | "1Y"

type Portfolio1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    holdings?: Portfolio1Holding[]
    /** The value of the whole portfolio over time for each range, oldest first. */
    series?: Partial<Record<Portfolio1Range, number[]>>
    /** "Past week", "Past month", "Past year" labels are fixed; this is the first date label per range. */
    title?: string
    currency?: string
    locale?: string
    defaultRange?: Portfolio1Range
  }

const wave = (n: number, start: number, end: number, amp: number, phase: number) => Array.from({ length: n }, (_, i) => Math.round((start + ((end - start) * i) / (n - 1) + Math.sin(i * 0.9 + phase) * amp * (1 - i / (n * 1.6))) * 100) / 100)

const sample: Portfolio1Holding[] = [
  { id: "h1", symbol: "VTI", name: "Total US Market ETF", kind: "Stocks", shares: 210, price: 284.12, dayPct: 0.82, spark: wave(24, 262, 284, 3, 0) },
  { id: "h2", symbol: "VXUS", name: "Total International ETF", kind: "Stocks", shares: 340, price: 64.9, dayPct: -0.34, spark: wave(24, 62, 64.9, 1, 1) },
  { id: "h3", symbol: "BND", name: "Total Bond Market ETF", kind: "Bonds", shares: 520, price: 72.45, dayPct: 0.11, spark: wave(24, 71.5, 72.45, 0.3, 2) },
  { id: "h4", symbol: "AAPL", name: "Apple Inc.", kind: "Stocks", shares: 60, price: 231.7, dayPct: 1.46, spark: wave(24, 205, 231.7, 5, 0.5) },
  { id: "h5", symbol: "VNQ", name: "Real Estate ETF", kind: "Real estate", shares: 150, price: 91.38, dayPct: -0.62, spark: wave(24, 94, 91.38, 1.5, 2.5) },
  { id: "h6", symbol: "GLD", name: "Gold Trust", kind: "Commodities", shares: 45, price: 248.2, dayPct: 0.27, spark: wave(24, 236, 248.2, 2, 3) },
  { id: "h7", symbol: "CASH", name: "Money market", kind: "Cash", shares: 18400, price: 1, dayPct: 0, spark: wave(24, 1, 1, 0, 0) },
]

const sampleSeries: Record<Portfolio1Range, number[]> = {
  "1W": wave(7, 171900, 176583, 900, 0),
  "1M": wave(30, 164000, 176583, 2000, 1),
  "1Y": wave(52, 131500, 176583, 5200, 2),
}

const tones = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      <Skeleton className="h-72 rounded-3xl" />
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  )
}

function Spark({ data, up }: { data: number[]; up: boolean }) {
  if (data.length < 2 || Math.max(...data) === Math.min(...data)) return <span aria-hidden="true" className="bg-border block h-px w-20" />
  const lo = Math.min(...data)
  const hi = Math.max(...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 80},${22 - ((v - lo) / (hi - lo)) * 20}`).join(" ")
  return (
    <svg aria-hidden="true" viewBox="0 0 80 24" className="h-6 w-20">
      <polyline points={pts} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={up ? "stroke-chart-2" : "stroke-destructive"} />
    </svg>
  )
}

/**
 * An investment portfolio: the total value with how much it moved over a week, month or year, a line you can scrub with the pointer or arrow keys to read any
 * day's value, how the money is split as a ring, and every holding with its price, share of the portfolio, day change and a small line, sortable by column.
 * Everything is worked out from the holdings and the series you pass; gains and losses are written with a sign and an arrow, not only colored.
 */
function Portfolio1({ holdings = sample, series = sampleSeries, title = "Portfolio", currency = "USD", locale = "en", defaultRange = "1M", state = "ready", onRetry, emptyState, errorState, className, ...props }: Portfolio1Props) {
  const id = React.useId()
  const list = state === "empty" ? [] : holdings
  const [range, setRange] = React.useState<Portfolio1Range>(defaultRange)
  const [at, setAt] = React.useState<number | null>(null)
  const [kind, setKind] = React.useState<string | null>(null)
  const [sort, setSort] = React.useState<{ key: "symbol" | "value" | "day"; dir: 1 | -1 }>({ key: "value", dir: -1 })
  const money = (n: number, d = 0) => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: d, minimumFractionDigits: d }).format(n)
  const signed = (n: number, d = 2) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(d)}%`

  const data = series[range] ?? series["1M"] ?? []
  const total = list.reduce((n, h) => n + h.shares * h.price, 0)
  const first = data[0] ?? total
  const last = data.at(-1) ?? total
  const gain = last - first
  const gainPct = first ? (gain / first) * 100 : 0
  const shown = at === null ? last : (data[at] ?? last)
  const shownGain = shown - first
  const dayGain = list.reduce((n, h) => n + h.shares * h.price * (h.dayPct / (100 + h.dayPct)), 0)
  const kinds = [...new Set(list.map((h) => h.kind))]
  const byKind = kinds.map((k, i) => ({ k, v: list.filter((h) => h.kind === k).reduce((n, h) => n + h.shares * h.price, 0), c: tones[i % tones.length]! })).sort((a, b) => b.v - a.v)
  const rows = list
    .filter((h) => !kind || h.kind === kind)
    .map((h) => ({ h, value: h.shares * h.price }))
    .sort((a, b) => (sort.key === "symbol" ? a.h.symbol.localeCompare(b.h.symbol) : sort.key === "day" ? a.h.dayPct - b.h.dayPct : a.value - b.value) * sort.dir)

  // The area chart: a smooth line scaled to its own range, with a marker for the day being read.
  const W = 600
  const H = 180
  const lo = Math.min(...data)
  const hi = Math.max(...data)
  const x = (i: number) => (data.length > 1 ? (i / (data.length - 1)) * W : 0)
  const y = (v: number) => 12 + (hi === lo ? 0.5 : 1 - (v - lo) / (hi - lo)) * (H - 24)
  const line = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ")
  const area = `${line} L${W} ${H} L0 ${H} Z`
  const up = gain >= 0

  // The ring: each group is an arc whose length is its share.
  const R = 52
  const C = 2 * Math.PI * R
  let acc = 0

  const Th = ({ k, children, end }: { k: "symbol" | "value" | "day"; children: React.ReactNode; end?: boolean }) => (
    <th scope="col" aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={cn("px-4 py-3 font-medium", end ? "text-end" : "text-start")}>
      <button type="button" onClick={() => setSort((s) => (s.key === k ? { key: k, dir: (s.dir * -1) as 1 | -1 } : { key: k, dir: k === "symbol" ? 1 : -1 }))} className="focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm outline-none focus-visible:ring-[3px]">
        {children}
        {sort.key === k ? sort.dir === 1 ? <ArrowUp aria-hidden="true" className="size-3.5" /> : <ArrowDown aria-hidden="true" className="size-3.5" /> : <ArrowUpDown aria-hidden="true" className="size-3.5 opacity-40" />}
      </button>
    </th>
  )

  const content = !list.length ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Briefcase className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No holdings yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "Once you add or connect an account, your holdings and how they have done appear here."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="bg-card min-w-0 rounded-3xl border p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-sm">{at === null ? "Portfolio value" : `Value at point ${at + 1} of ${data.length}`}</p>
              <p className="text-4xl font-semibold tracking-[-0.045em] tabular-nums sm:text-5xl">{money(shown, 0)}</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium tabular-nums">
                {(at === null ? up : shownGain >= 0) ? <TrendingUp aria-hidden="true" className="text-chart-2 size-4" /> : <TrendingDown aria-hidden="true" className="text-destructive size-4" />}
                {at === null ? `${gain >= 0 ? "+" : "−"}${money(Math.abs(gain))} (${signed(gainPct)})` : `${shownGain >= 0 ? "+" : "−"}${money(Math.abs(shownGain))} since the start`}
                <span className="text-muted-foreground font-normal">{range === "1W" ? "this week" : range === "1M" ? "this month" : "this year"}</span>
              </p>
              <p className="text-muted-foreground mt-1 text-sm tabular-nums">
                Today {dayGain >= 0 ? "+" : "−"}
                {money(Math.abs(dayGain))}
              </p>
            </div>
            <SegmentedControl value={range} onValueChange={(v) => { setRange(v as Portfolio1Range); setAt(null) }} aria-label="Time range" size="sm">
              {(["1W", "1M", "1Y"] as const).map((r) => (
                <SegmentedControlItem key={r} value={r}>
                  {r}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>
          <div
            dir="ltr"
            role="slider"
            tabIndex={0}
            aria-label="Portfolio value over time"
            aria-valuemin={0}
            aria-valuemax={data.length - 1}
            aria-valuenow={at ?? data.length - 1}
            aria-valuetext={`${money(shown, 0)}, point ${(at ?? data.length - 1) + 1} of ${data.length}`}
            onKeyDown={(e) => {
              const cur = at ?? data.length - 1
              const n = e.key === "ArrowLeft" ? cur - 1 : e.key === "ArrowRight" ? cur + 1 : e.key === "Home" ? 0 : e.key === "End" ? data.length - 1 : null
              if (n === null) return
              e.preventDefault()
              setAt(Math.max(0, Math.min(data.length - 1, n)))
            }}
            onBlur={() => setAt(null)}
            onPointerLeave={() => setAt(null)}
            onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setAt(Math.max(0, Math.min(data.length - 1, Math.round(((e.clientX - r.left) / r.width) * (data.length - 1))))) }}
            className="focus-visible:ring-ring/50 relative mt-6 cursor-crosshair rounded-xl outline-none focus-visible:ring-[3px]"
          >
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-44 w-full" aria-hidden="true">
              <defs>
                <linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={up ? "var(--chart-2)" : "var(--destructive)"} stopOpacity="0.28" />
                  <stop offset="1" stopColor={up ? "var(--chart-2)" : "var(--destructive)"} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill={`url(#${id}-g)`} />
              <path d={line} fill="none" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" stroke={up ? "var(--chart-2)" : "var(--destructive)"} />
            </svg>
            {at !== null ? (
              <>
                <span aria-hidden="true" className="bg-foreground/30 pointer-events-none absolute inset-y-0 w-px" style={{ left: `${(x(at) / W) * 100}%` }} />
                <span aria-hidden="true" className="border-background bg-foreground pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2" style={{ left: `${(x(at) / W) * 100}%`, top: `${(y(data[at]!) / H) * 100}%` }} />
              </>
            ) : null}
          </div>
        </div>

        <div className="bg-card rounded-3xl border p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Allocation</h2>
          <div className="relative mx-auto mt-4 size-40">
            <svg role="img" aria-label={`Allocation: ${byKind.map((b) => `${b.k} ${((b.v / total) * 100).toFixed(0)}%`).join(", ")}`} viewBox="0 0 120 120" className="size-full -rotate-90 rtl:rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" strokeWidth="14" className="stroke-muted" />
              {byKind.map((b) => {
                const len = (b.v / total) * C
                const el = <circle key={b.k} cx="60" cy="60" r={R} fill="none" strokeWidth="14" strokeDasharray={`${Math.max(0, len - 2)} ${C - Math.max(0, len - 2)}`} strokeDashoffset={-acc} style={{ stroke: b.c }} />
                acc += len
                return el
              })}
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-muted-foreground text-xs">{list.length} holdings</span>
              <span className="text-lg font-semibold tabular-nums">{money(total)}</span>
            </span>
          </div>
          <ul className="mt-5 grid gap-2 text-sm">
            {byKind.map((b) => (
              <li key={b.k} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: b.c }} />
                  {b.k}
                </span>
                <span className="tabular-nums">{((b.v / total) * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-card min-w-0 rounded-2xl border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
          <h2 className="font-semibold tracking-tight">Holdings</h2>
          <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
            {[null, ...kinds].map((k) => (
              <button key={k ?? "all"} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={cn("focus-visible:ring-ring/50 rounded-full border px-3 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", kind === k ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
                {k ?? "All"}
              </button>
            ))}
          </div>
        </div>
        <div role="region" tabIndex={0} aria-label="Holdings table" className="focus-visible:ring-ring/50 overflow-x-auto outline-none focus-visible:ring-[3px] focus-visible:ring-inset">
          <table className="w-full min-w-[40rem] text-sm">
            <caption className="sr-only">Holdings with value, share of the portfolio and change today</caption>
            <thead className="text-muted-foreground text-xs">
              <tr>
                <Th k="symbol">Holding</Th>
                <th scope="col" className="px-4 py-3 text-end font-medium">Price</th>
                <Th k="value" end>
                  Value
                </Th>
                <th scope="col" className="px-4 py-3 text-end font-medium">Share</th>
                <Th k="day" end>
                  Today
                </Th>
                <th scope="col" className="px-4 py-3 text-end font-medium">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y border-t">
              {rows.map(({ h, value }) => (
                <tr key={h.id}>
                  <th scope="row" className="px-4 py-3 text-start font-normal">
                    <span className="block font-semibold">{h.symbol}</span>
                    <span className="text-muted-foreground block text-xs">
                      {h.name} · {new Intl.NumberFormat(locale).format(h.shares)} {h.shares === 1 ? "share" : "shares"}
                    </span>
                  </th>
                  <td className="px-4 py-3 text-end tabular-nums">{money(h.price, 2)}</td>
                  <td className="px-4 py-3 text-end font-medium tabular-nums">{money(value)}</td>
                  <td className="px-4 py-3 text-end tabular-nums">{((value / total) * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-end tabular-nums">
                    <span className="inline-flex items-center gap-1 font-medium">
                      {h.dayPct > 0 ? <ArrowUp aria-hidden="true" className="text-chart-2 size-3.5" /> : h.dayPct < 0 ? <ArrowDown aria-hidden="true" className="text-destructive size-3.5" /> : null}
                      {signed(h.dayPct)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="ms-auto block w-fit">
                      <Spark data={h.spark} up={h.spark.at(-1)! >= h.spark[0]!} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <section data-slot="portfolio-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="mb-6 text-3xl font-semibold tracking-[-0.035em] text-balance">
        {title}
      </h1>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the portfolio" loading={<Skel />} error={{ title: errorState?.title ?? "The portfolio could not be loaded", description: errorState?.description ?? "Your holdings are safe. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Portfolio1, type Portfolio1Props, type Portfolio1Holding, type Portfolio1Range }
