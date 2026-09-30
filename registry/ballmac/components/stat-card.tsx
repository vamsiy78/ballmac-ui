// Ballmac UI: Stat Card. https://ui.ballmac.com/components/stat-card
import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

type StatCardProps = React.ComponentProps<"div"> & {
  /** Short metric label. */
  label: string
  /** Formatted value, including any unit or currency symbol. */
  value: React.ReactNode
  /** Signed percentage change from the comparison period. */
  change?: number
  /** Description of the comparison period. */
  comparison?: string
  /** Whether a smaller value is the desired outcome. */
  lowerIsBetter?: boolean
  /** Optional small chart or icon at the right. */
  visual?: React.ReactNode
}

function StatCard({
  className,
  label,
  value,
  change,
  comparison,
  lowerIsBetter = false,
  visual,
  ...props
}: StatCardProps) {
  const direction =
    change === undefined || change === 0
      ? "neutral"
      : (change > 0) !== lowerIsBetter
        ? "positive"
        : "negative"
  const Icon =
    change === undefined || change === 0
      ? Minus
      : change > 0
        ? ArrowUpRight
        : ArrowDownRight
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "bg-card text-card-foreground flex min-w-0 flex-col gap-4 rounded-xl border border-border p-5 shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          data-slot="stat-card-label"
          className="text-muted-foreground text-sm font-medium"
        >
          {label}
        </span>
        {visual && (
          <span
            data-slot="stat-card-visual"
            aria-hidden="true"
            className="text-primary shrink-0"
          >
            {visual}
          </span>
        )}
      </div>
      <div
        data-slot="stat-card-value"
        className="truncate text-3xl font-semibold tracking-tight tabular-nums"
      >
        {value}
      </div>
      {(change !== undefined || comparison) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {change !== undefined && (
            <span
              data-slot="stat-card-change"
              data-trend={direction}
              className={cn(
                "relative inline-flex items-center gap-0.5 rounded-full px-2 py-1 font-medium tabular-nums",
                direction === "positive"
                  ? "bg-primary/10 text-primary"
                  : direction === "negative"
                    ? "bg-destructive/10 text-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              <Icon aria-hidden="true" className="size-3.5" />
              <span className="sr-only">{direction === "positive" ? "Improving" : direction === "negative" ? "Worsening" : "Unchanged"}: </span>
              {Math.abs(change)}%
            </span>
          )}
          {comparison && (
            <span className="text-muted-foreground">{comparison}</span>
          )}
        </div>
      )}
    </div>
  )
}

export { StatCard, type StatCardProps }
