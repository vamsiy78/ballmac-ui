// Ballmac UI: Timeline. https://ui.ballmac.com/components/timeline
import * as React from "react"
import { cn } from "@/lib/utils"

type TimelineProps = React.ComponentProps<"ol"> & {
  /** Use a dense layout for log-like content. */
  compact?: boolean
}
type TimelineItemProps = React.ComponentProps<"li"> & {
  /** Whether this item is the current step. */
  current?: boolean
  /** Whether this item has completed. */
  complete?: boolean
}
function Timeline({ className, compact = false, ...props }: TimelineProps) {
  return (
    <ol
      data-slot="timeline"
      data-compact={compact}
      className={cn("group/timeline flex min-w-0 flex-col", className)}
      {...props}
    />
  )
}
function TimelineItem({
  className,
  current = false,
  complete = false,
  ...props
}: TimelineItemProps) {
  return (
    <li
      data-slot="timeline-item"
      data-current={current || undefined}
      data-complete={complete || undefined}
      aria-current={current ? "step" : undefined}
      className={cn(
        "group/timeline-item relative grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 pb-6 last:pb-0 group-data-[compact=true]/timeline:pb-4",
        className,
      )}
      {...props}
    />
  )
}
function TimelineMarker({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="timeline-marker"
      aria-hidden="true"
      className={cn(
        "border-border bg-card text-muted-foreground z-10 flex size-6 items-center justify-center rounded-full border text-xs font-semibold group-data-[complete]/timeline-item:border-primary group-data-[complete]/timeline-item:bg-primary group-data-[complete]/timeline-item:text-primary-foreground group-data-[current]/timeline-item:border-primary group-data-[current]/timeline-item:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-content"
      className={cn("min-w-0 pt-0.5", className)}
      {...props}
    />
  )
}
function TimelineTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="timeline-title"
      className={cn("text-sm font-medium leading-5", className)}
      {...props}
    />
  )
}
function TimelineDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="timeline-description"
      className={cn(
        "text-muted-foreground mt-1 text-sm leading-relaxed",
        className,
      )}
      {...props}
    />
  )
}
function TimelineTime({ className, ...props }: React.ComponentProps<"time">) {
  return (
    <time
      data-slot="timeline-time"
      className={cn(
        "text-muted-foreground mt-1 block text-xs tabular-nums",
        className,
      )}
      {...props}
    />
  )
}
function TimelineConnector({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="timeline-connector"
      aria-hidden="true"
      className={cn(
        "bg-border absolute bottom-0 start-[11px] top-6 w-px group-last/timeline-item:hidden",
        className,
      )}
      {...props}
    />
  )
}
export {
  Timeline,
  TimelineItem,
  TimelineMarker,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
  TimelineConnector,
  type TimelineProps,
  type TimelineItemProps,
}
