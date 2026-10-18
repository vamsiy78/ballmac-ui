"use client"

import { ChartArea } from "@/components/ballmac/chart-area"

const data = [
  { week: "Sep 7", signups: 212 },
  { week: "Sep 14", signups: 248 },
  { week: "Sep 21", signups: 231 },
  { week: "Sep 28", signups: 296 },
  { week: "Oct 5", signups: 340 },
  { week: "Oct 12", signups: 322 },
]

export default function ChartAreaDots() {
  return (
    <ChartArea
      className="w-full max-w-2xl"
      title="New signups"
      description="Per week"
      data={data}
      xKey="week"
      categoryLabel="Week"
      curve="linear"
      dots
      grid="both"
      series={[{ key: "signups", label: "Signups", color: "var(--chart-2)" }]}
    />
  )
}
