"use client"

import { ChartLine } from "@/components/ballmac/chart-line"

const data = [
  { month: "Jul", actual: 21400, plan: 21000 },
  { month: "Aug", actual: 23800, plan: 23500 },
  { month: "Sep", actual: 26100, plan: 26000 },
  { month: "Oct", actual: 28900, plan: 28500 },
  { month: "Nov", actual: 30200, plan: 31000 },
  { month: "Dec", actual: 33600, plan: 33500 },
]

export default function ChartLineDashed() {
  return (
    <ChartLine
      className="w-full max-w-2xl"
      title="Revenue against plan"
      description="The dashed line is the plan"
      data={data}
      xKey="month"
      categoryLabel="Month"
      series={[
        { key: "actual", label: "Actual" },
        { key: "plan", label: "Plan", color: "var(--muted-foreground)" },
      ]}
      dashed={["plan"]}
      yFormatter={(v) => `$${v / 1000}k`}
      valueFormatter={(v) => `$${v.toLocaleString("en-US")}`}
    />
  )
}
