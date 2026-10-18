"use client"

import * as React from "react"

import { ChartArea } from "@/components/ballmac/chart-area"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"

const data = [
  { month: "Jan", orders: 312 },
  { month: "Feb", orders: 348 },
  { month: "Mar", orders: 401 },
  { month: "Apr", orders: 386 },
  { month: "May", orders: 452 },
  { month: "Jun", orders: 497 },
]

type View = "ready" | "loading" | "empty" | "error"

export default function ChartAreaStates() {
  const [state, setState] = React.useState<View>("loading")
  return (
    <div className="grid w-full max-w-2xl gap-3">
      <SegmentedControl size="sm" aria-label="State" value={state} onValueChange={(v) => setState(v as View)}>
        <SegmentedControlItem value="ready">Ready</SegmentedControlItem>
        <SegmentedControlItem value="loading">Loading</SegmentedControlItem>
        <SegmentedControlItem value="empty">Empty</SegmentedControlItem>
        <SegmentedControlItem value="error">Error</SegmentedControlItem>
      </SegmentedControl>
      <ChartArea
        title="Orders"
        description="Per month"
        data={state === "empty" ? [] : data}
        xKey="month"
        series={[{ key: "orders", label: "Orders" }]}
        state={state}
        onRetry={() => setState("ready")}
      />
    </div>
  )
}
