// Ballmac UI: Chart Radial. https://ui.ballmac.com/components/chart-radial
"use client"

import * as React from "react"
import { Cell, PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"

import { ChartCenterLabel, ChartTooltip, ChartTooltipContent } from "@/components/ballmac/chart"
import { ChartFrame, type ChartFrameProps, type ChartRow, type ChartSeries } from "@/components/ballmac/chart-frame"
import { useLocale, useMessages } from "@/lib/ballmac/i18n"

type ChartRadialProps = Omit<ChartFrameProps, "children" | "series" | "xKey" | "summaryMode" | "skeleton" | "table" | "data"> & {
  /** One row per ring: its name under `nameKey`, its number under `valueKey`, and optionally a `label` and a `color`. One row is a gauge. */
  data: ChartRow[]
  nameKey?: string
  valueKey?: string
  /** What the full ring stands for. Defaults to 100, or the largest value when that is more. */
  max?: number
  /** What the numbers count, for the table header: "minutes". */
  valueLabel?: string
  /** Draw only the upper half, like a gauge. */
  half?: boolean
  /** Text in the middle: `true` writes the first ring's share, or give `{ value, label }`. */
  centerLabel?: boolean | { value: string; label: string }
  /** Draw the empty part of each ring. */
  track?: boolean
  tooltip?: boolean
}

/**
 * Radial bars in a ChartFrame: one ring is a gauge, several are concentric progress rings. Full or half circle, a track behind each ring, text
 * in the middle, a legend that switches rings off, a table of value and share of the maximum, patterns, and loading, empty and error states.
 */
function ChartRadial({
  data,
  nameKey = "name",
  valueKey = "value",
  max,
  valueLabel,
  half = false,
  centerLabel = true,
  track = true,
  tooltip = true,
  categoryLabel,
  categoryFormatter,
  valueFormatter,
  summary,
  ...frame
}: ChartRadialProps) {
  const msg = useMessages()
  const locale = useLocale()
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const pct = React.useMemo(() => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }), [locale])
  const number = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0)
  const write = (v: number) => (valueFormatter ? valueFormatter(v, valueKey) : nf.format(v))
  const top = Math.max(0, ...data.map((r) => number(r[valueKey])))
  const full = max ?? (top > 100 ? top : 100)

  const items: ChartSeries[] = data.map((row) => {
    const name = String(row[nameKey])
    return { key: name, label: typeof row.label === "string" ? row.label : categoryFormatter ? categoryFormatter(row[nameKey]) : name, color: typeof row.color === "string" ? row.color : undefined }
  })
  const labelOf = (name: string) => items.find((i) => i.key === name)?.label ?? name
  const written =
    summary ??
    data.map((row) => msg("chart-radial.summary", "{name}: {value} of {max} ({share}).", { name: labelOf(String(row[nameKey])), value: write(number(row[valueKey])), max: write(full), share: pct.format(number(row[valueKey]) / full) })).join(" ")

  return (
    <ChartFrame
      data={data}
      xKey={nameKey}
      series={items}
      summary={written}
      aspect={half ? "wide" : "square"}
      skeleton="donut"
      legend={data.length > 1 ? "toggle" : "none"}
      categoryLabel={categoryLabel}
      valueFormatter={valueFormatter}
      categoryFormatter={categoryFormatter}
      table={{
        columns: [
          { key: nameKey, label: categoryLabel ?? msg("chart-radial.category", "Category"), format: (v) => labelOf(String(v)) },
          { key: valueKey, label: valueLabel ? valueLabel.charAt(0).toUpperCase() + valueLabel.slice(1) : msg("chart-radial.value", "Value"), numeric: true, format: (v) => write(number(v)) },
          { key: "__share", label: msg("chart-radial.share", "Of {max}", { max: write(full) }), numeric: true, format: (_v, row) => pct.format(number(row[valueKey]) / full) },
        ],
        rows: data,
      }}
      {...frame}
    >
      {(chart) => {
        const shown = data.filter((row) => !chart.isHidden(String(row[nameKey])))
        const first = shown[0]
        // Rings run the way the page reads: clockwise left to right, counterclockwise right to left.
        const [startAngle, endAngle] = half ? (chart.rtl ? [0, 180] : [180, 0]) : chart.rtl ? [90, 450] : [90, -270]
        const center = centerLabel === true ? (first ? { value: pct.format(number(first[valueKey]) / full), label: labelOf(String(first[nameKey])) } : null) : centerLabel || null
        return (
          <RadialBarChart data={shown} cy={half ? "88%" : "50%"} innerRadius={half ? "105%" : "58%"} outerRadius={half ? "165%" : "92%"} startAngle={startAngle} endAngle={endAngle} barSize={shown.length > 1 ? undefined : half ? 36 : 26} accessibilityLayer>
            <defs>{chart.defs}</defs>
            <PolarAngleAxis type="number" domain={[0, full]} angleAxisId={0} tick={false} />
            {tooltip ? <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey={nameKey} />} /> : null}
            <RadialBar dataKey={valueKey} angleAxisId={0} cornerRadius={10} background={track ? { fill: "var(--muted)" } : false} isAnimationActive={chart.animate} animationDuration={700}>
              {shown.map((row) => {
                const key = String(row[nameKey])
                return <Cell key={key} fill={chart.fill(key)} stroke={chart.patterns ? chart.color(key) : undefined} strokeWidth={chart.patterns ? 1.5 : undefined} />
              })}
            </RadialBar>
            {center ? <ChartCenterLabel value={center.value} label={center.label} cy={half ? 0.88 : 0.5} /> : null}
          </RadialBarChart>
        )
      }}
    </ChartFrame>
  )
}

export { ChartRadial, type ChartRadialProps }
