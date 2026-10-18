"use client"

import { ChartBar } from "@/components/ballmac/chart-bar"

const data = [
  { day: "Mon", tickets: 42 },
  { day: "Tue", tickets: 58 },
  { day: "Wed", tickets: 51 },
  { day: "Thu", tickets: 73 },
  { day: "Fri", tickets: 64 },
  { day: "Sat", tickets: 22 },
  { day: "Sun", tickets: 17 },
]

export default function ChartBarLabels() {
  return (
    <ChartBar
      className="w-full max-w-xl"
      title="Support tickets"
      description="Opened this week"
      data={data}
      xKey="day"
      categoryLabel="Day"
      series={[{ key: "tickets", label: "Tickets" }]}
      labels
      valueAxis={false}
      grid="none"
      highlight="Thu"
      footer="Thursday was the busiest day."
    />
  )
}
