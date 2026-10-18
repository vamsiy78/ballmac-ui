import * as React from "react"

import { Sortable, SortableItem } from "@/components/ballmac/sortable"

const widgets = [
  { id: "revenue", title: "Revenue", value: "$48.2k", note: "+12% this week" },
  { id: "signups", title: "Sign-ups", value: "1,284", note: "+4% this week" },
  { id: "churn", title: "Churn", value: "1.9%", note: "−0.3 pts" },
  { id: "latency", title: "p95 latency", value: "182 ms", note: "Within target" },
  { id: "tickets", title: "Open tickets", value: "37", note: "9 waiting on us" },
  { id: "nps", title: "NPS", value: "58", note: "Last 30 days" },
]

export default function SortableGrid() {
  const [order, setOrder] = React.useState(widgets.map((w) => w.id))
  const byId = new Map(widgets.map((w) => [w.id, w]))
  return (
    <Sortable label="Dashboard widgets" orientation="grid" value={order} onValueChange={setOrder} className="w-full max-w-xl">
      {order.map((id) => {
        const w = byId.get(id)!
        return (
          <SortableItem key={id} id={id} label={w.title} dragEverywhere className="flex-col items-start gap-1 p-4">
            <span className="text-xs font-medium text-muted-foreground">{w.title}</span>
            <span className="text-2xl font-semibold tabular-nums tracking-tight">{w.value}</span>
            <span className="text-xs text-muted-foreground">{w.note}</span>
          </SortableItem>
        )
      })}
    </Sortable>
  )
}
