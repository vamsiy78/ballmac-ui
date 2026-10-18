// Ballmac UI: Chart Frame. https://ui.ballmac.com/components/chart-frame
"use client"

import * as React from "react"
import { ChartColumn, Download, Table2 } from "lucide-react"
import { useReducedMotion } from "motion/react"

import { ChartContainer, type ChartConfig } from "@/components/ballmac/chart"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { StateView, type StateProps } from "@/components/ballmac/state-view"
import { Toggle } from "@/components/ballmac/toggle"
import { useDirection } from "@/lib/ballmac/direction"
import { useLocale, useMessages } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

/** One row of data: a category plus a number for each series. */
type ChartRow = Record<string, unknown>

type ChartSeries = {
  /** The key of this series' number in every row. */
  key: string
  /** Name shown in the legend, the tooltip and the table. */
  label: string
  /** A CSS color. Defaults to the theme's chart colors in order. */
  color?: string
}

/** What the frame tells the chart it draws. Put `chart.defs` inside the chart as `<defs>` and fill series with `chart.fill(key)`. */
type ChartFrameContext = {
  /** The series that are switched on. */
  visible: string[]
  isHidden: (key: string) => boolean
  /** Whether series are also told apart by a pattern, not only by color. */
  patterns: boolean
  /** The fill for a series: its pattern when patterns are on, otherwise its color variable. */
  fill: (key: string) => string
  /** The solid color of a series, for strokes and dots. */
  color: (key: string) => string
  /** The `<pattern>` definitions. Render `<defs>{chart.defs}</defs>` inside the chart's svg. */
  defs: React.ReactNode
  /** False under reduced motion: pass it to Recharts' `isAnimationActive`. */
  animate: boolean
  /** Whether the page reads right to left: reverse the x axis and move the y axis to the right. */
  rtl: boolean
  /** Recharts margins are physical. Give them as they read left to right and this swaps `left` and `right` when the page reads right to left. */
  margin: (m: { top?: number; right?: number; bottom?: number; left?: number }) => { top: number; right: number; bottom: number; left: number }
  locale: string
  /** Writes a number the way the frame was told to. */
  format: (value: number, key: string) => string
  /** Writes a category (an x value). */
  formatCategory: (value: unknown) => string
  config: ChartConfig
}

type TableColumn = { key: string; label: string; numeric?: boolean; format?: (value: unknown, row: ChartRow) => string }

type ChartFrameProps = Omit<React.ComponentProps<"div">, "title" | "children"> &
  StateProps & {
    /** The chart's name. It heads the frame and names the figure for screen readers. */
    title: string
    description?: string
    /** The rows the chart draws. The table, the CSV and the written summary are made from them. */
    data: ChartRow[]
    /** The key of each row's category (the x axis). */
    xKey: string
    /** What the legend lists and what colors the chart: one entry per number. */
    series: ChartSeries[]
    /** Draws the chart. Return a Recharts chart (`AreaChart`, `BarChart`…) and use what `chart` gives you. */
    children: (chart: ChartFrameContext) => React.ReactElement
    /** "toggle": a legend whose items switch series on and off. "static": a plain legend. "none". Defaults to "toggle" with two or more series. */
    legend?: "toggle" | "static" | "none"
    /** Show the Chart and Table switch. Defaults to true. */
    tableView?: boolean
    /** `true` always draws patterns as well as colors. "toggle" adds a switch for it. */
    patterns?: boolean | "toggle"
    /** The sentence screen readers get. It is written from the data when you leave it out. */
    summary?: string
    /** How the summary reads the data: as a trend over `xKey`, as a ranking of categories, or as shares of a whole. */
    summaryMode?: "trend" | "ranking"
    /** Writes a number in the tooltip, the table and the summary. */
    valueFormatter?: (value: number, seriesKey: string) => string
    /** Writes a category in the table and the summary. */
    categoryFormatter?: (value: unknown) => string
    /** The shape of the plot. */
    aspect?: "video" | "wide" | "panorama" | "square" | "tall"
    /** Controls beside the view switch, for example a range picker. */
    actions?: React.ReactNode
    /** Content under the chart. */
    footer?: React.ReactNode
    /** What shows while loading: a shape that matches the chart, or your own node. */
    skeleton?: "area" | "bars" | "donut" | "lines" | "radar" | React.ReactNode
    /** Replace the table with your own columns and rows, for charts whose data is not a simple series per column. */
    table?: { columns: TableColumn[]; rows: ChartRow[] }
    /** Names the downloaded file (without .csv). Pass `false` to hide the download button. */
    downloadName?: string | false
    /** The first column's header in the table. */
    categoryLabel?: string
    locale?: string
    /** Extra classes for the chart area. */
    chartClassName?: string
  }

const seriesColor = (index: number) => `var(--chart-${(index % 5) + 1})`

const ASPECT = { video: "aspect-video", wide: "aspect-[2/1]", panorama: "aspect-[5/2]", square: "mx-auto aspect-square w-full max-w-sm", tall: "mx-auto aspect-[4/5] max-h-[28rem] w-full max-w-md" } as const

/** Six ways to fill a series that do not rely on color: each is a tile drawn in the series' color. */
const PATTERNS: ((color: string) => React.ReactNode)[] = [
  (c) => (
    <>
      <rect width="8" height="8" fill={c} fillOpacity="0.16" />
      <path d="M-1 1 L1 -1 M0 8 L8 0 M7 9 L9 7" stroke={c} strokeWidth="1.6" />
    </>
  ),
  (c) => (
    <>
      <rect width="8" height="8" fill={c} fillOpacity="0.16" />
      <circle cx="2" cy="2" r="1.5" fill={c} />
      <circle cx="6" cy="6" r="1.5" fill={c} />
    </>
  ),
  (c) => (
    <>
      <rect width="8" height="8" fill={c} fillOpacity="0.16" />
      <path d="M0 0 L8 8 M8 0 L0 8" stroke={c} strokeWidth="1.3" />
    </>
  ),
  (c) => (
    <>
      <rect width="8" height="8" fill={c} fillOpacity="0.16" />
      <path d="M0 2 H8 M0 6 H8" stroke={c} strokeWidth="1.5" />
    </>
  ),
  (c) => (
    <>
      <rect width="8" height="8" fill={c} fillOpacity="0.16" />
      <path d="M2 0 V8 M6 0 V8" stroke={c} strokeWidth="1.5" />
    </>
  ),
  (c) => <rect width="8" height="8" fill={c} fillOpacity="0.85" />,
]

const csvCell = (value: string) => (/[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)

/** Rows of text as a CSV file's contents. */
function toCsv(header: string[], rows: string[][]) {
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n")
}

function numberOf(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

/**
 * The sentence a screen reader gets for a chart, written from its data: for a trend each series is read from its first point to its last
 * with its high and low; for a ranking the categories come in order of size. Pass your own `summary` to say something about what it means.
 */
function describeChart({
  data,
  xKey,
  series,
  mode,
  format,
  formatCategory,
  msg,
}: {
  data: ChartRow[]
  xKey: string
  series: ChartSeries[]
  mode: "trend" | "ranking"
  format: (value: number, key: string) => string
  formatCategory: (value: unknown) => string
  msg: ReturnType<typeof useMessages>
}): string {
  if (!data.length) return ""
  const shown = series.slice(0, 4)
  const parts = shown.map((s) => {
    const points = data.flatMap((row) => {
      const v = numberOf(row[s.key])
      return v === null ? [] : [{ v, at: formatCategory(row[xKey]) }]
    })
    if (!points.length) return ""
    if (mode === "ranking") {
      const ranked = [...points].sort((a, b) => b.v - a.v).slice(0, 3)
      return msg("chart-frame.ranking", "{series}: {list}.", { series: s.label, list: ranked.map((p) => `${p.at} ${format(p.v, s.key)}`).join(", ") })
    }
    const first = points[0]!
    const last = points.at(-1)!
    const max = points.reduce((a, b) => (b.v > a.v ? b : a))
    const min = points.reduce((a, b) => (b.v < a.v ? b : a))
    if (points.length === 1) return msg("chart-frame.single", "{series}: {value} in {at}.", { series: s.label, value: format(first.v, s.key), at: first.at })
    return msg("chart-frame.trend", "{series}: from {first} in {firstAt} to {last} in {lastAt}; highest {max} in {maxAt}, lowest {min} in {minAt}.", {
      series: s.label,
      first: format(first.v, s.key),
      firstAt: first.at,
      last: format(last.v, s.key),
      lastAt: last.at,
      max: format(max.v, s.key),
      maxAt: max.at,
      min: format(min.v, s.key),
      minAt: min.at,
    })
  })
  const more = series.length - shown.length
  return [
    msg("chart-frame.points", { one: "{count} point.", other: "{count} points." }, { count: data.length }),
    ...parts.filter(Boolean),
    more > 0 ? msg("chart-frame.more", { one: "And {count} more series, in the table.", other: "And {count} more series, in the table." }, { count: more }) : "",
  ]
    .filter(Boolean)
    .join(" ")
}

/** A round step for a value axis: 1, 2, 2.5, 5 or 10 times a power of ten. */
function niceStep(range: number, ticks: number) {
  if (!(range > 0)) return 1
  const raw = range / Math.max(1, ticks - 1)
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const normal = raw / magnitude
  return (normal <= 1 ? 1 : normal <= 2 ? 2 : normal <= 2.5 ? 2.5 : normal <= 5 ? 5 : 10) * magnitude
}

/** Round ticks inside a domain someone fixed, for example [3.5, 5] gives 3.5, 4, 4.5, 5. Returns undefined when the domain is not two numbers. */
function domainTicks(domain: readonly [number | string, number | string] | undefined, count = 5): number[] | undefined {
  if (!domain || typeof domain[0] !== "number" || typeof domain[1] !== "number" || !(domain[1] > domain[0])) return undefined
  const [lo, hi] = domain
  const step = niceStep(hi - lo, count)
  const ticks: number[] = []
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) ticks.push(Number(v.toFixed(10)))
  return ticks.length >= 2 ? ticks : undefined
}

/**
 * Round ticks for a value axis (0, 500, 1K…) instead of whatever the data happens to end on (0, 350, 700, 1050). Pass the keys that are drawn;
 * `stacked` adds them up. `zero` keeps the baseline at 0, as bars and areas need.
 */
function niceScale({ data, keys, stacked = false, zero = true, count = 5 }: { data: ChartRow[]; keys: string[]; stacked?: boolean; zero?: boolean; count?: number }): { domain: [number, number]; ticks: number[] } | undefined {
  let min = Infinity
  let max = -Infinity
  for (const row of data) {
    const values = keys.map((k) => numberOf(row[k])).filter((v): v is number => v !== null)
    if (!values.length) continue
    if (stacked) {
      max = Math.max(max, values.filter((v) => v > 0).reduce((a, b) => a + b, 0))
      min = Math.min(min, values.filter((v) => v < 0).reduce((a, b) => a + b, 0))
    } else {
      max = Math.max(max, ...values)
      min = Math.min(min, ...values)
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined
  if (zero) {
    min = Math.min(min, 0)
    max = Math.max(max, 0)
  }
  if (max === min) max = min + 1
  const step = niceStep(max - min, count)
  const lo = Math.floor(min / step + 1e-9) * step
  const hi = Math.ceil(max / step - 1e-9) * step
  const ticks: number[] = []
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(10)))
  return { domain: [lo, hi], ticks }
}

/** The loading shape: roughly what the chart will look like, so nothing jumps when it arrives. */
function ChartSkeleton({ kind }: { kind: "area" | "bars" | "donut" | "lines" | "radar" }) {
  if (kind === "donut" || kind === "radar") {
    return (
      <div aria-hidden="true" className="grid place-items-center py-2">
        <Skeleton className={cn("aspect-square w-full max-w-60 rounded-full", kind === "donut" && "[mask:radial-gradient(circle,transparent_52%,rgb(0_0_0)_53%)]")} />
      </div>
    )
  }
  const heights = [46, 62, 54, 78, 66, 90, 72, 84, 58, 70]
  return (
    <div aria-hidden="true" className="relative aspect-video w-full">
      <div className="absolute inset-0 grid grid-rows-4 border-b">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-t border-dashed border-border/60" />
        ))}
      </div>
      {kind === "bars" ? (
        <div className="absolute inset-x-2 bottom-0 flex h-full items-end gap-2">
          {heights.map((h, i) => (
            <Skeleton key={i} className="flex-1 rounded-b-none rounded-t-md" style={{ height: `${h}%` }} />
          ))}
        </div>
      ) : (
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <path d="M0 40 C10 34 16 20 26 24 S42 38 52 28 S70 8 80 16 S94 22 100 12 V50 H0 Z" className={cn("animate-pulse fill-muted motion-reduce:animate-none", kind === "lines" && "fill-transparent")} />
          <path d="M0 40 C10 34 16 20 26 24 S42 38 52 28 S70 8 80 16 S94 22 100 12" className="animate-pulse fill-none stroke-muted-foreground/25 motion-reduce:animate-none" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </div>
  )
}

/** The data as an accessible table, with the same numbers the chart draws. Used by ChartFrame's Table view, and fine on its own. */
function ChartTable({
  title,
  columns,
  rows,
  className,
}: {
  title: string
  columns: TableColumn[]
  rows: ChartRow[]
  className?: string
}) {
  const msg = useMessages()
  return (
    <div role="region" aria-label={msg("chart-frame.tableLabel", "{title}, data table", { title })} tabIndex={0} className={cn("relative max-h-96 overflow-auto rounded-lg border focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none", className)}>
      <table className="w-full min-w-max border-collapse text-sm">
        <caption className="sr-only">{title}</caption>
        <thead className="sticky top-0 z-10 bg-muted text-xs">
          <tr>
            {columns.map((c, i) => (
              <th key={c.key} scope="col" className={cn("px-3 py-2 font-medium text-muted-foreground", c.numeric ? "text-end" : "text-start", i === 0 && "sticky start-0 bg-muted")}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, r) => (
            <tr key={r} className="hover:bg-muted/40">
              {columns.map((c, i) =>
                i === 0 ? (
                  <th key={c.key} scope="row" className="bg-card sticky start-0 px-3 py-2 text-start font-medium whitespace-nowrap">
                    {c.format ? c.format(row[c.key], row) : String(row[c.key] ?? "")}
                  </th>
                ) : (
                  <td key={c.key} className={cn("px-3 py-2 tabular-nums whitespace-nowrap", c.numeric ? "text-end" : "text-start")}>
                    {c.format ? c.format(row[c.key], row) : String(row[c.key] ?? "")}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * The card around a chart, with what a chart needs to be usable by everyone: a Table view of the same data (and a CSV download), a legend that
 * switches series on and off, optional patterns so series differ by more than color, a summary written for screen readers, reduced-motion-aware
 * animation, mirroring in right-to-left, and loading, empty and error states through `state`.
 */
function ChartFrame({
  title,
  description,
  data,
  xKey,
  series,
  children,
  legend,
  tableView = true,
  patterns: patternsProp = false,
  summary,
  summaryMode = "trend",
  valueFormatter,
  categoryFormatter,
  aspect = "video",
  actions,
  footer,
  skeleton = "area",
  table,
  downloadName,
  categoryLabel,
  locale: localeProp,
  chartClassName,
  state,
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: ChartFrameProps) {
  const msg = useMessages()
  const locale = useLocale(localeProp)
  const dir = useDirection(props.dir as "ltr" | "rtl" | undefined)
  const reduced = useReducedMotion()
  const uid = React.useId().replace(/:/g, "")
  const headingId = `${uid}-title`
  const [view, setView] = React.useState<"chart" | "table">("chart")
  const [patternsOn, setPatternsOn] = React.useState(false)
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(() => new Set())

  const patterns = patternsProp === true || (patternsProp === "toggle" && patternsOn)
  const legendMode = legend ?? (series.length > 1 ? "toggle" : "none")
  const config = React.useMemo<ChartConfig>(() => Object.fromEntries(series.map((s, i) => [s.key, { label: s.label, color: s.color ?? seriesColor(i) }])), [series])
  const index = (key: string) => Math.max(0, series.findIndex((s) => s.key === key))
  const patternId = (key: string) => `${uid}-p${index(key)}`
  const number = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const format = React.useCallback((value: number, key: string) => (valueFormatter ? valueFormatter(value, key) : number.format(value)), [valueFormatter, number])
  const formatCategory = React.useCallback((value: unknown) => (categoryFormatter ? categoryFormatter(value) : String(value ?? "")), [categoryFormatter])

  const toggleSeries = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else if (series.length - prev.size > 1) next.add(key)
      return next
    })

  const chart: ChartFrameContext = {
    visible: series.filter((s) => !hidden.has(s.key)).map((s) => s.key),
    isHidden: (key) => hidden.has(key),
    patterns,
    fill: (key) => (patterns ? `url(#${patternId(key)})` : `var(--color-${key})`),
    color: (key) => `var(--color-${key})`,
    defs: patterns
      ? series.map((s) => (
          <pattern key={s.key} id={patternId(s.key)} width="8" height="8" patternUnits="userSpaceOnUse">
            {PATTERNS[index(s.key) % PATTERNS.length]!(`var(--color-${s.key})`)}
          </pattern>
        ))
      : null,
    animate: !reduced,
    rtl: dir === "rtl",
    margin: (m) => {
      const [left, right] = [m.left ?? 0, m.right ?? 0]
      return { top: m.top ?? 0, bottom: m.bottom ?? 0, left: dir === "rtl" ? right : left, right: dir === "rtl" ? left : right }
    },
    locale,
    format,
    formatCategory,
    config,
  }

  const columns: TableColumn[] = table?.columns ?? [
    { key: xKey, label: categoryLabel ?? msg("chart-frame.category", "Category"), format: (v) => formatCategory(v) },
    ...series.map((s) => ({ key: s.key, label: s.label, numeric: true, format: (v: unknown) => (numberOf(v) === null ? "–" : format(v as number, s.key)) })),
  ]
  const rows = table?.rows ?? data
  const written = summary ?? describeChart({ data, xKey, series, mode: summaryMode, format, formatCategory, msg })

  const effective = state ?? (data.length ? "ready" : "empty")
  const ready = effective !== "loading" && effective !== "empty" && effective !== "error"
  const showPatternSwitch = patternsProp === "toggle"

  const download = () => {
    const text = toCsv(columns.map((c) => c.label), rows.map((r) => columns.map((c) => (c.format ? c.format(r[c.key], r) : String(r[c.key] ?? "")))))
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `${(downloadName || title).toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "chart"}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div data-slot="chart-frame" data-state={effective} className={cn("bg-card text-card-foreground flex min-w-0 flex-col rounded-xl border shadow-xs", className)} {...props}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-5 pt-5">
        <div className="min-w-0">
          <h3 id={headingId} className="text-base leading-snug font-semibold tracking-tight">
            {title}
          </h3>
          {description ? <p className="text-muted-foreground mt-0.5 text-sm">{description}</p> : null}
        </div>
        {ready || actions ? (
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            {ready && showPatternSwitch && view === "chart" ? (
              <Toggle size="sm" variant="outline" pressed={patternsOn} onPressedChange={setPatternsOn} aria-label={msg("chart-frame.patternsHint", "Fill with patterns as well as color")}>
                {msg("chart-frame.patterns", "Patterns")}
              </Toggle>
            ) : null}
            {ready && tableView ? (
              <SegmentedControl size="sm" aria-label={msg("chart-frame.view", "View")} value={view} onValueChange={(v) => setView(v as "chart" | "table")}>
                <SegmentedControlItem value="chart" aria-label={msg("chart-frame.chart", "Chart")}>
                  <ChartColumn aria-hidden="true" />
                  <span className="max-sm:sr-only">{msg("chart-frame.chart", "Chart")}</span>
                </SegmentedControlItem>
                <SegmentedControlItem value="table" aria-label={msg("chart-frame.table", "Table")}>
                  <Table2 aria-hidden="true" />
                  <span className="max-sm:sr-only">{msg("chart-frame.table", "Table")}</span>
                </SegmentedControlItem>
              </SegmentedControl>
            ) : null}
          </div>
        ) : null}
      </div>

      <StateView
        bare
        state={effective}
        onRetry={onRetry}
        label={msg("chart-frame.loading", "Loading {title}", { title })}
        loading={React.isValidElement(skeleton) ? skeleton : <ChartSkeleton kind={(typeof skeleton === "string" ? skeleton : "area") as "area" | "bars" | "donut" | "lines" | "radar"} />}
        empty={{ title: msg("chart-frame.emptyTitle", "No data yet"), description: msg("chart-frame.emptyDescription", "The chart appears when there is something to plot."), ...emptyState }}
        error={{ title: msg("chart-frame.errorTitle", "The chart could not be loaded"), description: msg("chart-frame.errorDescription", "Check your connection and try again."), ...errorState }}
        className="flex-1 px-5 pt-4 pb-5"
      >
        {view === "chart" || !tableView ? (
          <div className="grid gap-3">
            <ChartContainer config={config} label={title} summary={written} format={format} className={cn(ASPECT[aspect], chartClassName)} dir={dir}>
              {children(chart)}
            </ChartContainer>
            {legendMode !== "none" ? (
              <div role={legendMode === "toggle" ? "group" : undefined} aria-label={legendMode === "toggle" ? msg("chart-frame.series", "Series") : undefined} className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
                {series.map((s) => {
                  const off = hidden.has(s.key)
                  const swatch = (
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" className="shrink-0 rounded-[3px]" style={{ color: config[s.key]?.color }}>
                      <rect width="12" height="12" rx="3" fill={patterns && !off ? `url(#${patternId(s.key)})` : off ? "none" : "currentColor"} stroke="currentColor" strokeWidth={off ? 1.5 : 0} />
                    </svg>
                  )
                  return legendMode === "toggle" ? (
                    <button
                      key={s.key}
                      type="button"
                      aria-pressed={!off}
                      onClick={() => toggleSeries(s.key)}
                      className={cn("inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50", !off && "text-foreground", off && "opacity-70")}
                    >
                      {swatch}
                      {s.label}
                    </button>
                  ) : (
                    <span key={s.key} className="inline-flex h-7 items-center gap-1.5 px-2 text-xs text-muted-foreground">
                      {swatch}
                      {s.label}
                    </span>
                  )
                })}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-3">
            <ChartTable title={title} columns={columns} rows={rows} />
            {downloadName !== false ? (
              <div className="flex justify-end">
                <button type="button" onClick={download} className="inline-flex h-8 items-center gap-2 rounded-md border px-3 text-[13px] font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4">
                  <Download aria-hidden="true" />
                  {msg("chart-frame.download", "Download CSV")}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </StateView>
      {ready && footer ? <div className="text-muted-foreground border-t px-5 py-3 text-sm">{footer}</div> : null}
    </div>
  )
}

export { ChartFrame, ChartTable, describeChart, niceScale, domainTicks, type ChartFrameProps, type ChartFrameContext, type ChartSeries, type ChartRow, type TableColumn }
