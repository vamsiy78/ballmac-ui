// Ballmac UI: KPI Row. https://ui.ballmac.com/components/kpi-row
import * as React from "react"
import { cn } from "@/lib/utils"

type KpiRowProps = React.ComponentProps<"dl"> & {
  /** Number of columns at wide widths. */
  columns?: 2 | 3 | 4
}
type KpiItemProps = React.ComponentProps<"div"> & {
  /** Metric label. */
  label: string
  /** Metric value. */
  value: React.ReactNode
  /** Supporting context or comparison. */
  detail?: React.ReactNode
}

function KpiRow({ className, columns = 3, ...props }: KpiRowProps) {
  return (
    <dl
      data-slot="kpi-row"
      data-columns={columns}
      className={cn(
        "bg-card grid min-w-0 grid-cols-1 overflow-hidden rounded-xl border border-border sm:grid-cols-2 data-[columns=3]:lg:grid-cols-3 data-[columns=4]:lg:grid-cols-4",
        className,
      )}
      {...props}
    />
  )
}
function KpiItem({ className, label, value, detail, ...props }: KpiItemProps) {
  return (
    <div
      data-slot="kpi-item"
      className={cn(
        "flex min-w-0 flex-col gap-2 border-b border-border p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0",
        className,
      )}
      {...props}
    >
      <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {label}
      </dt>
      <dd className="truncate text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </dd>
      {detail && <dd className="text-muted-foreground text-xs">{detail}</dd>}
    </div>
  )
}
export { KpiRow, KpiItem, type KpiRowProps, type KpiItemProps }
