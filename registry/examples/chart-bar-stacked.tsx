"use client"

import { ChartBar } from "@/components/ballmac/chart-bar"

const data = [
  { quarter: "Q1", inbound: 420, outbound: 310, partner: 140 },
  { quarter: "Q2", inbound: 480, outbound: 360, partner: 190 },
  { quarter: "Q3", inbound: 560, outbound: 340, partner: 260 },
  { quarter: "Q4", inbound: 640, outbound: 410, partner: 330 },
]

export default function ChartBarStacked() {
  return (
    <ChartBar
      className="w-full max-w-2xl"
      title="Qualified leads"
      description="By source, stacked"
      data={data}
      xKey="quarter"
      categoryLabel="Quarter"
      stack="stacked"
      series={[
        { key: "inbound", label: "Inbound" },
        { key: "outbound", label: "Outbound" },
        { key: "partner", label: "Partner" },
      ]}
    />
  )
}
