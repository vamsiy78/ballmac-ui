"use client"

import { ChartArea } from "@/components/ballmac/chart-area"

const data = [
  { week: "W1", search: 3100, direct: 1900, social: 800, email: 520 },
  { week: "W2", search: 3300, direct: 1950, social: 910, email: 540 },
  { week: "W3", search: 3250, direct: 2100, social: 1250, email: 600 },
  { week: "W4", search: 3600, direct: 2080, social: 1480, email: 650 },
  { week: "W5", search: 3800, direct: 2160, social: 1390, email: 760 },
  { week: "W6", search: 4210, direct: 2200, social: 1630, email: 820 },
]

export default function ChartAreaExpanded() {
  return (
    <ChartArea
      className="w-full max-w-2xl"
      title="Traffic mix"
      description="Each channel's share of weekly visitors"
      data={data}
      xKey="week"
      categoryLabel="Week"
      stack="expanded"
      fillMode="solid"
      series={[
        { key: "search", label: "Search" },
        { key: "direct", label: "Direct" },
        { key: "social", label: "Social" },
        { key: "email", label: "Email" },
      ]}
    />
  )
}
