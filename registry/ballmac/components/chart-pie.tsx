// Ballmac UI: Chart Pie. https://ui.ballmac.com/components/chart-pie
"use client"

import * as React from "react"
import { Cell, Pie, PieChart, Sector } from "recharts"

import { ChartCenterLabel, ChartTooltip, ChartTooltipContent } from "@/components/ballmac/chart"
import { ChartFrame, type ChartFrameProps, type ChartRow, type ChartSeries } from "@/components/ballmac/chart-frame"
import { useLocale, useMessages } from "@/lib/ballmac/i18n"

type ChartPieProps = Omit<ChartFrameProps, "children" | "series" | "xKey" | "summaryMode" | "skeleton" | "table" | "data"> & {
  /** One row per slice: its name under `nameKey`, its number under `valueKey`, and optionally a `label` and a `color`. */
  data: ChartRow[]
  /** The key of each slice's name. */
  nameKey?: string
  /** The key of each slice's number. */
  valueKey?: string
  /** What the numbers count, for the center and the table: "visitors". */
  valueLabel?: string
  /** A ring with a hole (default) or a full pie. */
  donut?: boolean
  /** Draw only the upper half, like a gauge. */
  half?: boolean
  /** Write the total in the hole of a donut. Pass your own `{ value, label }`, or false to leave it empty. */
  centerLabel?: boolean | { value: string; label: string }
  /** "outside" writes each slice's name and share beside it. */
  labels?: "none" | "outside"
  /** A slice to pull out, by name. */
  highlight?: string
  /** Leave a small gap between slices. */
  gap?: boolean
  tooltip?: boolean
}

/**
 * A pie or donut in a ChartFrame: the total in the hole, outside labels, a pulled-out slice, a half ring, a legend that switches slices off (the total and
 * the shares follow), a table of value and share, a written ranking, patterns, and loading, empty and error states.
 */
function ChartPie({
  data,
  nameKey = "name",
  valueKey = "value",
  valueLabel,
  donut = true,
  half = false,
  centerLabel = true,
  labels = "none",
  highlight,
  gap = true,
  tooltip = true,
  categoryLabel,
  categoryFormatter,
  valueFormatter,
  summary,
  ...frame
}: ChartPieProps) {
  const msg = useMessages()
  const locale = useLocale()
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const pct = React.useMemo(() => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }), [locale])
  const number = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0)
  const write = (v: number) => (valueFormatter ? valueFormatter(v, valueKey) : nf.format(v))

  const items: ChartSeries[] = data.map((row) => {
    const name = String(row[nameKey])
    return { key: name, label: typeof row.label === "string" ? row.label : categoryFormatter ? categoryFormatter(row[nameKey]) : name, color: typeof row.color === "string" ? row.color : undefined }
  })
  const total = data.reduce((sum, row) => sum + number(row[valueKey]), 0)
  const share = (v: number) => (total > 0 ? pct.format(v / total) : "–")
  const ranked = [...data].sort((a, b) => number(b[valueKey]) - number(a[valueKey]))
  const labelOf = (name: string) => items.find((i) => i.key === name)?.label ?? name

  const totalText = valueLabel ? `${write(total)} ${valueLabel}` : write(total)
  const written =
    summary ??
    (data.length
      ? [
          msg("chart-pie.total", { one: "{total} in one group.", other: "{total} in total across {count} groups." }, { total: totalText, count: data.length }),
          ranked.map((row) => `${labelOf(String(row[nameKey]))} ${share(number(row[valueKey]))} (${write(number(row[valueKey]))})`).join(", ") + ".",
        ].join(" ")
      : "")

  return (
    <ChartFrame
      data={data}
      xKey={nameKey}
      series={items}
      summary={written}
      aspect={half ? "wide" : "square"}
      skeleton="donut"
      legend="toggle"
      categoryLabel={categoryLabel}
      valueFormatter={valueFormatter}
      categoryFormatter={categoryFormatter}
      table={{
        columns: [
          { key: nameKey, label: categoryLabel ?? msg("chart-pie.category", "Category"), format: (v) => labelOf(String(v)) },
          { key: valueKey, label: valueLabel ? valueLabel.charAt(0).toUpperCase() + valueLabel.slice(1) : msg("chart-pie.value", "Value"), numeric: true, format: (v) => write(number(v)) },
          { key: "__share", label: msg("chart-pie.share", "Share"), numeric: true, format: (_v, row) => share(number(row[valueKey])) },
        ],
        rows: data,
      }}
      {...frame}
    >
      {(chart) => {
        const shown = data.filter((row) => !chart.isHidden(String(row[nameKey])))
        const shownTotal = shown.reduce((sum, row) => sum + number(row[valueKey]), 0)
        // Slices run the way the page reads: clockwise left to right, counterclockwise right to left.
        const [startAngle, endAngle] = half ? (chart.rtl ? [0, 180] : [180, 0]) : chart.rtl ? [90, 450] : [90, -270]
        const center = centerLabel === true ? { value: write(shownTotal), label: valueLabel ?? msg("chart-pie.totalLabel", "Total") } : centerLabel || null
        return (
          <PieChart accessibilityLayer margin={{ top: labels === "outside" ? 24 : 8, right: labels === "outside" ? 76 : 8, bottom: half ? 0 : 8, left: labels === "outside" ? 76 : 8 }}>
            <defs>{chart.defs}</defs>
            {tooltip ? <ChartTooltip content={<ChartTooltipContent hideLabel nameKey={nameKey} />} /> : null}
            <Pie
              data={shown}
              dataKey={valueKey}
              nameKey={nameKey}
              innerRadius={donut ? (half ? "100%" : "58%") : 0}
              outerRadius={half ? "165%" : labels === "outside" ? "70%" : "92%"}
              startAngle={startAngle}
              endAngle={endAngle}
              cy={half ? "88%" : "50%"}
              paddingAngle={gap ? 2 : 0}
              cornerRadius={donut ? 4 : 2}
              stroke="var(--card)"
              strokeWidth={gap ? 0 : 2}
              isAnimationActive={chart.animate}
              animationDuration={700}
              label={
                labels === "outside"
                  ? (p: { name?: string; percent?: number; x?: number; y?: number; textAnchor?: string; payload?: ChartRow }) => (
                      <text x={p.x} y={p.y} textAnchor={p.textAnchor as "start" | "middle" | "end"} dominantBaseline="central" className="fill-foreground text-xs">
                        {labelOf(String(p.name ?? ""))} <tspan className="fill-muted-foreground">{pct.format(p.percent ?? 0)}</tspan>
                      </text>
                    )
                  : false
              }
              labelLine={labels === "outside" ? { stroke: "var(--border)" } : false}
              {...(highlight !== undefined
                ? {
                    shape: (p: React.ComponentProps<typeof Sector> & { payload?: ChartRow }) => (
                      <Sector {...p} outerRadius={(p.outerRadius ?? 0) + (String(p.payload?.[nameKey]) === highlight ? 8 : 0)} />
                    ),
                  }
                : {})}
            >
              {shown.map((row) => {
                const key = String(row[nameKey])
                return <Cell key={key} fill={chart.fill(key)} stroke={chart.patterns ? chart.color(key) : undefined} strokeWidth={chart.patterns ? 1.5 : undefined} />
              })}
            </Pie>
            {donut && center ? <ChartCenterLabel value={center.value} label={center.label} cy={half ? 0.88 : 0.5} /> : null}
          </PieChart>
        )
      }}
    </ChartFrame>
  )
}

export { ChartPie, type ChartPieProps }
