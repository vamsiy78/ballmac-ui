"use client"

import { ChartLine } from "@/components/ballmac/chart-line"

const data = [
  { month: "Jan", price: 9 },
  { month: "Mar", price: 9 },
  { month: "Apr", price: 12 },
  { month: "Jul", price: 12 },
  { month: "Aug", price: 15 },
  { month: "Nov", price: 15 },
  { month: "Dec", price: 19 },
]

export default function ChartLineStep() {
  return (
    <ChartLine
      className="w-full max-w-2xl"
      title="Plan price"
      description="Changes only when the price changes"
      data={data}
      xKey="month"
      categoryLabel="Month"
      curve="step"
      yFormatter={(v) => `$${v}`}
      valueFormatter={(v) => `$${v}`}
      yDomain={[0, 20]}
      series={[{ key: "price", label: "Price", color: "var(--chart-4)" }]}
    />
  )
}
