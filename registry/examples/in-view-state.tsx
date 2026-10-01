"use client"

import * as React from "react"

import { InView } from "@/components/ballmac/in-view"

export default function InViewState() {
  const [events, setEvents] = React.useState(0)
  return (
    <div className="grid w-full max-w-sm gap-3">
      <InView
        effect="none"
        once={false}
        amount={0.5}
        onInViewChange={() => setEvents((n) => n + 1)}
        className="rounded-xl border bg-card p-4 transition-colors duration-300 data-[in-view=true]:border-chart-2 data-[in-view=true]:bg-chart-2/10"
      >
        {(inView) => (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{inView ? "On screen" : "Off screen"}</p>
              <p className="text-xs text-muted-foreground">Style it with data-in-view, or read the state in a function child.</p>
            </div>
            <span className="rounded-full border px-2 py-0.5 font-mono text-xs tabular-nums">{events} changes</span>
          </div>
        )}
      </InView>
    </div>
  )
}
