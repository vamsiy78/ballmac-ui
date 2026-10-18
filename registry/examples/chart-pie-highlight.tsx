"use client"

import { ChartPie } from "@/components/ballmac/chart-pie"

const data = [
  { name: "rent", label: "Rent", value: 1850 },
  { name: "food", label: "Food", value: 640 },
  { name: "transport", label: "Transport", value: 210 },
  { name: "fun", label: "Fun", value: 320 },
  { name: "savings", label: "Savings", value: 480 },
]

export default function ChartPieHighlight() {
  return (
    <ChartPie
      className="w-full max-w-lg"
      title="Monthly budget"
      description="Rent is the largest share"
      data={data}
      labels="outside"
      highlight="rent"
      centerLabel={false}
      valueFormatter={(v) => `$${v.toLocaleString("en-US")}`}
      categoryLabel="Category"
    />
  )
}
