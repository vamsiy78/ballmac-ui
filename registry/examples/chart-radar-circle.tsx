"use client"

import { ChartRadar } from "@/components/ballmac/chart-radar"

const data = [
  { day: "Mon", focus: 62, calls: 34 },
  { day: "Tue", focus: 71, calls: 28 },
  { day: "Wed", focus: 58, calls: 47 },
  { day: "Thu", focus: 76, calls: 22 },
  { day: "Fri", focus: 49, calls: 38 },
  { day: "Sat", focus: 18, calls: 6 },
  { day: "Sun", focus: 12, calls: 4 },
]

export default function ChartRadarCircle() {
  return (
    <ChartRadar
      className="w-full max-w-md"
      title="Week at a glance"
      description="Minutes of focus and of calls, in tens"
      data={data}
      xKey="day"
      categoryLabel="Day"
      grid="circle"
      fillShape={false}
      dots
      series={[
        { key: "focus", label: "Focus" },
        { key: "calls", label: "Calls", color: "var(--chart-4)" },
      ]}
    />
  )
}
