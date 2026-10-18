"use client"

import { ChartArea } from "@/components/ballmac/chart-area"

const data = [
  { month: "May", uptime: 99.91 },
  { month: "Jun", uptime: 99.97 },
  { month: "Jul", uptime: 99.82 },
  { month: "Aug", uptime: 99.99 },
  { month: "Sep", uptime: 99.95 },
  { month: "Oct", uptime: 99.98 },
]

export default function ChartAreaTarget() {
  return (
    <ChartArea
      className="w-full max-w-2xl"
      title="Uptime"
      description="Monthly, against the 99.9% target"
      data={data}
      xKey="month"
      categoryLabel="Month"
      series={[{ key: "uptime", label: "Uptime", color: "var(--chart-2)" }]}
      yDomain={[99.7, 100]}
      yFormatter={(v) => `${v}%`}
      valueFormatter={(v) => `${v}%`}
      referenceLines={[{ y: 99.9, label: "Target 99.9%" }]}
      footer="Above target in five of six months."
    />
  )
}
