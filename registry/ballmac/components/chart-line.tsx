// Ballmac UI: Chart Line. https://ui.ballmac.com/components/chart-line
"use client"

import * as React from "react"
import { CartesianGrid, LabelList, Line, LineChart, ReferenceLine, usePlotArea, useXAxisScale, useYAxisScale, XAxis, YAxis } from "recharts"

import { ChartTooltip, ChartTooltipContent } from "@/components/ballmac/chart"
import { ChartFrame, domainTicks, niceScale, type ChartFrameProps, type ChartRow, type ChartSeries } from "@/components/ballmac/chart-frame"

type ChartLineProps = Omit<ChartFrameProps, "children" | "summaryMode" | "skeleton" | "table"> & {
  /** How the line moves between points. */
  curve?: "monotone" | "linear" | "step" | "natural"
  /** Draw a dot on every point. */
  dots?: boolean
  /** Series keys drawn dashed, for forecasts or targets: dashes tell lines apart without color. */
  dashed?: string[]
  /** Write each series' name at the end of its line, so people read it without finding the legend. */
  directLabels?: boolean
  /** Write the value on every point. */
  labels?: boolean
  /** Keep the gap where a value is missing instead of joining the points either side. */
  gaps?: boolean
  grid?: "horizontal" | "both" | "none"
  yAxis?: boolean
  yFormatter?: (value: number) => string
  yDomain?: [number | "auto", number | "auto"]
  referenceLines?: { y: number; label: string }[]
  tooltip?: "line" | "dot" | "dashed" | "none"
}

const DASH = "6 5"

/** Each line's name at its last point, pushed apart where two lines end close together. Lives inside the chart to read its scales. */
function EndLabels({ data, xKey, series, rtl, color }: { data: ChartRow[]; xKey: string; series: ChartSeries[]; rtl: boolean; color: (key: string) => string }) {
  const xScale = useXAxisScale()
  const yScale = useYAxisScale()
  const plot = usePlotArea()
  const last = data.at(-1)
  if (!xScale || !yScale || !plot || !last) return null
  const x = xScale(last[xKey] as never)
  if (typeof x !== "number") return null
  const gap = 15
  const items = series
    .map((s) => ({ s, y: yScale(last[s.key] as never) }))
    .filter((i): i is { s: ChartSeries; y: number } => typeof i.y === "number" && Number.isFinite(i.y))
    .sort((a, b) => a.y - b.y)
  const placed = items.map((i) => ({ ...i, at: i.y }))
  for (let i = 1; i < placed.length; i++) if (placed[i]!.at - placed[i - 1]!.at < gap) placed[i]!.at = placed[i - 1]!.at + gap
  const bottom = plot.y + plot.height
  for (let i = placed.length - 1; i >= 0; i--) {
    const limit = i === placed.length - 1 ? bottom : placed[i + 1]!.at - gap
    if (placed[i]!.at > limit) placed[i]!.at = limit
  }
  return (
    <g aria-hidden="true">
      {placed.map(({ s, at }) => (
        <text key={s.key} x={rtl ? x - 10 : x + 10} y={at} dy={4} textAnchor={rtl ? "end" : "start"} className="text-xs font-medium" fill={color(s.key)}>
          {s.label}
        </text>
      ))}
    </g>
  )
}

/**
 * A line chart in a ChartFrame: four curves, dots or value labels, dashed series, labels at the end of each line instead of a legend, a table view,
 * a toggling legend, patterns (as dash styles), loading, empty and error states and mirroring in right-to-left.
 */
function ChartLine({
  data,
  xKey,
  series,
  curve = "monotone",
  dots = false,
  dashed = [],
  directLabels = false,
  labels = false,
  gaps = false,
  grid = "horizontal",
  yAxis = true,
  yFormatter,
  yDomain,
  referenceLines,
  tooltip = "line",
  legend,
  ...frame
}: ChartLineProps) {
  return (
    <ChartFrame data={data} xKey={xKey} series={series} summaryMode="trend" skeleton="lines" legend={legend ?? (directLabels ? "none" : undefined)} {...frame}>
      {(chart) => {
        const compact = new Intl.NumberFormat(chart.locale, { notation: "compact", maximumFractionDigits: 1 })
        const last = data.length - 1
        const scale = yDomain ? undefined : niceScale({ data, keys: chart.visible, zero: false })
        return (
          <LineChart data={data} margin={chart.margin({ top: labels ? 22 : 8, right: directLabels ? 88 : 12, left: 0, bottom: 0 })} accessibilityLayer>
            <defs>{chart.defs}</defs>
            <CartesianGrid vertical={grid === "both"} horizontal={grid !== "none"} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} reversed={chart.rtl} tickFormatter={(v: unknown) => chart.formatCategory(v)} padding={{ left: 8, right: 8 }} />
            {yAxis ? <YAxis width="auto" tickLine={false} axisLine={false} tickMargin={8} orientation={chart.rtl ? "right" : "left"} domain={yDomain ?? scale?.domain} ticks={scale?.ticks ?? domainTicks(yDomain)} tickFormatter={(v: number) => (yFormatter ? yFormatter(v) : compact.format(v))} /> : null}
            {referenceLines?.map((r) => (
              <ReferenceLine key={r.label} y={r.y} stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeOpacity={0.7} label={{ value: r.label, position: chart.rtl ? "insideTopLeft" : "insideTopRight", fill: "var(--muted-foreground)", fontSize: 11 }} />
            ))}
            {tooltip !== "none" ? <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent indicator={tooltip} />} /> : null}
            {series.map((s, i) => (
              <Line
                key={s.key}
                dataKey={s.key}
                type={curve}
                hide={chart.isHidden(s.key)}
                stroke={chart.color(s.key)}
                strokeWidth={2.25}
                // with patterns on, lines are told apart by their dashes
                strokeDasharray={dashed.includes(s.key) ? DASH : chart.patterns && i % 2 === 1 ? "2 4" : undefined}
                strokeLinecap="round"
                dot={dots ? { r: 3, strokeWidth: 2, fill: "var(--card)" } : false}
                activeDot={{ r: 4.5 }}
                connectNulls={!gaps}
                isAnimationActive={chart.animate}
                animationDuration={700}
              >
                {labels ? <LabelList dataKey={s.key} position="top" offset={8} className="fill-foreground text-xs" formatter={(v: unknown) => (typeof v === "number" ? chart.format(v, s.key) : "")} /> : null}
              </Line>
            ))}
            {directLabels ? <EndLabels data={data} xKey={xKey} series={series.filter((s) => !chart.isHidden(s.key))} rtl={chart.rtl} color={chart.color} /> : null}
          </LineChart>
        )
      }}
    </ChartFrame>
  )
}

export { ChartLine, type ChartLineProps }
