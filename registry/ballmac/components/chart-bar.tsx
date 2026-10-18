// Ballmac UI: Chart Bar. https://ui.ballmac.com/components/chart-bar
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, XAxis, YAxis } from "recharts"

import { ChartTooltip, ChartTooltipContent } from "@/components/ballmac/chart"
import { ChartFrame, describeChart, domainTicks, niceScale, type ChartFrameProps, type ChartRow, type ChartSeries } from "@/components/ballmac/chart-frame"
import { useLocale, useMessages } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

type ChartBarProps = Omit<ChartFrameProps, "children" | "summaryMode" | "skeleton" | "table"> & {
  /** "columns" stand upright with categories along the bottom. "bars" lie flat with categories down the side, which reads better for long names. */
  layout?: "columns" | "bars"
  /** "stacked" piles the series up; "expanded" shows each one's share of the total. */
  stack?: "none" | "stacked" | "expanded"
  /** Corner radius of the bars, in pixels. */
  radius?: number
  /** Write each bar's value on it. For one series or grouped bars. */
  labels?: boolean
  /** With one series, "category" colors every bar differently and the legend lists the categories. */
  colorBy?: "series" | "category"
  /** A category to emphasize: the others fade. */
  highlight?: string
  /** With one series, color bars below zero differently. */
  negativeColor?: string
  /** Sort the categories by the first series. */
  sort?: "none" | "ascending" | "descending"
  /** Space between bars. */
  gap?: "tight" | "default" | "wide"
  grid?: "value" | "both" | "none"
  /** Show the value axis. Hide it when `labels` already write the numbers. */
  valueAxis?: boolean
  /** Writes a tick on the value axis. Defaults to a compact number. */
  axisFormatter?: (value: number) => string
  domain?: [number | "auto", number | "auto"]
  referenceLines?: { value: number; label: string }[]
  tooltip?: "dot" | "line" | "dashed" | "none"
}

const GAP = { tight: 0.08, default: 0.2, wide: 0.45 } as const

/**
 * A bar chart in a ChartFrame: upright columns or flat bars, grouped, stacked or expanded to 100%, value labels, one color per category,
 * a highlighted category, positive and negative coloring, sorting, reference lines and everything the frame adds: a Table view, patterns,
 * a toggling legend and loading, empty and error states.
 */
function ChartBar({
  data,
  xKey,
  series,
  layout = "columns",
  stack = "none",
  radius = 6,
  labels = false,
  colorBy = "series",
  highlight,
  negativeColor,
  sort = "none",
  gap = "default",
  grid = "value",
  valueAxis = true,
  axisFormatter,
  domain,
  referenceLines,
  tooltip = "dot",
  summary,
  categoryFormatter,
  valueFormatter,
  categoryLabel,
  chartClassName,
  ...frame
}: ChartBarProps) {
  const msg = useMessages()
  const locale = useLocale()
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const flat = layout === "bars"
  const expanded = stack === "expanded"
  const byCategory = colorBy === "category" && series.length === 1
  const measure = series[0]

  const rows = React.useMemo<ChartRow[]>(() => {
    if (sort === "none" || !measure) return data
    const sign = sort === "ascending" ? 1 : -1
    return [...data].sort((a, b) => sign * (((a[measure.key] as number) ?? 0) - ((b[measure.key] as number) ?? 0)))
  }, [data, sort, measure])

  // With colorBy="category" the legend and the colors belong to the categories, not to the one series.
  const items: ChartSeries[] = byCategory ? rows.map((r) => ({ key: String(r[xKey]), label: categoryFormatter ? categoryFormatter(r[xKey]) : String(r[xKey]), color: typeof r.color === "string" ? r.color : undefined })) : series
  const number = (value: unknown) => (typeof value === "number" ? value : 0)

  const table = byCategory && measure
    ? {
        columns: [
          { key: xKey, label: categoryLabel ?? msg("chart-bar.category", "Category") },
          { key: measure.key, label: measure.label, numeric: true, format: (v: unknown) => (valueFormatter ? valueFormatter(number(v), measure.key) : nf.format(number(v))) },
        ],
        rows,
      }
    : undefined

  return (
    <ChartFrame
      data={rows}
      xKey={xKey}
      series={items}
      table={table}
      summary={summary ?? (byCategory && measure ? describeChart({ data: rows, xKey, series: [measure], mode: "ranking", format: (v, k) => (valueFormatter ? valueFormatter(v, k) : nf.format(v)), formatCategory: (v) => (categoryFormatter ? categoryFormatter(v) : String(v)), msg }) : undefined)}
      summaryMode={sort === "none" && !byCategory ? "trend" : "ranking"}
      skeleton="bars"
      valueFormatter={valueFormatter}
      categoryFormatter={categoryFormatter}
      categoryLabel={categoryLabel}
      chartClassName={cn(chartClassName)}
      {...frame}
    >
      {(chart) => {
        const compact = new Intl.NumberFormat(chart.locale, { notation: "compact", maximumFractionDigits: 1 })
        const tick = (v: number) => (expanded ? `${Math.round(v * 100)}%` : axisFormatter ? axisFormatter(v) : compact.format(v))
        const visibleSeries = byCategory ? series : series.filter((s) => !chart.isHidden(s.key))
        const lastVisible = visibleSeries.at(-1)?.key
        const scale = expanded || domain || !valueAxis ? undefined : niceScale({ data: rows, keys: visibleSeries.map((s) => s.key), stacked: stack === "stacked" })
        const shown = byCategory ? rows.filter((r) => !chart.isHidden(String(r[xKey]))) : rows
        const barRadius = (key: string): [number, number, number, number] => {
          const r = radius
          if (stack !== "none" && key !== lastVisible) return [0, 0, 0, 0]
          return flat ? [0, r, r, 0] : [r, r, 0, 0]
        }
        return (
          <BarChart
            data={shown}
            layout={flat ? "vertical" : "horizontal"}
            stackOffset={expanded ? "expand" : "none"}
            barCategoryGap={`${GAP[gap] * 100}%`}
            margin={chart.margin({ top: labels && !flat ? 20 : 8, right: flat && labels ? 44 : 8, left: 0, bottom: 0 })}
            accessibilityLayer
          >
            <defs>{chart.defs}</defs>
            <CartesianGrid horizontal={flat ? grid === "both" : grid !== "none"} vertical={flat ? grid !== "none" : grid === "both"} />
            {flat ? (
              <>
                <YAxis dataKey={xKey} type="category" tickLine={false} axisLine={false} tickMargin={8} width="auto" orientation={chart.rtl ? "right" : "left"} tickFormatter={(v: unknown) => chart.formatCategory(v)} />
                <XAxis type="number" hide={!valueAxis} reversed={chart.rtl} tickLine={false} axisLine={false} tickMargin={8} domain={expanded ? [0, 1] : (domain ?? scale?.domain)} ticks={expanded ? undefined : (scale?.ticks ?? domainTicks(domain))} tickFormatter={tick} />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} type="category" tickLine={false} axisLine={false} tickMargin={8} reversed={chart.rtl} tickFormatter={(v: unknown) => chart.formatCategory(v)} />
                <YAxis hide={!valueAxis} type="number" width="auto" tickLine={false} axisLine={false} tickMargin={8} orientation={chart.rtl ? "right" : "left"} domain={expanded ? [0, 1] : (domain ?? scale?.domain)} ticks={expanded ? undefined : (scale?.ticks ?? domainTicks(domain))} tickFormatter={tick} />
              </>
            )}
            {referenceLines?.map((r) => (flat ? <ReferenceLine key={r.label} x={r.value} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: r.label, position: "top", fill: "var(--muted-foreground)", fontSize: 11 }} /> : <ReferenceLine key={r.label} y={r.value} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: r.label, position: chart.rtl ? "insideTopLeft" : "insideTopRight", fill: "var(--muted-foreground)", fontSize: 11 }} />))}
            {tooltip !== "none" ? <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<ChartTooltipContent indicator={tooltip} hideLabel={flat && false} nameKey={byCategory ? undefined : undefined} />} /> : null}
            {(byCategory ? [measure!] : series).map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                hide={!byCategory && chart.isHidden(s.key)}
                stackId={stack === "none" ? undefined : "stack"}
                fill={byCategory ? chart.color(s.key) : chart.fill(s.key)}
                stroke={chart.patterns ? chart.color(s.key) : undefined}
                strokeWidth={chart.patterns ? 1.5 : 0}
                radius={barRadius(s.key)}
                isAnimationActive={chart.animate}
                animationDuration={600}
                maxBarSize={72}
              >
                {byCategory || highlight || negativeColor
                  ? shown.map((row) => {
                      const key = String(row[xKey])
                      const value = number(row[s.key])
                      const base = byCategory ? chart.fill(key) : negativeColor && value < 0 ? negativeColor : chart.fill(s.key)
                      return <Cell key={key} fill={base} stroke={chart.patterns && byCategory ? chart.color(key) : undefined} strokeWidth={chart.patterns ? 1.5 : 0} fillOpacity={highlight && key !== highlight ? 0.35 : 1} />
                    })
                  : null}
                {labels && stack === "none" ? (
                  <LabelList dataKey={s.key} position={flat ? "right" : "top"} offset={6} className="fill-foreground text-xs" formatter={(v: unknown) => (typeof v === "number" ? chart.format(v, s.key) : "")} />
                ) : null}
              </Bar>
            ))}
          </BarChart>
        )
      }}
    </ChartFrame>
  )
}

export { ChartBar, type ChartBarProps }
