// Ballmac UI: Chart Radar. https://ui.ballmac.com/components/chart-radar
"use client"

import * as React from "react"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"

import { ChartTooltip, ChartTooltipContent } from "@/components/ballmac/chart"
import { ChartFrame, type ChartFrameProps } from "@/components/ballmac/chart-frame"

type ChartRadarProps = Omit<ChartFrameProps, "children" | "summaryMode" | "skeleton" | "table"> & {
  /** Fill each shape. Turn it off to draw outlines, which keeps overlapping series readable. */
  fillShape?: boolean
  /** Draw a dot on every axis. */
  dots?: boolean
  /** The shape of the grid rings. */
  grid?: "polygon" | "circle" | "none"
  /** Fix the scale, for example `[0, 100]`. */
  domain?: [number, number]
  /** Write the scale along one axis. */
  scale?: boolean
  tooltip?: boolean
}

/**
 * A radar chart in a ChartFrame: filled or outlined shapes, polygon or circular rings, dots, a fixed scale, a legend that switches series off,
 * a table of every axis, patterns, and loading, empty and error states.
 */
function ChartRadar({ data, xKey, series, fillShape = true, dots = false, grid = "polygon", domain, scale = false, tooltip = true, aspect = "square", ...frame }: ChartRadarProps) {
  // Axes run clockwise from the top. Right to left they run the other way, which is the same ring with the first axis kept on top and the rest reversed.
  const points = (rtl: boolean) => (rtl && data.length > 2 ? [data[0]!, ...data.slice(1).reverse()] : data)
  return (
    <ChartFrame data={data} xKey={xKey} series={series} summaryMode="ranking" skeleton="radar" aspect={aspect} {...frame}>
      {(chart) => (
        <RadarChart data={points(chart.rtl)} outerRadius="72%" margin={{ top: 12, right: 28, bottom: 12, left: 28 }} accessibilityLayer>
          <defs>{chart.defs}</defs>
          {grid !== "none" ? <PolarGrid gridType={grid} /> : null}
          <PolarAngleAxis dataKey={xKey} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v: unknown) => chart.formatCategory(v)} />
          {scale ? <PolarRadiusAxis angle={chart.rtl ? 90 + 180 / Math.max(3, data.length) : 90 - 180 / Math.max(3, data.length)} domain={domain} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} /> : <PolarRadiusAxis domain={domain} tick={false} axisLine={false} tickLine={false} />}
          {tooltip ? <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} /> : null}
          {series.map((s) => (
            <Radar
              key={s.key}
              dataKey={s.key}
              hide={chart.isHidden(s.key)}
              stroke={chart.color(s.key)}
              strokeWidth={2}
              fill={chart.patterns ? chart.fill(s.key) : chart.color(s.key)}
              fillOpacity={fillShape || chart.patterns ? (chart.patterns ? 1 : 0.22) : 0}
              dot={dots ? { r: 3.5, fillOpacity: 1 } : false}
              isAnimationActive={chart.animate}
              animationDuration={700}
            />
          ))}
        </RadarChart>
      )}
    </ChartFrame>
  )
}

export { ChartRadar, type ChartRadarProps }
