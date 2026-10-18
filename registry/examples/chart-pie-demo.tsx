"use client"

import { ChartPie } from "@/components/ballmac/chart-pie"

const data = [
  { name: "search", label: "Search", value: 4210 },
  { name: "direct", label: "Direct", value: 2890 },
  { name: "social", label: "Social", value: 1630 },
  { name: "email", label: "Email", value: 980 },
]

export default function ChartPieDemo() {
  return <ChartPie className="w-full max-w-md" title="Visitors by source" description="Last 30 days" data={data} valueLabel="visitors" categoryLabel="Source" />
}
