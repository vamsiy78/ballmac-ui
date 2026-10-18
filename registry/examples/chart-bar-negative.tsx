"use client"

import { ChartBar } from "@/components/ballmac/chart-bar"

const data = [
  { month: "May", net: 4200 },
  { month: "Jun", net: -1800 },
  { month: "Jul", net: 3100 },
  { month: "Aug", net: 6400 },
  { month: "Sep", net: -900 },
  { month: "Oct", net: 5200 },
]

export default function ChartBarNegative() {
  return (
    <ChartBar
      className="w-full max-w-2xl"
      title="Net cash flow"
      description="Money in minus money out"
      data={data}
      xKey="month"
      categoryLabel="Month"
      series={[{ key: "net", label: "Net", color: "var(--chart-2)" }]}
      negativeColor="var(--destructive)"
      axisFormatter={(v) => `${v < 0 ? "−" : ""}$${Math.abs(v) / 1000}k`}
      valueFormatter={(v) => `${v < 0 ? "−" : ""}$${Math.abs(v).toLocaleString("en-US")}`}
      referenceLines={[{ value: 0, label: "" }]}
      footer="Two months were negative."
    />
  )
}
