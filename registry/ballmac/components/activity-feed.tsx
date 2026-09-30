// Ballmac UI: Activity Feed. https://ui.ballmac.com/components/activity-feed
import * as React from "react"
import { cn } from "@/lib/utils"

type Activity = {
  /** Stable item identifier. */ id: string
  /** Person or system responsible. */ actor: string
  /** Action description. */ action: string
  /** Accessible timestamp. */ timestamp: string
  /** ISO datetime for machine readers. */ dateTime?: string
  /** Optional context such as a project or file. */ subject?: string
  /** Optional initials or symbol. */ mark?: string
}
type ActivityFeedProps = React.ComponentProps<"ol"> & {
  /** Ordered activity entries. */ items: Activity[]
  /** Message when the feed has no entries. */ emptyMessage?: string
}
function ActivityFeed({
  className,
  items,
  emptyMessage = "No activity yet",
  ...props
}: ActivityFeedProps) {
  return (
    <ol
      data-slot="activity-feed"
      className={cn(
        "bg-card min-w-0 rounded-xl border border-border px-4",
        className,
      )}
      {...props}
    >
      {items.length ? (
        items.map((item) => (
          <li
            key={item.id}
            data-slot="activity-feed-item"
            className="flex min-w-0 gap-3 border-b border-border py-4 last:border-b-0"
          >
            <span
              data-slot="activity-feed-mark"
              aria-hidden="true"
              className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            >
              {item.mark ?? item.actor.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-relaxed">
                <strong className="font-medium">{item.actor}</strong>{" "}
                {item.action}
                {item.subject && (
                  <>
                    {" "}
                    <span className="font-medium">{item.subject}</span>
                  </>
                )}
              </p>
              <time
                dateTime={item.dateTime}
                className="text-muted-foreground mt-1 block text-xs"
              >
                {item.timestamp}
              </time>
            </div>
          </li>
        ))
      ) : (
        <li
          data-slot="activity-feed-empty"
          className="text-muted-foreground py-8 text-center text-sm"
        >
          {emptyMessage}
        </li>
      )}
    </ol>
  )
}
export { ActivityFeed, type ActivityFeedProps, type Activity }
