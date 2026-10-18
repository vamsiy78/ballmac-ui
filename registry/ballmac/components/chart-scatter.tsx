// Ballmac UI: Chart Scatter. https://ui.ballmac.com/components/chart-scatter
"use client"

import * as React from "react"
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from "recharts"

import { ChartTooltip } from "@/components/ballmac/chart"
import { ChartFrame, domainTicks, niceScale, type ChartFrameProps, type ChartRow, type ChartSeries } from "@/components/ballmac/chart-frame"
import { useLocale, useMessages } from "@/lib/ballmac/i18n"

type ChartScatterProps = Omit<ChartFrameProps, "children" | "series" | "xKey" | "data" | "summaryMode" | "skeleton" | "table"> & {
  /** One row per point: a number under `xKey` and one under `yKey`, optionally a size, a group and a name. */
  data: ChartRow[]
  xKey: string
  yKey: string
  /** The key of a number that sets each point's size, which turns the scatter into a bubble chart. */
  zKey?: string
  /** The key that says which group a point belongs to. Each group gets a color and a legend item. */
  groupKey?: string
  /** Names and colors for the groups. Without it every point is one group. */
  groups?: ChartSeries[]
  /** The key of each point's name, shown in the tooltip and the table. */
  nameKey?: string
  /** Axis titles, also used in the tooltip and the table. */
  xLabel: string
  yLabel: string
  zLabel?: string
  xFormatter?: (value: number) => string
  yFormatter?: (value: number) => string
  xDomain?: [number | "auto", number | "auto"]
  yDomain?: [number | "auto", number | "auto"]
  /** Smallest and largest point size in pixels, when `zKey` is set. */
  sizeRange?: [number, number]
  grid?: "both" | "horizontal" | "none"
  tooltip?: boolean
}

/**
 * A scatter or bubble chart in a ChartFrame: grouped points with colors, sizes from a third number, titled axes, a legend that switches groups off,
 * a table of every point with a CSV download, a written summary of the ranges, and loading, empty and error states.
 */
function ChartScatter({
  data,
  xKey,
  yKey,
  zKey,
  groupKey,
  groups,
  nameKey,
  xLabel,
  yLabel,
  zLabel,
  xFormatter,
  yFormatter,
  xDomain,
  yDomain,
  sizeRange = [80, 520],
  grid = "both",
  tooltip = true,
  categoryLabel,
  summary,
  aspect = "video",
  ...frame
}: ChartScatterProps) {
  const msg = useMessages()
  const locale = useLocale()
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const items: ChartSeries[] = groups ?? [{ key: "all", label: yLabel }]
  const number = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null)
  const rangeOf = (key: string) => {
    const values = data.map((r) => number(r[key])).filter((v): v is number => v !== null)
    return values.length ? { min: Math.min(...values), max: Math.max(...values) } : null
  }
  const xr = rangeOf(xKey)
  const yr = rangeOf(yKey)
  const written =
    summary ??
    (data.length && xr && yr
      ? msg("chart-scatter.summary", { one: "{count} point. {x} from {xMin} to {xMax}; {y} from {yMin} to {yMax}.", other: "{count} points. {x} from {xMin} to {xMax}; {y} from {yMin} to {yMax}." }, { count: data.length, x: xLabel, xMin: nf.format(xr.min), xMax: nf.format(xr.max), y: yLabel, yMin: nf.format(yr.min), yMax: nf.format(yr.max) })
      : "")
  const writeX = (v: unknown) => (number(v) === null ? "–" : xFormatter ? xFormatter(v as number) : nf.format(v as number))
  const writeY = (v: unknown) => (number(v) === null ? "–" : yFormatter ? yFormatter(v as number) : nf.format(v as number))

  return (
    <ChartFrame
      data={data}
      xKey={nameKey ?? xKey}
      series={items}
      summary={written}
      aspect={aspect}
      skeleton="area"
      legend={groups ? "toggle" : "none"}
      categoryLabel={categoryLabel}
      table={{
        columns: [
          ...(nameKey ? [{ key: nameKey, label: categoryLabel ?? msg("chart-scatter.name", "Name") }] : []),
          ...(groupKey && groups ? [{ key: groupKey, label: msg("chart-scatter.group", "Group"), format: (v: unknown) => groups.find((g) => g.key === String(v))?.label ?? String(v) }] : []),
          { key: xKey, label: xLabel, numeric: true, format: writeX },
          { key: yKey, label: yLabel, numeric: true, format: writeY },
          ...(zKey ? [{ key: zKey, label: zLabel ?? zKey, numeric: true, format: (v: unknown) => (number(v) === null ? "–" : nf.format(v as number)) }] : []),
        ],
        rows: data,
      }}
      {...frame}
    >
      {(chart) => {
        const visibleKeys = groups ? chart.visible : ["all"]
        const rows = groupKey && groups ? data.filter((r) => visibleKeys.includes(String(r[groupKey]))) : data
        const xs = xDomain ? undefined : niceScale({ data: rows, keys: [xKey], zero: false })
        const ys = yDomain ? undefined : niceScale({ data: rows, keys: [yKey], zero: false })
        return (
          <ScatterChart margin={chart.margin({ top: 8, right: 16, bottom: 18, left: 8 })} accessibilityLayer>
            <defs>{chart.defs}</defs>
            <CartesianGrid vertical={grid === "both"} horizontal={grid !== "none"} />
            <XAxis type="number" dataKey={xKey} name={xLabel} reversed={chart.rtl} tickLine={false} axisLine={false} tickMargin={8} domain={xDomain ?? xs?.domain} ticks={xs?.ticks ?? domainTicks(xDomain)} tickFormatter={(v: number) => (xFormatter ? xFormatter(v) : nf.format(v))} label={{ value: xLabel, position: "insideBottom", offset: -14, fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis type="number" dataKey={yKey} name={yLabel} width="auto" orientation={chart.rtl ? "right" : "left"} tickLine={false} axisLine={false} tickMargin={8} domain={yDomain ?? ys?.domain} ticks={ys?.ticks ?? domainTicks(yDomain)} tickFormatter={(v: number) => (yFormatter ? yFormatter(v) : nf.format(v))} label={{ value: yLabel, angle: chart.rtl ? 90 : -90, position: chart.rtl ? "insideRight" : "insideLeft", offset: 4, style: { textAnchor: "middle" }, fill: "var(--muted-foreground)", fontSize: 12 }} />
            {zKey ? <ZAxis type="number" dataKey={zKey} name={zLabel ?? zKey} range={sizeRange} /> : <ZAxis range={[90, 90]} />}
            {tooltip ? (
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  const row = active ? (payload?.[0]?.payload as ChartRow | undefined) : undefined
                  if (!row) return null
                  const group = groupKey && groups ? groups.find((g) => g.key === String(row[groupKey])) : undefined
                  return (
                    <div className="grid min-w-36 gap-1.5 rounded-lg border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-[0_12px_36px_-10px_rgb(0_0_0/0.25)]">
                      {nameKey || group ? <p className="font-medium">{nameKey ? String(row[nameKey]) : group?.label}</p> : null}
                      {nameKey && group ? <p className="text-muted-foreground">{group.label}</p> : null}
                      <dl className="grid gap-1">
                        {[
                          [xLabel, writeX(row[xKey])],
                          [yLabel, writeY(row[yKey])],
                          ...(zKey ? [[zLabel ?? zKey, number(row[zKey]) === null ? "–" : nf.format(row[zKey] as number)]] : []),
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-4">
                            <dt className="text-muted-foreground">{k}</dt>
                            <dd className="font-mono font-medium tabular-nums">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )
                }}
              />
            ) : null}
            {items.map((g) => (
              <Scatter
                key={g.key}
                name={g.label}
                data={groupKey && groups ? data.filter((r) => String(r[groupKey]) === g.key) : data}
                hide={chart.isHidden(g.key)}
                fill={chart.patterns ? chart.fill(g.key) : chart.color(g.key)}
                fillOpacity={zKey ? 0.7 : 0.9}
                stroke={chart.color(g.key)}
                strokeWidth={chart.patterns || zKey ? 1.5 : 0}
                isAnimationActive={chart.animate}
                animationDuration={600}
              />
            ))}
          </ScatterChart>
        )
      }}
    </ChartFrame>
  )
}

export { ChartScatter, type ChartScatterProps }
