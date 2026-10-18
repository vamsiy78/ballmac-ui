"use client"

import { Area, AreaChart } from "recharts"

import { ChartFrame } from "@/components/ballmac/chart-frame"

export default function ChartFrameEmpty() {
  return (
    <ChartFrame
      className="w-full max-w-2xl"
      title="Response time"
      description="Milliseconds, per week"
      data={[]}
      xKey="week"
      series={[{ key: "p50", label: "Median" }]}
      state="empty"
      emptyState={{ title: "No requests yet", description: "Response times appear after the first request." }}
    >
      {() => (
        <AreaChart data={[]}>
          <Area dataKey="p50" />
        </AreaChart>
      )}
    </ChartFrame>
  )
}
