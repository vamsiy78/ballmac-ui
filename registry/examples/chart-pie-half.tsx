"use client"

import { ChartPie } from "@/components/ballmac/chart-pie"

const data = [
  { name: "used", label: "Used", value: 7420, color: "var(--chart-1)" },
  { name: "reserved", label: "Reserved", value: 1580, color: "var(--chart-3)" },
  { name: "free", label: "Free", value: 1000, color: "var(--muted)" },
]

export default function ChartPieHalf() {
  return <ChartPie className="w-full max-w-md" title="Storage" description="10 GB plan" data={data} half valueLabel="MB" valueFormatter={(v) => `${v.toLocaleString("en-US")}`} legend="static" categoryLabel="Kind" />
}
