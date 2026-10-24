"use client"

import { BulletChart } from "@/components/ballmac/bullet-chart"

export default function BulletChartDemo() {
  return (
    <div className="w-full max-w-xl">
      <BulletChart
        items={[
          { id: "rev", label: "Revenue", note: "Quarter to date", value: 268, target: 300, ranges: [150, 250], max: 350 },
          { id: "new", label: "New customers", note: "Target is 120", value: 131, target: 120, ranges: [60, 100], max: 160 },
          { id: "nps", label: "Net promoter score", note: "Last 90 days", value: 41, target: 50, ranges: [20, 40], max: 70 },
          { id: "ret", label: "90-day retention", note: "As a percentage", value: 78, target: 85, ranges: [60, 80], max: 100 },
        ]}
      />
    </div>
  )
}