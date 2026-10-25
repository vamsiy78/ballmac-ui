// Ballmac UI: Dumbbell Chart. https://ui.ballmac.com/components/dumbbell-chart
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type DumbbellRow = {
  id: string
  label: string
  before: number
  after: number
}

type DumbbellChartProps = Omit<React.ComponentProps<"figure">, "children" | "title"> & {
  rows: DumbbellRow[]
  /** What the first dot is, for example "Last version". */
  beforeLabel?: string
  /** What the second dot is, for example "This version". */
  afterLabel?: string
  /** True when a smaller number is better, for example latency or cost. */
  lowerIsBetter?: boolean
  format?: (value: number) => string
  title?: string
}

const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 })

/**
 * Before and after for many things at once: each row is two dots on one scale with a line between them, so how far it moved and which way is the first thing you
 * see. Every row also says it in words ("up 8, better"), because the colors only repeat it.
 */
function DumbbellChart({ rows, beforeLabel, afterLabel, lowerIsBetter = false, format = (v) => nf.format(v), title, className, ...props }: DumbbellChartProps) {
  const msg = useMessages()
  const id = React.useId()
  beforeLabel ??= msg("dumbbell-chart.before", "Before")
  afterLabel ??= msg("dumbbell-chart.after", "After")
  const all = rows.flatMap((r) => [r.before, r.after])
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const pad = (hi - lo || 1) * 0.08
  const min = lo - pad
  const span = hi + pad - min
  const at = (v: number) => ((v - min) / span) * 100

  return (
    <figure data-slot="dumbbell-chart" aria-labelledby={title ? `${id}-t` : undefined} className={cn("@container grid min-w-0 gap-4", className)} {...props}>
      {title && <figcaption id={`${id}-t`} className="text-sm font-medium">{title}</figcaption>}
      <p className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground" aria-hidden="true">
        <span className="flex items-center gap-1.5"><span className="size-3 rounded-full border-2 border-muted-foreground bg-card" />{beforeLabel}</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-foreground" />{afterLabel}</span>
      </p>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3.5">
        {rows.map((r) => {
          const delta = r.after - r.before
          const better = delta === 0 ? null : lowerIsBetter ? delta < 0 : delta > 0
          const a = at(r.before)
          const b = at(r.after)
          const word = delta === 0 ? msg("dumbbell-chart.same", "no change") : msg(delta > 0 ? "dumbbell-chart.up" : "dumbbell-chart.down", delta > 0 ? "up {amount}" : "down {amount}", { amount: format(Math.abs(delta)) })
          return (
            <li key={r.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1 @xl:grid-cols-[9rem_minmax(0,1fr)_11.5rem] @xl:items-center @xl:gap-4">
              <p className="order-1 truncate text-sm font-medium">{r.label}</p>
              <div className="relative order-3 col-span-2 h-6 @xl:order-2 @xl:col-span-1" aria-hidden="true">
                <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
                <span className={cn("absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full", better === null ? "bg-muted-foreground/40" : better ? "bg-chart-2" : "bg-destructive")} style={{ insetInlineStart: `${Math.min(a, b)}%`, width: `${Math.abs(b - a)}%` }} />
                <span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-muted-foreground bg-card rtl:translate-x-1/2" style={{ insetInlineStart: `${a}%` }} />
                <span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-2 ring-card rtl:translate-x-1/2" style={{ insetInlineStart: `${b}%` }} />
              </div>
              <p className="order-2 text-end text-xs tabular-nums text-muted-foreground @xl:order-3">
                <span className="font-medium text-foreground">{format(r.before)} → {format(r.after)}</span>
                <span className="ms-2 @xl:ms-2">{word}{better === null ? "" : better ? msg("dumbbell-chart.better", ", better") : msg("dumbbell-chart.worse", ", worse")}</span>
              </p>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}

export { DumbbellChart, type DumbbellChartProps, type DumbbellRow }
