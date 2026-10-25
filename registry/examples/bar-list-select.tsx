"use client"

import * as React from "react"

import { BarList } from "@/components/ballmac/bar-list"

const items = [
  { id: "de", label: "Germany", value: 4210 },
  { id: "fr", label: "France", value: 3180 },
  { id: "es", label: "Spain", value: 1990 },
  { id: "it", label: "Italy", value: 1240 },
]

export default function BarListSelect() {
  const [sel, setSel] = React.useState<string | null>("fr")
  return (
    <div className="grid w-full max-w-md gap-3">
      <BarList title="Visitors by country" items={items} selected={sel} onSelect={setSel} format={(v) => `${(v / 1000).toFixed(1)}k`} />
      <p aria-live="polite" className="text-sm text-muted-foreground">Filtering by: {items.find((i) => i.id === sel)?.label ?? "everything"}</p>
    </div>
  )
}
