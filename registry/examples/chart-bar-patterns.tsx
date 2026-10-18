"use client"

import { ChartBar } from "@/components/ballmac/chart-bar"

const data = [
  { city: "Lisbon", signed: 128, pending: 64, lost: 22 },
  { city: "Berlin", signed: 172, pending: 81, lost: 31 },
  { city: "Toronto", signed: 144, pending: 58, lost: 27 },
  { city: "Osaka", signed: 96, pending: 49, lost: 18 },
]

export default function ChartBarPatterns() {
  return (
    <ChartBar
      className="w-full max-w-2xl"
      title="Contracts by city"
      description="Switch Patterns on: each series gets its own texture as well as its color"
      data={data}
      xKey="city"
      categoryLabel="City"
      patterns="toggle"
      series={[
        { key: "signed", label: "Signed" },
        { key: "pending", label: "Pending" },
        { key: "lost", label: "Lost" },
      ]}
    />
  )
}
