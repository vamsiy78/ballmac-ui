"use client"

import { ChartScatter } from "@/components/ballmac/chart-scatter"

const data = [
  { plan: "free", seats: 2, usage: 140 }, { plan: "free", seats: 3, usage: 210 }, { plan: "free", seats: 1, usage: 90 }, { plan: "free", seats: 4, usage: 260 }, { plan: "free", seats: 2, usage: 180 },
  { plan: "pro", seats: 6, usage: 820 }, { plan: "pro", seats: 9, usage: 1180 }, { plan: "pro", seats: 12, usage: 1420 }, { plan: "pro", seats: 8, usage: 910 }, { plan: "pro", seats: 14, usage: 1710 },
  { plan: "team", seats: 24, usage: 3200 }, { plan: "team", seats: 31, usage: 3900 }, { plan: "team", seats: 42, usage: 5100 }, { plan: "team", seats: 28, usage: 3600 }, { plan: "team", seats: 36, usage: 4300 },
]

export default function ChartScatterGroups() {
  return (
    <ChartScatter
      className="w-full max-w-2xl"
      title="Usage by seats"
      description="One point per account, colored by plan"
      data={data}
      xKey="seats"
      yKey="usage"
      groupKey="plan"
      xLabel="Seats"
      yLabel="Requests per day"
      groups={[
        { key: "free", label: "Free" },
        { key: "pro", label: "Pro" },
        { key: "team", label: "Team" },
      ]}
    />
  )
}
