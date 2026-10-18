"use client"

import { ChartBar } from "@/components/ballmac/chart-bar"

const data = [
  { browser: "Chrome", visitors: 8420 },
  { browser: "Safari", visitors: 5130 },
  { browser: "Firefox", visitors: 1980 },
  { browser: "Edge", visitors: 1610 },
  { browser: "Other", visitors: 640 },
]

export default function ChartBarCategories() {
  return (
    <ChartBar
      className="w-full max-w-2xl"
      title="Visitors by browser"
      description="Each bar has its own color; the legend lists the browsers"
      data={data}
      xKey="browser"
      categoryLabel="Browser"
      colorBy="category"
      sort="descending"
      series={[{ key: "visitors", label: "Visitors" }]}
    />
  )
}
