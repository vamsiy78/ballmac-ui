// Ballmac UI: Rating Distribution. https://ui.ballmac.com/components/rating-distribution
"use client"

import * as React from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type RatingCounts = { 1: number; 2: number; 3: number; 4: number; 5: number }

type RatingDistributionProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  /** How many ratings of each size. */
  counts: RatingCounts
  /** The selected size, to filter reviews with. Controlled. */
  selected?: 1 | 2 | 3 | 4 | 5 | null
  /** Makes each row a button. Called with the size, or null when it is cleared. */
  onSelect?: (rating: 1 | 2 | 3 | 4 | 5 | null) => void
}

const nf = new Intl.NumberFormat("en-US")
const STARS = [5, 4, 3, 2, 1] as const

/**
 * The shape of a set of ratings: the average, the count, and a bar for each star size. Rows can be buttons that filter the reviews beside them. The average is
 * written as a number and the stars are decoration; a partly filled star shows the decimals.
 */
function RatingDistribution({ counts, selected, onSelect, className, ...props }: RatingDistributionProps) {
  const msg = useMessages()
  const total = STARS.reduce((s, k) => s + counts[k], 0)
  const avg = total ? STARS.reduce((s, k) => s + k * counts[k], 0) / total : 0
  const max = Math.max(1, ...STARS.map((k) => counts[k]))

  return (
    <div data-slot="rating-distribution" className={cn("grid min-w-0 gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8", className)} {...props}>
      <div className="grid content-center gap-1.5">
        <p className="text-5xl font-semibold tracking-[-0.04em] tabular-nums">{avg ? avg.toFixed(1) : "–"}</p>
        <div aria-hidden="true" className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => {
            const fill = Math.min(1, Math.max(0, avg - (n - 1)))
            return (
              <span key={n} className="relative size-5">
                <Star className="absolute inset-0 size-5 text-border" />
                <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star className="size-5 fill-foreground text-foreground" />
                </span>
              </span>
            )
          })}
        </div>
        <p className="text-sm text-muted-foreground">{msg("rating-distribution.total", "{count} ratings, average {avg} out of 5", { count: nf.format(total), avg: avg ? avg.toFixed(1) : "0" })}</p>
      </div>
      <ul className="grid grid-cols-[minmax(0,1fr)] content-center gap-1">
        {STARS.map((k) => {
          const on = selected === k
          const n = counts[k]
          const content = (
            <>
              <span className="flex w-8 shrink-0 items-center gap-1 text-sm font-medium tabular-nums">
                {k}
                <Star aria-hidden="true" className="size-3 fill-current" />
              </span>
              <span aria-hidden="true" className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                <span className={cn("block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", on || selected == null ? "bg-foreground" : "bg-muted-foreground/40")} style={{ width: `${(n / max) * 100}%` }} />
              </span>
              <span className="w-20 shrink-0 text-end text-sm tabular-nums text-muted-foreground">
                {nf.format(n)}
                <span className="ms-1.5 text-xs">{msg("rating-distribution.share", "{percent}%", { percent: total ? Math.round((n / total) * 100) : 0 })}</span>
              </span>
            </>
          )
          return (
            <li key={k}>
              {onSelect ? (
                <button type="button" aria-pressed={on} aria-label={msg("rating-distribution.row", "{stars} stars: {count} ratings. Show only these", { stars: k, count: nf.format(n) })} onClick={() => onSelect(on ? null : k)} className="flex min-h-9 w-full items-center gap-3 rounded-md px-2 text-start outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-accent">
                  {content}
                </button>
              ) : (
                <div className="flex min-h-9 items-center gap-3 px-2">{content}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { RatingDistribution, type RatingCounts, type RatingDistributionProps }
