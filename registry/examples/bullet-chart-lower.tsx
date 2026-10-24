"use client"

import { BulletChart } from "@/components/ballmac/bullet-chart"

export default function BulletChartLower() {
  return (
    <div className="w-full max-w-xl">
      <BulletChart
        format={(v) => `${v} ms`}
        items={[
          { id: "p50", label: "Median response time", note: "Lower is better", value: 142, target: 200, lowerIsBetter: true, ranges: [120, 220], max: 400 },
          { id: "p95", label: "95th percentile", note: "Lower is better", value: 480, target: 400, lowerIsBetter: true, ranges: [300, 500], max: 800 },
          { id: "p99", label: "99th percentile", note: "Lower is better", value: 1250, target: 900, lowerIsBetter: true, ranges: [700, 1100], max: 1600 },
        ]}
      />
    </div>
  )
}