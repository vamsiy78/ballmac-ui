"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { StateView } from "@/components/ballmac/state-view"
import type { BlockState } from "@/lib/ballmac/use-resource"

const activity = [
  { who: "Maya Jensen", what: "approved the Q4 launch plan", when: "2m ago", tone: "bg-chart-2/25" },
  { who: "Dev Patel", what: "commented on Pricing page", when: "18m ago", tone: "bg-chart-1/25" },
  { who: "Sana Okafor", what: "shipped build 482 to production", when: "1h ago", tone: "bg-chart-3/25" },
  { who: "Lucas Meyer", what: "invited 3 teammates", when: "3h ago", tone: "bg-chart-4/25" },
]

/** The skeleton has the same rows, in the same places, as the ready list, so the page does not jump when data arrives. */
function ActivitySkeleton() {
  return (
    <ul className="divide-y" aria-hidden="true">
      {activity.map((a) => (
        <li key={a.who} className="flex items-center gap-3 py-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="grid flex-1 gap-1.5">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function StateViewDemo() {
  const [state, setState] = React.useState<BlockState>("ready")
  return (
    <div className="bg-card w-full max-w-lg rounded-2xl border p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight">Recent activity</h3>
        <SegmentedControl aria-label="State" value={state} onValueChange={(v) => setState(v as BlockState)}>
          <SegmentedControlItem value="ready">Ready</SegmentedControlItem>
          <SegmentedControlItem value="loading">Loading</SegmentedControlItem>
          <SegmentedControlItem value="empty">Empty</SegmentedControlItem>
          <SegmentedControlItem value="error">Error</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <StateView
        state={state}
        loading={<ActivitySkeleton />}
        empty={{
          title: "No activity yet",
          description: "Invite your team or publish something and it will show up here.",
          action: (
            <Button size="sm">
              <Plus /> Invite teammates
            </Button>
          ),
        }}
        error={{ title: "Could not load activity", description: "The activity service did not answer in time.", details: "GET /v1/activity 504 Gateway Timeout (request 8f2c1e)" }}
        onRetry={() => setState("loading")}
      >
        <ul className="divide-y">
          {activity.map((a) => (
            <li key={a.who} className="flex items-center gap-3 py-3 text-sm">
              <span aria-hidden="true" className={`${a.tone} text-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold`}>
                {a.who
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <p className="min-w-0 flex-1">
                <span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span>
              </p>
              <span className="text-muted-foreground text-xs">{a.when}</span>
            </li>
          ))}
        </ul>
      </StateView>
    </div>
  )
}
