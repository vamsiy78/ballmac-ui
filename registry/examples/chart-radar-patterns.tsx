"use client"

import { ChartRadar } from "@/components/ballmac/chart-radar"

const data = [
  { area: "Onboarding", a: 82, b: 64, c: 48 },
  { area: "Billing", a: 71, b: 77, c: 52 },
  { area: "Search", a: 88, b: 59, c: 63 },
  { area: "Exports", a: 54, b: 72, c: 69 },
  { area: "Mobile", a: 66, b: 51, c: 78 },
]

export default function ChartRadarPatterns() {
  return (
    <ChartRadar
      className="w-full max-w-md"
      title="Satisfaction by area"
      description="Three teams. Patterns tell the shapes apart without color"
      data={data}
      xKey="area"
      categoryLabel="Area"
      patterns="toggle"
      domain={[0, 100]}
      series={[
        { key: "a", label: "Team A" },
        { key: "b", label: "Team B" },
        { key: "c", label: "Team C" },
      ]}
    />
  )
}
