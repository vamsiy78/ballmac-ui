"use client"

import { Area, AreaChart } from "recharts"

import { ChartFrame } from "@/components/ballmac/chart-frame"

export default function ChartFrameError() {
  return (
    <ChartFrame
      className="w-full max-w-2xl"
      title="Response time"
      description="Milliseconds, per week"
      data={[]}
      xKey="week"
      series={[{ key: "p50", label: "Median" }]}
      state="error"
      onRetry={() => {}}
      errorState={{ description: "The metrics service did not answer. Your data is safe." }}
    >
      {() => (
        <AreaChart data={[]}>
          <Area dataKey="p50" />
        </AreaChart>
      )}
    </ChartFrame>
  )
}
