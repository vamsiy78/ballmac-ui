"use client"

import { HeatGrid } from "@/components/ballmac/heat-grid"

const rows = ["Fast small", "Balanced", "Deep reasoner"].map((l) => ({ id: l, label: l }))
const columns = ["Refunds", "Tone", "Tools", "Math", "Safety"].map((l) => ({ id: l, label: l }))
const values = [
  [71, 88, 64, 52, 93],
  [86, 91, 82, 78, 96],
  [94, 90, 91, 97, 95],
]

export default function HeatGridTone() {
  return (
    <div className="w-full max-w-2xl">
      <HeatGrid rowLabel="Model" columnLabel="Test group" rows={rows} columns={columns} values={values} format={(v) => `${v}%`} tone={(v) => (v >= 85 ? "good" : v >= 70 ? "warn" : "bad")} />
    </div>
  )
}