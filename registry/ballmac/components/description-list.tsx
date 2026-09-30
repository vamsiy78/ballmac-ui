// Ballmac UI: Description List. https://ui.ballmac.com/components/description-list
import * as React from "react"
import { cn } from "@/lib/utils"

type DescriptionListProps = React.ComponentProps<"dl"> & {
  /** Align terms and details in two columns on larger screens. */
  layout?: "stacked" | "split"
}
type DescriptionItemProps = React.ComponentProps<"div"> & {
  /** Field label. */
  label: string
  /** Field value. */
  value: React.ReactNode
}
function DescriptionList({
  className,
  layout = "split",
  ...props
}: DescriptionListProps) {
  return (
    <dl
      data-slot="description-list"
      data-layout={layout}
      className={cn(
        "group/description-list bg-card min-w-0 divide-y divide-border rounded-xl border border-border",
        className,
      )}
      {...props}
    />
  )
}
function DescriptionItem({
  className,
  label,
  value,
  ...props
}: DescriptionItemProps) {
  return (
    <div
      data-slot="description-item"
      className={cn(
        "group-data-[layout=split]/description-list:sm:grid group-data-[layout=split]/description-list:sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] group-data-[layout=split]/description-list:sm:gap-4 px-4 py-3 first:rounded-t-xl last:rounded-b-xl",
        className,
      )}
      {...props}
    >
      <dt className="text-muted-foreground text-sm font-medium">{label}</dt>
      <dd className="mt-1 min-w-0 break-words text-sm sm:mt-0">{value}</dd>
    </div>
  )
}
export {
  DescriptionList,
  DescriptionItem,
  type DescriptionListProps,
  type DescriptionItemProps,
}
