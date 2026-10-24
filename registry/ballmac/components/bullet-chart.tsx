// Ballmac UI: Bullet Chart. https://ui.ballmac.com/components/bullet-chart
"use client"

import * as React from "react"
import { Check, Minus, TriangleAlert } from "lucide-react"

import { useMessages } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

type BulletItem = {
  id: string
  label: string
  /** Where it is now. */
  value: number
  /** The goal. Drawn as a vertical mark. */
  target?: number
  /** The end of the scale. Defaults to a little past the largest of value, target and the ranges. */
  max?: number
  /** Where "poor" ends and where "fair" ends; beyond that is "good". Drawn as three shades behind the bar. */
  ranges?: [number, number]
  /** A line of context under the label. */
  note?: string
  /** When lower is better (response time, cost), the target is a ceiling. */
  lowerIsBetter?: boolean
}

type BulletChartProps = React.ComponentProps<"ul"> & {
  items: BulletItem[]
  /** Turns a value into text. */
  format?: (value: number) => string
}

/** How an item stands against its target, in words. */
function standing(i: BulletItem): "met" | "close" | "behind" | "none" {
  if (i.target === undefined) return "none"
  const ratio = i.lowerIsBetter ? i.target / Math.max(i.value, 1e-9) : i.value / Math.max(i.target, 1e-9)
  return ratio >= 1 ? "met" : ratio >= 0.85 ? "close" : "behind"
}

const WORDS = { met: "Target met", close: "Close to target", behind: "Behind target", none: "" } as const

/**
 * A bullet chart (Stephen Few's replacement for gauges): a bar for the value, a mark for the target and three shades behind for poor, fair and good. Many
 * measures fit in a small space, and every one says in words whether it met its goal. Runs on the server.
 */
function BulletChart({ items, format = (v) => v.toLocaleString("en-US"), className, ...props }: BulletChartProps) {
  const msg = useMessages()
  return (
    <ul data-slot="bullet-chart" className={cn("grid w-full gap-5", className)} {...props}>
      {items.map((i) => {
        const top = (i.max ?? Math.max(i.value, i.target ?? 0, i.ranges?.[1] ?? 0) * 1.15) || 1
        const pct = (v: number) => `${Math.min(100, Math.max(0, (v / top) * 100))}%`
        const st = standing(i)
        const StIcon = st === "met" ? Check : st === "none" ? Minus : TriangleAlert
        return (
          <li key={i.id} data-standing={st} className="grid gap-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <p className="text-sm font-medium text-foreground">{i.label}</p>
              <p className="flex items-center gap-2 text-sm tabular-nums">
                <span className="font-semibold text-foreground">{format(i.value)}</span>
                {i.target !== undefined && <span className="text-muted-foreground">{msg("bullet-chart.of", "of {target}", { target: format(i.target) })}</span>}
              </p>
            </div>
            <div
              role="meter"
              aria-label={i.label}
              aria-valuemin={0}
              aria-valuemax={top}
              aria-valuenow={Math.min(i.value, top)}
              aria-valuetext={`${format(i.value)}${i.target !== undefined ? ` against a target of ${format(i.target)}. ${WORDS[st]}` : ""}`}
              className="relative h-6 overflow-hidden rounded-md bg-muted"
            >
              {i.ranges && (
                <>
                  <span aria-hidden="true" className="absolute inset-y-0 start-0 bg-foreground/[0.07]" style={{ width: pct(i.ranges[0]) }} />
                  <span aria-hidden="true" className="absolute inset-y-0 bg-foreground/[0.12]" style={{ insetInlineStart: pct(i.ranges[0]), width: `calc(${pct(i.ranges[1])} - ${pct(i.ranges[0])})` }} />
                  <span aria-hidden="true" className="absolute inset-y-0 bg-foreground/[0.19]" style={{ insetInlineStart: pct(i.ranges[1]), insetInlineEnd: 0 }} />
                </>
              )}
              <span aria-hidden="true" className="absolute inset-y-[7px] start-0 rounded-e-[3px] bg-foreground" style={{ width: pct(i.value) }} />
              {i.target !== undefined && <span aria-hidden="true" className="absolute inset-y-[3px] w-[3px] -translate-x-1/2 rounded-full bg-chart-3 shadow-[0_0_0_1.5px_var(--card)] rtl:translate-x-1/2" style={{ insetInlineStart: pct(i.target) }} />}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 text-xs text-muted-foreground">
              <span>{i.note}</span>
              {st !== "none" && (
                <span className={cn("flex items-center gap-1.5", st !== "met" && "font-medium text-foreground")}>
                  <StIcon aria-hidden="true" className="size-3.5" />
                  {WORDS[st]}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export { BulletChart, standing, type BulletChartProps, type BulletItem }
