"use client"

import { ChartPie } from "@/components/ballmac/chart-pie"

const data = [
  { name: "done", label: "Done", value: 72, color: "var(--chart-2)" },
  { name: "left", label: "Left", value: 28, color: "var(--muted)" },
]

export default function ChartPieCenter() {
  return (
    <ChartPie
      className="w-full max-w-sm"
      title="Quarterly goal"
      description="Revenue target"
      data={data}
      centerLabel={{ value: "72%", label: "of $400k" }}
      legend="static"
      tooltip={false}
      valueFormatter={(v) => `${v}%`}
      categoryLabel="Status"
    />
  )
}
