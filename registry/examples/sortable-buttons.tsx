"use client"

import * as React from "react"

import { Sortable, SortableHandle, SortableItem, SortableMove } from "@/components/ballmac/sortable"

const steps = ["Collect payment details", "Confirm the shipping address", "Choose a delivery slot", "Review the order", "Place the order"]

export default function SortableButtons() {
  const [order, setOrder] = React.useState(steps)
  return (
    <div className="w-full max-w-md space-y-3">
      <Sortable label="Checkout steps" value={order} onValueChange={setOrder}>
        {order.map((step, i) => (
          <SortableItem key={step} id={step}>
            <SortableHandle />
            <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate">{step}</span>
            <span className="flex">
              <SortableMove direction="previous" />
              <SortableMove direction="next" />
            </span>
          </SortableItem>
        ))}
      </Sortable>
      <p className="text-xs text-muted-foreground">Drag the grip, use Space and the arrow keys on it, or press the arrows.</p>
    </div>
  )
}
