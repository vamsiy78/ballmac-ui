"use client"

import * as React from "react"

import { FunnelChart } from "@/components/ballmac/funnel-chart"

const steps = [
  { id: "visit", label: "Visited the site", value: 48200, hint: "Unique visitors" },
  { id: "pricing", label: "Viewed pricing", value: 19800, hint: "Opened /pricing" },
  { id: "start", label: "Started checkout", value: 4120 },
  { id: "pay", label: "Paid", value: 1385, hint: "Completed payment" },
]

export default function FunnelChartDemo() {
  const [sel, setSel] = React.useState<string | null>(null)
  return (
    <div className="w-full max-w-xl">
      <FunnelChart title="Visit to purchase, last 30 days" steps={steps} selected={sel} onSelect={setSel} />
    </div>
  )
}
