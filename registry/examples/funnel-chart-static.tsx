"use client"

import { FunnelChart } from "@/components/ballmac/funnel-chart"

export default function FunnelChartStatic() {
  return (
    <div className="w-full max-w-md">
      <FunnelChart steps={[{ id: "a", label: "Invited", value: 200 }, { id: "b", label: "Signed up", value: 140 }, { id: "c", label: "Active", value: 126 }]} />
    </div>
  )
}
