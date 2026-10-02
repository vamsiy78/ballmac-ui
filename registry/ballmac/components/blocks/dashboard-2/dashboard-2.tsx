// Ballmac UI: Dashboard 2. https://ui.ballmac.com/blocks/dashboard-2
"use client"

import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Globe, Monitor, Smartphone, Tablet } from "lucide-react"
import { CartesianGrid, Cell, Label, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ballmac/chart"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { StatusDot } from "@/components/ballmac/status-dot"
import { Switch } from "@/components/ballmac/switch"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/ballmac/i18n"

type Dashboard2Range = "7d" | "30d" | "12m"

type Dashboard2Page = { path: string; views: number; bounce: number }
type Dashboard2Country = { name: string; visitors: number }

type Dashboard2Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Page heading. */
  title?: string
  /** One line under the heading. */
  description?: string
  /** Range shown first. */
  defaultRange?: Dashboard2Range
  /** Visitors per step for a range and the same steps a period earlier. Defaults to a built-in demo curve. */
  getSeries?: (range: Dashboard2Range) => { label: string; visitors: number; previous: number }[]
  /** Visitors by traffic source. The first five are coloured. */
  sources?: { key: string; label: string; visitors: number }[]
  /** Share of visitors by device, in percent, summing to about 100. */
  devices?: { desktop: number; mobile: number; tablet: number }
  /** Most viewed pages. */
  pages?: Dashboard2Page[]
  /** Visitors by country, largest first. */
  countries?: Dashboard2Country[]
  /** People on the site right now. Pass null to hide the live pill. */
  live?: number | null
  /** Locale for numbers. Fixed by default so server and browser match. */
  locale?: string
}

const STEPS: Record<Dashboard2Range, number> = { "7d": 7, "30d": 30, "12m": 12 }
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function demoSeries(range: Dashboard2Range) {
  const n = STEPS[range]
  const end = Date.UTC(2026, 8, 30)
  const base = range === "12m" ? 52000 : 1800
  const val = (t: number) => Math.round(base * (1 + t * (range === "12m" ? 0.02 : 0.004) + Math.sin(t / 1.9) * 0.12 + Math.cos(t / 4.4) * 0.09))
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(end - (n - 1 - i) * (range === "12m" ? 30.4 * 86400000 : 86400000))
    return {
      label: range === "12m" ? MONTHS[d.getUTCMonth()] : `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`,
      visitors: val(i),
      previous: Math.round(val(i - n) * 0.96),
    }
  })
}

const defaultSources = [
  { key: "search", label: "Search", visitors: 18420 },
  { key: "direct", label: "Direct", visitors: 12310 },
  { key: "social", label: "Social", visitors: 6540 },
  { key: "email", label: "Email", visitors: 4120 },
  { key: "referral", label: "Referral", visitors: 2680 },
]

const defaultPages: Dashboard2Page[] = [
  { path: "/", views: 24810, bounce: 38 },
  { path: "/pricing", views: 12940, bounce: 31 },
  { path: "/blog/month-end-close", views: 9120, bounce: 52 },
  { path: "/product/invoicing", views: 7480, bounce: 36 },
  { path: "/customers", views: 4310, bounce: 44 },
]

const defaultCountries: Dashboard2Country[] = [
  { name: "United States", visitors: 21400 },
  { name: "United Kingdom", visitors: 8900 },
  { name: "Germany", visitors: 6100 },
  { name: "Portugal", visitors: 4800 },
  { name: "Canada", visitors: 3700 },
]

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

function Dashboard2({
  title = "Traffic",
  description = "Who visits, where they come from and what they read.",
  defaultRange = "30d",
  getSeries = demoSeries,
  sources = defaultSources,
  devices = { desktop: 54, mobile: 39, tablet: 7 },
  pages = defaultPages,
  countries = defaultCountries,
  live = 128,
  locale,
  className,
  ...props
}: Dashboard2Props) {
  const defaultLocale = useLocale()
  locale ??= defaultLocale
  const [range, setRange] = React.useState<Dashboard2Range>(defaultRange)
  const [compare, setCompare] = React.useState(true)
  const compareId = React.useId()
  const series = React.useMemo(() => getSeries(range), [getSeries, range])
  const int = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const compact = React.useMemo(() => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }), [locale])

  const total = series.reduce((n, p) => n + p.visitors, 0)
  const before = series.reduce((n, p) => n + p.previous, 0)
  const delta = before ? ((total - before) / before) * 100 : 0
  const Arrow = delta >= 0 ? ArrowUpRight : ArrowDownRight
  const sourceTotal = sources.reduce((n, s) => n + s.visitors, 0)
  const maxViews = Math.max(...pages.map((p) => p.views), 1)
  const maxCountry = Math.max(...countries.map((c) => c.visitors), 1)

  const lineConfig = {
    visitors: { label: "Visitors", color: "var(--chart-1)" },
    previous: { label: "Previous period", color: "var(--muted-foreground)" },
  } satisfies ChartConfig
  const sourceConfig: ChartConfig = { visitors: { label: "Visitors" } }
  sources.slice(0, 5).forEach((s, i) => {
    sourceConfig[s.key] = { label: s.label, color: chartColors[i] }
  })
  const deviceRows = [
    { key: "desktop", label: "Desktop", icon: Monitor, value: devices.desktop, tone: "bg-chart-1" },
    { key: "mobile", label: "Mobile", icon: Smartphone, value: devices.mobile, tone: "bg-chart-3" },
    { key: "tablet", label: "Tablet", icon: Tablet, value: devices.tablet, tone: "bg-chart-5" },
  ]
  const tickEvery = Math.max(1, Math.floor(series.length / 6))

  return (
    <section data-slot="dashboard-2" className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...props}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
            {live !== null && (
              <span className="rounded-full border px-3 py-1">
                <StatusDot status="online" pulse label={`${int.format(live)} online now`} className="text-xs" />
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label htmlFor={compareId} className="flex cursor-pointer items-center gap-2 text-sm">
            <Switch id={compareId} checked={compare} onCheckedChange={setCompare} />
            Compare
          </label>
          <SegmentedControl aria-label="Date range" value={range} onValueChange={(v) => setRange(v as Dashboard2Range)}>
            <SegmentedControlItem value="7d">7 days</SegmentedControlItem>
            <SegmentedControlItem value="30d">30 days</SegmentedControlItem>
            <SegmentedControlItem value="12m">12 months</SegmentedControlItem>
          </SegmentedControl>
        </div>
      </div>

      <div className="bg-card mt-6 rounded-2xl border p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm">Visitors</p>
            <p className="mt-1 flex items-baseline gap-3">
              <span className="text-4xl font-semibold tracking-[-0.04em] tabular-nums">{int.format(total)}</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium">
                <Arrow className={cn("size-4", delta >= 0 ? "text-chart-2" : "text-destructive")} aria-hidden="true" />
                <span className="tabular-nums">{Math.abs(delta).toFixed(1)}%</span>
                <span className="text-muted-foreground font-normal">vs previous period</span>
              </span>
            </p>
          </div>
        </div>
        <ChartContainer
          config={lineConfig}
          label={`Visitors over the last ${range === "12m" ? "12 months" : STEPS[range] + " days"}`}
          summary={`${int.format(total)} visitors, ${Math.abs(delta).toFixed(1)} percent ${delta >= 0 ? "more" : "fewer"} than the previous period.`}
          className="mt-5 aspect-[16/6] w-full min-h-52"
        >
          <LineChart data={series} margin={{ left: 0, right: 8, top: 8 }} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={tickEvery - 1} />
            <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => compact.format(v)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            {compare && <Line dataKey="previous" type="monotone" stroke="var(--color-previous)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />}
            <Line dataKey="visitors" type="monotone" stroke="var(--color-visitors)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }} />
            {compare && <ChartLegend content={<ChartLegendContent />} />}
          </LineChart>
        </ChartContainer>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-2xl border p-4 sm:p-5">
          <p className="text-sm font-medium">Traffic sources</p>
          <ChartContainer
            config={sourceConfig}
            label="Visitors by traffic source"
            summary={sources.map((s) => `${s.label} ${int.format(s.visitors)}`).join(", ")}
            className="mx-auto mt-2 aspect-square w-full max-w-[13rem]"
          >
            <PieChart accessibilityLayer>
              <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
              <Pie data={sources.slice(0, 5)} dataKey="visitors" nameKey="key" innerRadius="64%" outerRadius="92%" paddingAngle={2} strokeWidth={0}>
                {sources.slice(0, 5).map((s) => (
                  <Cell key={s.key} fill={`var(--color-${s.key})`} />
                ))}
                <Label
                  position="center"
                  content={({ viewBox }) =>
                    viewBox && "cx" in viewBox ? (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 6} className="fill-foreground text-xl font-semibold">{compact.format(sourceTotal)}</tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 14} className="fill-muted-foreground text-xs">visitors</tspan>
                      </text>
                    ) : null
                  }
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {sources.slice(0, 5).map((s, i) => (
              <li key={s.key} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ background: chartColors[i] }} />
                <span className="flex-1 truncate">{s.label}</span>
                <span className="text-muted-foreground tabular-nums">{Math.round((s.visitors / sourceTotal) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card rounded-2xl border p-4 sm:p-5">
          <p className="text-sm font-medium">Devices</p>
          <div className="mt-5 flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={deviceRows.map((d) => `${d.label} ${d.value} percent`).join(", ")}>
            {deviceRows.map((d) => (
              <span key={d.key} className={cn("h-full first:rounded-s-full last:rounded-e-full", d.tone)} style={{ width: `${d.value}%` }} />
            ))}
          </div>
          <ul className="mt-5 space-y-4">
            {deviceRows.map((d) => (
              <li key={d.key} className="flex items-center gap-3 text-sm">
                <span className="bg-muted flex size-9 items-center justify-center rounded-lg"><d.icon className="size-4" aria-hidden="true" /></span>
                <span className="flex-1">{d.label}</span>
                <span className={cn("size-2.5 rounded-sm", d.tone)} aria-hidden="true" />
                <span className="w-10 text-end font-medium tabular-nums">{d.value}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card rounded-2xl border p-4 sm:p-5 md:col-span-2 lg:col-span-1">
          <p className="flex items-center gap-2 text-sm font-medium"><Globe className="size-4" aria-hidden="true" />Top countries</p>
          <ul className="mt-5 space-y-4">
            {countries.map((c) => (
              <li key={c.name}>
                <div className="flex items-baseline justify-between text-sm">
                  <span>{c.name}</span>
                  <span className="text-muted-foreground tabular-nums">{int.format(c.visitors)}</span>
                </div>
                <div className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full" role="img" aria-label={`${c.name}: ${int.format(c.visitors)} visitors`}>
                  <div className="bg-chart-1 h-full rounded-full" style={{ width: `${(c.visitors / maxCountry) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-card mt-3 overflow-hidden rounded-2xl border">
        <p className="px-4 py-4 text-sm font-medium sm:px-5">Top pages</p>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Top pages">
          <table className="w-full min-w-[28rem] text-start text-sm">
            <thead>
              <tr className="text-muted-foreground border-y text-xs">
                <th scope="col" className="px-4 py-2.5 font-medium sm:px-5">Page</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Views</th>
                <th scope="col" className="px-4 py-2.5 text-end font-medium sm:px-5">Bounce rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map((p) => (
                <tr key={p.path} className="hover:bg-accent/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs sm:px-5">{p.path}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-14 tabular-nums">{int.format(p.views)}</span>
                      <span aria-hidden="true" className="bg-muted hidden h-1.5 w-32 overflow-hidden rounded-full sm:block"><span className="bg-chart-1 block h-full rounded-full" style={{ width: `${(p.views / maxViews) * 100}%` }} /></span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-end tabular-nums sm:px-5">{p.bounce}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export { Dashboard2, type Dashboard2Props, type Dashboard2Range, type Dashboard2Page, type Dashboard2Country }
