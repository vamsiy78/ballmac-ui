"use client"

import { Inventory1 } from "@/components/ballmac/blocks/inventory-1/inventory-1"

export default function Inventory1Demo() {
  return <Inventory1 onReorder={() => new Promise((r) => setTimeout(r, 600))} />
}
