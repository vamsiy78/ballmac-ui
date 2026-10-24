"use client"

import { WaterfallChart } from "@/components/ballmac/waterfall-chart"

export default function WaterfallChartDemo() {
  return (
    <div className="w-full max-w-3xl">
      <WaterfallChart
        title="Monthly recurring revenue, September to October"
        format={(v) => `$${(v / 1000).toFixed(1)}k`}
        steps={[
          { id: "start", label: "September", value: 82400, kind: "total" },
          { id: "new", label: "New customers", value: 9600 },
          { id: "exp", label: "Upgrades", value: 4100 },
          { id: "down", label: "Downgrades", value: -2300 },
          { id: "churn", label: "Cancelled", value: -5200 },
          { id: "end", label: "October", value: 88600, kind: "total" },
        ]}
      />
    </div>
  )
}