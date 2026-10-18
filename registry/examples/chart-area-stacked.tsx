"use client"

import { ChartArea } from "@/components/ballmac/chart-area"

const data = [
  { month: "Mar", team: 6200, pro: 9400 },
  { month: "Apr", team: 7100, pro: 10800 },
  { month: "May", team: 8300, pro: 11900 },
  { month: "Jun", team: 9800, pro: 12600 },
  { month: "Jul", team: 11200, pro: 14100 },
  { month: "Aug", team: 13600, pro: 15300 },
  { month: "Sep", team: 15900, pro: 16800 },
  { month: "Oct", team: 18400, pro: 18200 },
]

export default function ChartAreaStacked() {
  return (
    <ChartArea
      className="w-full max-w-2xl"
      title="Monthly recurring revenue"
      description="By plan, stacked"
      data={data}
      xKey="month"
      categoryLabel="Month"
      stack="stacked"
      fillMode="solid"
      curve="linear"
      series={[
        { key: "pro", label: "Pro" },
        { key: "team", label: "Team" },
      ]}
      valueFormatter={(v) => `$${v.toLocaleString("en-US")}`}
      yFormatter={(v) => `$${v / 1000}k`}
      footer="Team passed Pro in October."
    />
  )
}
