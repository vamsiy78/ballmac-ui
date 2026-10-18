"use client"

import { ChartLine } from "@/components/ballmac/chart-line"

const data = [
  { week: "W1", nps: 31 },
  { week: "W2", nps: 34 },
  { week: "W3", nps: 33 },
  { week: "W4", nps: 38 },
  { week: "W5", nps: 42 },
  { week: "W6", nps: 41 },
]

export default function ChartLineLabels() {
  return (
    <ChartLine
      className="w-full max-w-xl"
      title="Net promoter score"
      description="Weekly survey"
      data={data}
      xKey="week"
      categoryLabel="Week"
      labels
      dots
      yAxis={false}
      grid="none"
      yDomain={[20, 50]}
      series={[{ key: "nps", label: "NPS" }]}
    />
  )
}
