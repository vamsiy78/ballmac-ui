import * as React from "react"

import { Sortable, SortableItem } from "@/components/ballmac/sortable"

const filters = ["Design", "Engineering", "Marketing", "Support", "Finance", "People"]

export default function SortableHorizontal() {
  const [order, setOrder] = React.useState(filters)
  return (
    <div className="w-full max-w-lg space-y-3">
      <p className="text-sm text-muted-foreground">Order the filters. The first one is the default.</p>
      <Sortable label="Filter order" orientation="horizontal" value={order} onValueChange={setOrder}>
        {order.map((name) => (
          <SortableItem key={name} id={name} dragEverywhere className="rounded-full px-4 py-1.5">
            {name}
          </SortableItem>
        ))}
      </Sortable>
    </div>
  )
}
