// Ballmac UI: Funnel Chart. https://ui.ballmac.com/components/funnel-chart
"use client"

import * as React from "react"
import { ArrowDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type FunnelStep = {
  id: string
  label: string
  /** How many reached this step. */
  value: number
  /** A note under the label, for example "Viewed the pricing page". */
  hint?: string
}

type FunnelChartProps = Omit<React.ComponentProps<"div">, "onSelect" | "title"> & {
  steps: FunnelStep[]
  title?: string
  format?: (value: number) => string
  /** The selected step. Controlled. */
  selected?: string | null
  onSelect?: (id: string | null) => void
}

const nf = new Intl.NumberFormat("en-US")
const pct = (n: number) => `${Math.round(n * 1000) / 10}%`

/**
 * A funnel as a stack of bars that narrow step by step. Between each pair it says how many carried on and how many dropped out, in words, and the biggest drop is
 * flagged. Steps are buttons that report a selection, and a table version is there for screen readers.
 */
function FunnelChart({ steps, title, format = (v) => nf.format(v), selected, onSelect, className, ...props }: FunnelChartProps) {
  const msg = useMessages()
  const id = React.useId()
  const first = steps[0]?.value || 1
  let worst = -1
  let worstDrop = 0
  steps.forEach((s, i) => {
    if (i === 0) return
    const drop = steps[i - 1].value - s.value
    if (drop > worstDrop) {
      worstDrop = drop
      worst = i
    }
  })
  const last = steps[steps.length - 1]

  return (
    <div data-slot="funnel-chart" className={cn("grid min-w-0 gap-3", className)} {...props}>
      {title && <h3 id={`${id}-t`} className="text-sm font-medium">{title}</h3>}
      <ol aria-labelledby={title ? `${id}-t` : undefined} className="grid grid-cols-[minmax(0,1fr)] gap-0">
        {steps.map((s, i) => {
          const prev = steps[i - 1]
          const w = Math.max(6, (s.value / first) * 100)
          const on = selected === s.id
          const kept = prev && prev.value > 0 ? s.value / prev.value : 1
          const content = (
            <>
              <span className="grid min-w-0 gap-0.5">
                <span className="flex items-baseline gap-2">
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">{i + 1}</span>
                  <span className="truncate text-sm font-medium">{s.label}</span>
                </span>
                {s.hint && <span className="truncate ps-4 text-xs text-muted-foreground">{s.hint}</span>}
              </span>
              <span className="text-end">
                <span className="block text-lg font-semibold tracking-[-0.02em] tabular-nums">{format(s.value)}</span>
                <span className="block text-xs text-muted-foreground tabular-nums">{msg("funnel-chart.ofFirst", "{percent} of the start", { percent: pct(s.value / first) })}</span>
              </span>
            </>
          )
          return (
            <li key={s.id} className="min-w-0">
              {prev && (
                <p className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-1 py-1.5 ps-4 text-xs", i === worst ? "font-medium text-foreground" : "text-muted-foreground")}>
                  <ArrowDown aria-hidden="true" className="size-3" />
                  {msg("funnel-chart.kept", "{kept} carried on, {lost} dropped out", { kept: pct(kept), lost: format(prev.value - s.value) })}
                  {i === worst && <span className="rounded-full border border-foreground px-1.5 py-px text-[11px] whitespace-nowrap">{msg("funnel-chart.biggest", "Biggest drop")}</span>}
                </p>
              )}
              <div className="relative">
                <span aria-hidden="true" className={cn("absolute inset-y-0 start-0 overflow-hidden rounded-lg transition-[width] duration-500 motion-reduce:transition-none", on ? "bg-foreground/20" : "bg-foreground/[0.07]")} style={{ width: `${w}%` }}>
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
                </span>
                {onSelect ? (
                  <button type="button" aria-pressed={on} onClick={() => onSelect(on ? null : s.id)} className="relative flex min-h-14 w-full items-center justify-between gap-4 rounded-lg px-4 py-2 text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    {content}
                  </button>
                ) : (
                  <div className="relative flex min-h-14 items-center justify-between gap-4 px-4 py-2">{content}</div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      {last && steps.length > 1 && (
        <p className="border-t pt-3 text-sm text-muted-foreground">
          {msg("funnel-chart.overall", "{percent} of everyone who started reached the end ({value} of {first}).", { percent: pct(last.value / first), value: format(last.value), first: format(first) })}
        </p>
      )}
    </div>
  )
}

export { FunnelChart, type FunnelChartProps, type FunnelStep }
