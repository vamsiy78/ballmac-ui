// Ballmac UI: Waterfall Chart. https://ui.ballmac.com/components/waterfall-chart
"use client"

import * as React from "react"

import { useMessages } from "@/lib/ballmac/i18n"
import { cn } from "@/lib/utils"

type WaterfallStep = {
  id: string
  label: string
  /** For a change, how much it adds (positive) or takes away (negative). For a total, the running total at that point. */
  value: number
  /** A total stands on the baseline and resets the running total. A change floats from where the last step ended. */
  kind?: "change" | "total"
}

type WaterfallChartProps = Omit<React.ComponentProps<"figure">, "children"> & {
  steps: WaterfallStep[]
  /** Turns a value into text. */
  format?: (value: number) => string
  /** Height of the plot in pixels. */
  height?: number
  /** A heading read by assistive technology and shown above the chart. */
  title?: string
}

type Bar = { step: WaterfallStep; from: number; to: number; running: number }

/** The running total, the start and end of every bar. Pure, so it can be tested and reused. */
function buildBars(steps: WaterfallStep[]): Bar[] {
  let running = 0
  return steps.map((step) => {
    if (step.kind === "total") {
      running = step.value
      return { step, from: 0, to: step.value, running }
    }
    const from = running
    running += step.value
    return { step, from, to: running, running }
  })
}

const sign = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "")

/**
 * A waterfall (bridge) chart: a start, the changes that add to it or take away from it, and where it ends. Built from HTML, so labels are real text that wraps
 * and scales, and a table of the same numbers is there for screen readers. Increases and decreases carry a + or − sign as well as their colour.
 * Runs on the server.
 */
function WaterfallChart({ steps, format = (v) => v.toLocaleString("en-US"), height = 260, title, className, ...props }: WaterfallChartProps) {
  const id = React.useId()
  const msg = useMessages()
  const bars = buildBars(steps)
  const all = bars.flatMap((b) => [b.from, b.to, 0])
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const span = hi - lo || 1
  const y = (v: number) => ((hi - v) / span) * 100
  const zero = y(0)
  const last = bars[bars.length - 1]

  return (
    <figure data-slot="waterfall-chart" aria-labelledby={title ? `${id}-t` : undefined} className={cn("grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-3", className)} {...props}>
      {title && (
        <figcaption id={`${id}-t`} className="text-sm font-medium text-foreground">
          {title}
        </figcaption>
      )}
      <div className="rounded-xl border bg-card p-3 pb-2 sm:p-4" dir="ltr">
        <div className="relative flex gap-1.5 sm:gap-2.5" style={{ height }} aria-hidden="true">
          <span className="absolute inset-x-0 border-t border-dashed border-border" style={{ top: `${zero}%` }} />
          {bars.map((b, i) => {
            const top = y(Math.max(b.from, b.to))
            const h = Math.max(Math.abs(y(b.to) - y(b.from)), 0.8)
            const total = b.step.kind === "total"
            const up = b.step.value >= 0
            const next = bars[i + 1]
            return (
              <div key={b.step.id} className="relative min-w-0 flex-1">
                <span
                  className={cn("absolute inset-x-0 rounded-[5px] transition-[height,top] duration-500 motion-reduce:transition-none", total ? "bg-foreground" : up ? "bg-chart-2" : "bg-destructive")}
                  style={{ top: `${top}%`, height: `${h}%` }}
                />
                <span className="absolute inset-x-0 -translate-y-full pb-1 text-center text-[11px] font-medium tabular-nums text-foreground sm:text-xs" style={{ top: `${top}%` }}>
                  {total ? format(b.step.value) : `${sign(b.step.value)}${format(Math.abs(b.step.value))}`}
                </span>
                {next && <span className="absolute h-px bg-border" style={{ top: `${y(b.to)}%`, insetInlineStart: "100%", width: "0.4rem" }} />}
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex gap-1.5 sm:gap-2.5" aria-hidden="true">
          {bars.map((b) => (
            <p key={b.step.id} className="min-w-0 flex-1 text-center text-[10px] leading-tight break-words hyphens-auto text-muted-foreground sm:text-xs">
              {b.step.label}
            </p>
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>{title ?? "Changes from the start to the end"}</caption>
        <thead>
          <tr>
            <th scope="col">{msg("waterfall-chart.step", "Step")}</th>
            <th scope="col">{msg("waterfall-chart.change", "Change")}</th>
            <th scope="col">{msg("waterfall-chart.after", "Total after")}</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((b) => (
            <tr key={b.step.id}>
              <th scope="row">{b.step.label}</th>
              <td>{b.step.kind === "total" ? "Total" : `${sign(b.step.value)}${format(Math.abs(b.step.value))}${b.step.value >= 0 ? ", increase" : ", decrease"}`}</td>
              <td>{format(b.running)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {last && (
        <p className="sr-only">
          {msg("waterfall-chart.ends", "Ends at {value}.", { value: format(last.running) })}
        </p>
      )}
    </figure>
  )
}

export { WaterfallChart, buildBars, type WaterfallChartProps, type WaterfallStep }
