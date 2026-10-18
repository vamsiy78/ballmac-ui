"use client"

import { Inventory1 } from "@/components/ballmac/blocks/inventory-1/inventory-1"

// The order form for the sold-out hoodie is open, and the supplier will refuse it, so pressing Place order shows the failure.
export default function Inventory1Ordering() {
  return <Inventory1 defaultOrderingId="3" onReorder={() => Promise.reject(new Error("The supplier is closed until Monday."))} />
}
