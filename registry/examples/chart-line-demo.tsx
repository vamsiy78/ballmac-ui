"use client"

import { ChartLine } from "@/components/ballmac/chart-line"

const data = [
  { month: "Jan", active: 8420, trial: 2110 },
  { month: "Feb", active: 9130, trial: 2540 },
  { month: "Mar", active: 9780, trial: 2380 },
  { month: "Apr", active: 10940, trial: 2960 },
  { month: "May", active: 12210, trial: 3320 },
  { month: "Jun", active: 13650, trial: 3710 },
]

export default function ChartLineDemo() {
  return (
    <ChartLine
      className="w-full max-w-2xl"
      title="Accounts"
      description="Active and trial, January to June"
      data={data}
      xKey="month"
      categoryLabel="Month"
      series={[
        { key: "active", label: "Active" },
        { key: "trial", label: "Trial", color: "var(--chart-3)" },
      ]}
    />
  )
}
