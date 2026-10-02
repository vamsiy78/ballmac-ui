// Ballmac UI: Contribution Graph. https://ui.ballmac.com/components/contribution-graph
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useLocale, useMessages } from "@/lib/ballmac/i18n"

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
  const msg = useMessages()
  const locale = useLocale()
  const total = data.reduce((sum, day) => sum + Math.max(0, day.count), 0)
  const max = Math.max(1, ...data.map((day) => day.count))
  return (
    <div
      data-slot="contribution-graph"
      role="img"
      tabIndex={0}
      aria-label={data.length ? msg("contribution-graph.summaryRange", { one: "{label}: {total} total across {count} day, {from} to {to}", other: "{label}: {total} total across {count} days, {from} to {to}" }, { label, total, count: data.length, from: data[0].date, to: data.at(-1)?.date ?? "" }) : msg("contribution-graph.summary", "{label}: {total} total across 0 days", { label, total })}
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
        <span>{msg("contribution-graph.total", { one: "{total} contribution", other: "{total} contributions" }, { count: total, total: total.toLocaleString(locale) })}</span>
        <span className="whitespace-nowrap">
          {msg("contribution-graph.less", "Less")}{" "}
          <span
            aria-hidden="true"
            className="bg-muted inline-block size-2 rounded-sm"
          />{" "}
          ·{" "}
          <span
            aria-hidden="true"
            className="bg-primary inline-block size-2 rounded-sm"
          />{" "}
          {msg("contribution-graph.more", "More")}
        </span>
      </div>
    </div>
  )
}
export { ContributionGraph, type ContributionGraphProps, type ContributionDay }
