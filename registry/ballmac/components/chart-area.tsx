// Ballmac UI: Chart Area. https://ui.ballmac.com/components/chart-area
"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"

import { ChartTooltip, ChartTooltipContent } from "@/components/ballmac/chart"
import { ChartFrame, domainTicks, niceScale, type ChartFrameProps } from "@/components/ballmac/chart-frame"
import { cn } from "@/lib/utils"

type ChartAreaProps = Omit<ChartFrameProps, "children" | "summaryMode" | "skeleton" | "table"> & {
  /** How the line moves between points. */
  curve?: "monotone" | "linear" | "step" | "natural"
  /** "stacked" adds the series up; "expanded" shows each one's share of the total, as a percentage. */
  stack?: "none" | "stacked" | "expanded"
  /** What fills under each line. */
  fillMode?: "gradient" | "solid" | "none"
  /** Draw a dot on every point. */
  dots?: boolean
  /** Which grid lines to draw. */
  grid?: "horizontal" | "both" | "none"
  /** Show the value axis. */
  yAxis?: boolean
  /** Writes a tick on the value axis. Defaults to a compact number (12K). */
  yFormatter?: (value: number) => string
  /** Fix the value axis, for example `[0, 100]`. */
  yDomain?: [number | "auto", number | "auto"]
  /** Horizontal lines at fixed values, such as a target or a limit. */
  referenceLines?: { y: number; label: string }[]
  /** The marker style in the tooltip, or "none" to hide the tooltip. */
  tooltip?: "line" | "dot" | "dashed" | "none"
}

/**
 * An area chart in a ChartFrame: gradient, solid or no fill, stacked or expanded to 100%, four curves, reference lines, a legend that switches
 * series on and off, a Table view, patterns for color blindness, loading, empty and error states, and mirroring in right-to-left.
 */
function ChartArea({
  data,
  xKey,
  series,
  curve = "monotone",
  stack = "none",
  fillMode = "gradient",
  dots = false,
  grid = "horizontal",
  yAxis = true,
  yFormatter,
  yDomain,
  referenceLines,
  tooltip = "line",
  chartClassName,
  ...frame
}: ChartAreaProps) {
  const uid = React.useId().replace(/:/g, "")
  const expanded = stack === "expanded"
  return (
    <ChartFrame data={data} xKey={xKey} series={series} summaryMode="trend" skeleton="area" chartClassName={cn("[&_.recharts-area-dot]:stroke-card", chartClassName)} {...frame}>
      {(chart) => {
        const compact = new Intl.NumberFormat(chart.locale, { notation: "compact", maximumFractionDigits: 1 })
        const scale = expanded || yDomain ? undefined : niceScale({ data, keys: chart.visible, stacked: stack === "stacked" })
        return (
          <AreaChart data={data} stackOffset={expanded ? "expand" : "none"} margin={chart.margin({ top: 8, right: 8, left: 0, bottom: 0 })} accessibilityLayer>
            <defs>
              {fillMode === "gradient"
                ? series.map((s) => (
                    <linearGradient key={s.key} id={`${uid}-g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chart.color(s.key)} stopOpacity={stack === "none" ? 0.38 : 0.55} />
                      <stop offset="95%" stopColor={chart.color(s.key)} stopOpacity={stack === "none" ? 0.02 : 0.18} />
                    </linearGradient>
                  ))
                : null}
              {chart.defs}
            </defs>
            <CartesianGrid vertical={grid === "both"} horizontal={grid !== "none"} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} reversed={chart.rtl} tickFormatter={(v: unknown) => chart.formatCategory(v)} padding={chart.rtl ? { left: 16, right: 8 } : { left: 8, right: 16 }} />
            {yAxis ? (
              <YAxis
                width="auto"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                orientation={chart.rtl ? "right" : "left"}
                domain={expanded ? [0, 1] : (yDomain ?? scale?.domain)}
                ticks={expanded ? undefined : (scale?.ticks ?? domainTicks(yDomain))}
                tickFormatter={(v: number) => (expanded ? `${Math.round(v * 100)}%` : yFormatter ? yFormatter(v) : compact.format(v))}
              />
            ) : null}
            {referenceLines?.map((r) => (
              <ReferenceLine key={r.label} y={r.y} stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeOpacity={0.7} label={{ value: r.label, position: chart.rtl ? "insideTopLeft" : "insideTopRight", fill: "var(--muted-foreground)", fontSize: 11 }} />
            ))}
            {tooltip !== "none" ? <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent indicator={tooltip} />} /> : null}
            {series.map((s) => (
              <Area
                key={s.key}
                dataKey={s.key}
                type={curve}
                hide={chart.isHidden(s.key)}
                stackId={stack === "none" ? undefined : "stack"}
                stroke={chart.color(s.key)}
                strokeWidth={2}
                fill={fillMode === "none" ? "transparent" : chart.patterns ? chart.fill(s.key) : fillMode === "solid" ? chart.color(s.key) : `url(#${uid}-g-${s.key})`}
                fillOpacity={fillMode === "solid" && !chart.patterns ? (stack === "none" ? 0.18 : 0.7) : 1}
                dot={dots ? { r: 3, strokeWidth: 2, fill: "var(--card)" } : false}
                activeDot={{ r: 4 }}
                isAnimationActive={chart.animate}
                animationDuration={700}
              />
            ))}
          </AreaChart>
        )
      }}
    </ChartFrame>
  )
}

export { ChartArea, type ChartAreaProps }
