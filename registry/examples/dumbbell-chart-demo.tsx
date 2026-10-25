"use client"

import { DumbbellChart } from "@/components/ballmac/dumbbell-chart"

const rows = [
  { id: "1", label: "Refund questions", before: 71, after: 86 },
  { id: "2", label: "Order status", before: 92, after: 94 },
  { id: "3", label: "Account access", before: 88, after: 81 },
  { id: "4", label: "Billing disputes", before: 54, after: 69 },
  { id: "5", label: "Product advice", before: 63, after: 63 },
]

export default function DumbbellChartDemo() {
  return (
    <div className="w-full max-w-2xl">
      <DumbbellChart title="Answers rated helpful, by topic" rows={rows} beforeLabel="Prompt v14" afterLabel="Prompt v15" format={(v) => `${v}%`} />
    </div>
  )
}
