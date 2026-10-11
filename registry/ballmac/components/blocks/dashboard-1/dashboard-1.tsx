// Ballmac UI: Dashboard 1. https://ui.ballmac.com/blocks/dashboard-1
"use client"

import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ballmac/badge"
import { Button } from "@/components/ballmac/button"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ballmac/chart"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { Sparkline } from "@/components/ballmac/sparkline"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/ballmac/i18n"

type Dashboard1Range = "7d" | "30d" | "90d"

type Dashboard1Order = {
  id: string
  customer: string
  email: string
  status: "paid" | "pending" | "refunded"
  total: number
  /** ISO date (YYYY-MM-DD), shown in UTC. */
  date: string
}

type Dashboard1Channel = { name: string; share: number }

type Dashboard1Props = Omit<React.ComponentProps<"section">, "title"> & StateProps & {
  /** Page heading. */
  title?: string
  /** One line under the heading. */
  description?: string
  /** Range shown first. */
  defaultRange?: Dashboard1Range
  /** Called when the range changes. Pass your own data for each range with `getSeries`. */
  onRangeChange?: (range: Dashboard1Range) => void
  /**
   * Revenue per day for a range, and the same days a period earlier. Defaults to a built-in demo curve so the block
   * works with no data.
   */
  getSeries?: (range: Dashboard1Range) => { label: string; revenue: number; previous: number; orders: number }[]
  /** Share of revenue by channel, largest first. */
  channels?: Dashboard1Channel[]
  /** Recent orders, newest first. */
  orders?: Dashboard1Order[]
  /** ISO currency code. */
  currency?: string
  /** Locale for numbers and dates. Fixed by default so server and browser match. */
  locale?: string
}

const DAYS: Record<Dashboard1Range, number> = { "7d": 7, "30d": 30, "90d": 90 }
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** A smooth, deterministic demo curve (no randomness, so the server and browser draw the same chart). */
function demoSeries(range: Dashboard1Range) {
  const n = DAYS[range]
  const end = Date.UTC(2026, 8, 30)
  const point = (i: number, shift: number) => {
    const t = i + shift
    return Math.round(2900 + t * 6 + Math.sin(t / 2.3) * 520 + Math.cos(t / 5.1) * 380)
  }
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(end - (n - 1 - i) * 86400000)
    const revenue = point(i, 0)
    return {
      label: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`,
      revenue,
      previous: Math.round(point(i, -n) * 0.94),
      orders: Math.round(revenue / 54),
    }
  })
}

const defaultChannels: Dashboard1Channel[] = [
  { name: "Search", share: 38 },
  { name: "Direct", share: 27 },
  { name: "Email", share: 19 },
  { name: "Social", share: 11 },
  { name: "Referral", share: 5 },
]

const defaultOrders: Dashboard1Order[] = [
  { id: "ORD-10482", customer: "Northwind Studio", email: "billing@northwind.co", status: "paid", total: 4200, date: "2026-09-30" },
  { id: "ORD-10481", customer: "Globex Corp", email: "ap@globex.com", status: "pending", total: 12800, date: "2026-09-30" },
  { id: "ORD-10480", customer: "Initech", email: "finance@initech.io", status: "paid", total: 960, date: "2026-09-29" },
  { id: "ORD-10479", customer: "Umbrella Labs", email: "pay@umbrella.dev", status: "refunded", total: 3450, date: "2026-09-29" },
  { id: "ORD-10478", customer: "Stark Supply", email: "accounts@stark.supply", status: "paid", total: 7100, date: "2026-09-28" },
  { id: "ORD-10477", customer: "Wayne Freight", email: "ops@wayne.co", status: "paid", total: 2280, date: "2026-09-27" },
]

const statusTone = { paid: "success", pending: "warning", refunded: "neutral" } as const
const statusLabel = { paid: "Paid", pending: "Pending", refunded: "Refunded" }

const config = {
  revenue: { label: "This period", color: "var(--chart-1)" },
  previous: { label: "Previous period", color: "var(--muted-foreground)" },
} satisfies ChartConfig

/** A short moving average, so a noisy ratio draws as a calm trend line. */
function smooth(values: number[]) {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - 3), i + 4)
    return slice.reduce((n, v) => n + v, 0) / slice.length
  })
}

function pctChange(now: number, before: number) {
  return before === 0 ? 0 : ((now - before) / before) * 100
}

function Dashboard1Inner({
  title = "Overview",
  description = "How the store is doing compared with the previous period.",
  defaultRange = "30d",
  onRangeChange,
  getSeries = demoSeries,
  channels = defaultChannels,
  orders = defaultOrders,
  currency = "USD",
  locale,
  className,
  ...props
}: Dashboard1Props) {
  const defaultLocale = useLocale()
  locale ??= defaultLocale
  const [range, setRange] = React.useState<Dashboard1Range>(defaultRange)
  const series = React.useMemo(() => getSeries(range), [getSeries, range])
  const money = React.useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }), [locale, currency])
  const compact = React.useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency, notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 }), [locale, currency])
  const int = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const dateFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }), [locale])

  const sum = (key: "revenue" | "previous" | "orders") => series.reduce((n, p) => n + p[key], 0)
  const revenue = sum("revenue")
  const prevRevenue = sum("previous")
  const orderCount = sum("orders")
  const prevOrders = Math.round(prevRevenue / 54)
  const aov = orderCount ? revenue / orderCount : 0
  const prevAov = prevOrders ? prevRevenue / prevOrders : 0
  const kpis = [
    { label: "Revenue", value: compact.format(revenue), delta: pctChange(revenue, prevRevenue), trend: series.map((p) => p.revenue) },
    { label: "Orders", value: int.format(orderCount), delta: pctChange(orderCount, prevOrders), trend: series.map((p) => p.orders) },
    { label: "Average order", value: money.format(aov), delta: pctChange(aov, prevAov), trend: smooth(series.map((p) => p.revenue / Math.max(p.orders, 1))) },
    { label: "Refund rate", value: "1.8%", delta: -0.4, invert: true, trend: series.map((p, i) => 2.4 - Math.sin(i / 3) * 0.3 - i * 0.004) },
  ]
  const tickEvery = Math.max(1, Math.floor(series.length / 6))

  return (
    <section data-slot="dashboard-1" className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...props}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <SegmentedControl aria-label="Date range" value={range} onValueChange={(v) => { setRange(v as Dashboard1Range); onRangeChange?.(v as Dashboard1Range) }}>
            <SegmentedControlItem value="7d">7 days</SegmentedControlItem>
            <SegmentedControlItem value="30d">30 days</SegmentedControlItem>
            <SegmentedControlItem value="90d">90 days</SegmentedControlItem>
          </SegmentedControl>
          <Button variant="outline" size="icon" aria-label="Export report"><Download /></Button>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => {
          const good = k.invert ? k.delta <= 0 : k.delta >= 0
          const Arrow = k.delta >= 0 ? ArrowUpRight : ArrowDownRight
          return (
            <div key={k.label} className="bg-card rounded-2xl border p-4 sm:p-5">
              <dt className="text-muted-foreground text-xs sm:text-sm">{k.label}</dt>
              <dd className="mt-2">
                <span className="block text-2xl font-semibold tracking-[-0.03em] tabular-nums sm:text-3xl">{k.value}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium sm:text-sm">
                  <Arrow className={cn("size-3.5", good ? "text-chart-2" : "text-destructive")} aria-hidden="true" />
                  <span className="tabular-nums">{Math.abs(k.delta).toFixed(1)}%</span>
                  <span className="text-muted-foreground font-normal">{k.delta >= 0 ? "up" : "down"} vs previous</span>
                </span>
                <Sparkline values={k.trend} label={`${k.label} trend`} height={32} showEnd={false} className="text-chart-1 mt-3 w-full" />
              </dd>
            </div>
          )
        })}
      </dl>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_20rem]">
        <div className="bg-card rounded-2xl border p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">Revenue</p>
            <p className="text-muted-foreground text-xs">Daily, last {DAYS[range]} days</p>
          </div>
          <ChartContainer
            config={config}
            label={`Daily revenue for the last ${DAYS[range]} days compared with the previous period`}
            summary={`Revenue totalled ${money.format(revenue)}, ${Math.abs(pctChange(revenue, prevRevenue)).toFixed(1)} percent ${revenue >= prevRevenue ? "above" : "below"} the previous period.`}
            className="mt-4 aspect-[16/8] w-full"
          >
            <AreaChart data={series} margin={{ left: 0, right: 8, top: 8 }} accessibilityLayer>
              <defs>
                <linearGradient id="d1-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={tickEvery - 1} />
              <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" formatter={(v) => money.format(Number(v))} />} />
              <Area dataKey="previous" type="monotone" fill="none" stroke="var(--color-previous)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Area dataKey="revenue" type="monotone" fill="url(#d1-fill)" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="bg-card rounded-2xl border p-4 sm:p-5">
          <p className="text-sm font-medium">Revenue by channel</p>
          <ul className="mt-4 space-y-4">
            {channels.map((c) => (
              <li key={c.name}>
                <div className="flex items-baseline justify-between text-sm">
                  <span>{c.name}</span>
                  <span className="text-muted-foreground tabular-nums">{c.share}%</span>
                </div>
                <div className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full" role="img" aria-label={`${c.name}: ${c.share} percent of revenue`}>
                  <div className="bg-chart-1 h-full rounded-full" style={{ width: `${c.share}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-card mt-3 overflow-hidden rounded-2xl border">
        <div className="flex items-center justify-between px-4 py-4 sm:px-5">
          <p className="text-sm font-medium">Recent orders</p>
          <a href="#orders" className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-sm text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">View all</a>
        </div>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Recent orders">
          <table className="w-full min-w-[34rem] text-start text-sm">
            <thead>
              <tr className="text-muted-foreground border-y text-xs">
                <th scope="col" className="px-4 py-2.5 font-medium sm:px-5">Order</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Customer</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Date</th>
                <th scope="col" className="px-4 py-2.5 text-end font-medium sm:px-5">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs sm:px-5">{o.id}</td>
                  <td className="px-4 py-3">
                    <span className="block font-medium">{o.customer}</span>
                    <span className="text-muted-foreground block text-xs">{o.email}</span>
                  </td>
                  <td className="px-4 py-3"><Badge status={statusTone[o.status]}>{statusLabel[o.status]}</Badge></td>
                  <td className="text-muted-foreground px-4 py-3">{dateFmt.format(new Date(`${o.date}T00:00:00Z`))}</td>
                  <td className="px-4 py-3 text-end font-medium tabular-nums sm:px-5">{money.format(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}


/** The same cards, chart, side panel and table as the ready view, so nothing jumps when data arrives. */
function Dashboard1Skeleton() {
  return (
    <div aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-2xl border p-4 sm:p-5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-3 h-8 w-28" />
            <Skeleton className="mt-2 h-3.5 w-24" />
            <Skeleton className="mt-4 h-8 w-full" />
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_20rem]">
        <div className="bg-card rounded-2xl border p-4 sm:p-5">
          <div className="flex justify-between gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3.5 w-36" />
          </div>
          <Skeleton className="mt-4 aspect-[16/8] w-full rounded-xl" />
        </div>
        <div className="bg-card rounded-2xl border p-4 sm:p-5">
          <Skeleton className="h-4 w-36" />
          <ul className="mt-4 space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <li key={i}>
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-8" />
                </div>
                <Skeleton className="mt-2 h-2 w-full rounded-full" />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-card mt-3 overflow-hidden rounded-2xl border">
        <div className="px-4 py-4 sm:px-5">
          <Skeleton className="h-4 w-28" />
        </div>
        <ul className="divide-y border-t">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-center gap-4 px-4 py-3 sm:px-5">
              <Skeleton className="h-3.5 w-16" />
              <div className="grid flex-1 gap-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3.5 w-12" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * The store overview. `state="loading"` shows a skeleton of its cards, chart and table under the real heading, `state="error"`
 * an error with retry, and `state="empty"` a message that there are no sales yet.
 */
function Dashboard1({ state = "ready", onRetry, emptyState, errorState, title = "Overview", description = "How the store is doing compared with the previous period.", className, ...props }: Dashboard1Props) {
  if (state === "ready") return <Dashboard1Inner title={title} description={description} className={className} {...props} />
  return (
    <section data-slot="dashboard-1" data-state={state} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        {state === "loading" ? <Skeleton animated={false} className="h-9 w-56 rounded-lg" aria-hidden="true" /> : null}
      </div>
      <StateView
        state={state}
        className="mt-6"
        loading={<Dashboard1Skeleton />}
        label="Loading the overview"
        empty={{ title: "No sales yet", description: "Orders and revenue will show up here once your store starts selling.", ...emptyState }}
        error={{ title: "Could not load the overview", description: "The reporting service did not answer. Your numbers are safe.", ...errorState }}
        onRetry={onRetry}
      >
        {null}
      </StateView>
    </section>
  )
}

export { Dashboard1, type Dashboard1Props, type Dashboard1Order, type Dashboard1Channel, type Dashboard1Range }
