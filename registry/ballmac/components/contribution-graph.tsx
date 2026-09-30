// Ballmac UI: Contribution Graph. https://ui.ballmac.com/components/contribution-graph
import * as React from "react"
import { cn } from "@/lib/utils"

type ContributionDay = {
  /** ISO date (YYYY-MM-DD). */ date: string
  /** Contribution count. */ count: number
}
type ContributionGraphProps = React.ComponentProps<"div"> & {
  /** Daily values in calendar order. */ data: ContributionDay[]
  /** Accessible description of the measure. */ label: string
  /** Number of color levels for nonzero values. */ levels?: 2 | 3 | 4
}
function ContributionGraph({
  className,
  data,
  label,
  levels = 4,
  ...props
}: ContributionGraphProps) {
  const total = data.reduce((sum, day) => sum + Math.max(0, day.count), 0)
  const max = Math.max(1, ...data.map((day) => day.count))
  return (
    <div
      data-slot="contribution-graph"
      role="img"
      tabIndex={0}
      aria-label={`${label}: ${total} total across ${data.length} days${data.length ? `, ${data[0].date} to ${data.at(-1)?.date}` : ""}`}
      className={cn(
        "min-w-0 max-w-full overflow-x-auto rounded-xl border border-border bg-card p-4",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="grid w-max grid-flow-col grid-rows-7 gap-1"
      >
        {data.map((day) => {
          const level =
            day.count <= 0
              ? 0
              : Math.max(1, Math.ceil((day.count / max) * levels))
          return (
            <span
              key={day.date}
              data-slot="contribution-day"
              data-level={level}
              title={`${day.date}: ${day.count}`}
              className={cn(
                "size-3 rounded-[3px] border border-border/50",
                level === 0
                  ? "bg-muted"
                  : level === 1
                    ? "bg-primary/25"
                    : level === 2
                      ? "bg-primary/45"
                      : level === 3
                        ? "bg-primary/70"
                        : "bg-primary",
              )}
            />
          )
        })}
      </div>
      <div className="text-muted-foreground mt-3 flex items-center justify-between gap-3 text-xs">
        <span>{total.toLocaleString("en-US")} contributions</span>
        <span className="whitespace-nowrap">
          Less{" "}
          <span
            aria-hidden="true"
            className="bg-muted inline-block size-2 rounded-sm"
          />{" "}
          ·{" "}
          <span
            aria-hidden="true"
            className="bg-primary inline-block size-2 rounded-sm"
          />{" "}
          More
        </span>
      </div>
    </div>
  )
}
export { ContributionGraph, type ContributionGraphProps, type ContributionDay }
