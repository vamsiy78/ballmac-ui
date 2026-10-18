"use client"

import { ChartBar } from "@/components/ballmac/chart-bar"

const data = [
  { region: "Americas", free: 5200, pro: 3100, team: 1200 },
  { region: "Europe", free: 4100, pro: 3600, team: 1700 },
  { region: "Asia", free: 6300, pro: 2200, team: 800 },
  { region: "Africa", free: 1900, pro: 700, team: 210 },
]

export default function ChartBarExpanded() {
  return (
    <ChartBar
      className="w-full max-w-2xl"
      title="Plan mix by region"
      description="Share of accounts on each plan"
      data={data}
      xKey="region"
      categoryLabel="Region"
      layout="bars"
      stack="expanded"
      aspect="wide"
      series={[
        { key: "free", label: "Free" },
        { key: "pro", label: "Pro" },
        { key: "team", label: "Team" },
      ]}
    />
  )
}
