"use client"

import { ChartRadar } from "@/components/ballmac/chart-radar"

const data = [
  { metric: "Speed", before: 52, after: 81 },
  { metric: "Accuracy", before: 74, after: 88 },
  { metric: "Reliability", before: 63, after: 79 },
  { metric: "Cost", before: 70, after: 66 },
  { metric: "Support", before: 58, after: 84 },
  { metric: "Docs", before: 45, after: 77 },
]

export default function ChartRadarCompare() {
  return (
    <ChartRadar
      className="w-full max-w-md"
      title="Before and after"
      description="Scorecard, with the scale shown"
      data={data}
      xKey="metric"
      categoryLabel="Metric"
      domain={[0, 100]}
      scale
      series={[
        { key: "before", label: "Before", color: "var(--chart-3)" },
        { key: "after", label: "After" },
      ]}
    />
  )
}
