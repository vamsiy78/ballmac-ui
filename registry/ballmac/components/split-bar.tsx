// Ballmac UI: Split Bar. https://ui.ballmac.com/components/split-bar
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type SplitSegment = {
  id: string
  label: string
  value: number
  /** A note beside the value, for example "$1,200". */
  hint?: string
}

type SplitBarProps = Omit<React.ComponentProps<"div">, "title"> & {
  segments: SplitSegment[]
  title?: string
  /** Formats each value. */
  format?: (value: number) => string
  /** Shows a total above the bar. */
  total?: string
}

const SHADES = ["bg-foreground", "bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
const nf = new Intl.NumberFormat("en-US")

/**
 * One bar cut into shares, with a legend that says the same thing in numbers. Pointing at a legend row or focusing it lights up its slice and dims the rest, and choosing it keeps it lit;
 * the legend is the accessible version and carries the values and the percentages.
 */
function SplitBar({ segments, title, format = (v) => nf.format(v), total, className, ...props }: SplitBarProps) {
  const msg = useMessages()
  const id = React.useId()
  const [hover, setHover] = React.useState<string | null>(null)
  const [pinned, setPinned] = React.useState<string | null>(null)
  const active = hover ?? pinned
  const sum = segments.reduce((s, x) => s + x.value, 0) || 1

  return (
    <div data-slot="split-bar" className={cn("grid min-w-0 gap-3", className)} {...props}>
      {(title || total) && (
        <div className="flex items-baseline justify-between gap-3">
          {title && <h3 id={`${id}-t`} className="text-sm font-medium">{title}</h3>}
          {total && <p className="text-sm font-semibold tabular-nums">{total}</p>}
        </div>
      )}
      <div aria-hidden="true" className="flex h-3 gap-0.5 overflow-hidden rounded-full">
        {segments.map((s, i) => (
          <span key={s.id} className={cn("min-w-1 transition-opacity motion-reduce:transition-none", SHADES[i % SHADES.length], active && active !== s.id && "opacity-25")} style={{ flexGrow: s.value, flexBasis: 0 }} />
        ))}
      </div>
      <ul aria-labelledby={title ? `${id}-t` : undefined} className="grid grid-cols-[minmax(0,1fr)] gap-0.5 sm:grid-cols-2 sm:gap-x-6">
        {segments.map((s, i) => (
          <li key={s.id} className="min-w-0">
            <button
              type="button"
              aria-pressed={pinned === s.id}
              onClick={() => setPinned(pinned === s.id ? null : s.id)}
              onMouseEnter={() => setHover(s.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(s.id)}
              onBlur={() => setHover(null)}
              className="flex min-h-9 w-full items-center gap-2.5 rounded-md px-2 text-start text-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-[3px]", SHADES[i % SHADES.length])} />
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {s.hint && <span className="me-2 text-xs">{s.hint}</span>}
                <span className="font-medium text-foreground">{format(s.value)}</span>
                <span className="ms-1.5 text-xs">{msg("split-bar.share", "{percent}%", { percent: Math.round((s.value / sum) * 100) })}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { SplitBar, type SplitBarProps, type SplitSegment }
