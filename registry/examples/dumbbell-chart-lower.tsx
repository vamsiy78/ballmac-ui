"use client"

import { DumbbellChart } from "@/components/ballmac/dumbbell-chart"

export default function DumbbellChartLower() {
  return (
    <div className="w-full max-w-2xl">
      <DumbbellChart title="Response time" lowerIsBetter beforeLabel="Last month" afterLabel="This month" format={(v) => `${v} ms`} rows={[{ id: "a", label: "Search", before: 420, after: 310 }, { id: "b", label: "Checkout", before: 280, after: 340 }, { id: "c", label: "Login", before: 190, after: 185 }]} />
    </div>
  )
}
