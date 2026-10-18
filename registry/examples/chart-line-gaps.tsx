"use client"

import { ChartLine } from "@/components/ballmac/chart-line"

const data = [
  { day: "Mon", sensor: 21.4 },
  { day: "Tue", sensor: 22.1 },
  { day: "Wed", sensor: null },
  { day: "Thu", sensor: null },
  { day: "Fri", sensor: 23.6 },
  { day: "Sat", sensor: 22.8 },
  { day: "Sun", sensor: 21.9 },
]

export default function ChartLineGaps() {
  return (
    <ChartLine
      className="w-full max-w-2xl"
      title="Cold room temperature"
      description="The sensor was offline on Wednesday and Thursday"
      data={data}
      xKey="day"
      categoryLabel="Day"
      gaps
      dots
      yDomain={[20, 25]}
      yFormatter={(v) => `${v}°`}
      valueFormatter={(v) => `${v}°C`}
      series={[{ key: "sensor", label: "Temperature", color: "var(--chart-5)" }]}
    />
  )
}
