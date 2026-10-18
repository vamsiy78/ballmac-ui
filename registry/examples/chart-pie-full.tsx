"use client"

import { ChartPie } from "@/components/ballmac/chart-pie"

const data = [
  { name: "paid", label: "Paid", value: 52 },
  { name: "trial", label: "Trial", value: 31 },
  { name: "free", label: "Free", value: 17 },
]

export default function ChartPieFull() {
  return <ChartPie className="w-full max-w-md" title="Accounts by plan" description="Percent of all accounts" data={data} donut={false} labels="outside" gap={false} valueFormatter={(v) => `${v}%`} categoryLabel="Plan" />
}
