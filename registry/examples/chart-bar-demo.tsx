"use client"

import { ChartBar } from "@/components/ballmac/chart-bar"

const data = [
  { month: "Apr", revenue: 18200, costs: 11400 },
  { month: "May", revenue: 21400, costs: 12100 },
  { month: "Jun", revenue: 19800, costs: 12900 },
  { month: "Jul", revenue: 26300, costs: 13600 },
  { month: "Aug", revenue: 29100, costs: 14200 },
  { month: "Sep", revenue: 34600, costs: 15800 },
]

export default function ChartBarDemo() {
  return (
    <ChartBar
      className="w-full max-w-2xl"
      title="Revenue and costs"
      description="April to September"
      data={data}
      xKey="month"
      categoryLabel="Month"
      series={[
        { key: "revenue", label: "Revenue" },
        { key: "costs", label: "Costs", color: "var(--chart-3)" },
      ]}
      axisFormatter={(v) => `$${v / 1000}k`}
      valueFormatter={(v) => `$${v.toLocaleString("en-US")}`}
    />
  )
}
