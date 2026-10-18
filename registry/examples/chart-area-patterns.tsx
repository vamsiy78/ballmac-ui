"use client"

import { ChartArea } from "@/components/ballmac/chart-area"

const data = [
  { day: "Mon", api: 1840, web: 1260, mobile: 720 },
  { day: "Tue", api: 2010, web: 1380, mobile: 810 },
  { day: "Wed", api: 2240, web: 1290, mobile: 940 },
  { day: "Thu", api: 2190, web: 1450, mobile: 1020 },
  { day: "Fri", api: 2480, web: 1510, mobile: 1180 },
  { day: "Sat", api: 1620, web: 980, mobile: 1340 },
  { day: "Sun", api: 1410, web: 870, mobile: 1290 },
]

export default function ChartAreaPatterns() {
  return (
    <ChartArea
      className="w-full max-w-2xl"
      title="Requests by client"
      description="Switch Patterns on to tell the series apart without color"
      data={data}
      xKey="day"
      categoryLabel="Day"
      stack="stacked"
      fillMode="solid"
      patterns="toggle"
      series={[
        { key: "api", label: "API" },
        { key: "web", label: "Web" },
        { key: "mobile", label: "Mobile" },
      ]}
    />
  )
}
