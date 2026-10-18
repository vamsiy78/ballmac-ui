"use client"

import { ChartLine } from "@/components/ballmac/chart-line"

const data = [
  { sprint: "S12", points: 31 },
  { sprint: "S13", points: 36 },
  { sprint: "S14", points: 29 },
  { sprint: "S15", points: 41 },
  { sprint: "S16", points: 44 },
  { sprint: "S17", points: 39 },
  { sprint: "S18", points: 47 },
]

export default function ChartLineDots() {
  return (
    <ChartLine
      className="w-full max-w-2xl"
      title="Sprint velocity"
      description="Story points completed"
      data={data}
      xKey="sprint"
      categoryLabel="Sprint"
      curve="linear"
      dots
      grid="both"
      series={[{ key: "points", label: "Points", color: "var(--chart-2)" }]}
      yDomain={[20, 50]}
    />
  )
}
