"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { ChartTooltip, ChartTooltipContent } from "@/components/ballmac/chart"
import { ChartFrame } from "@/components/ballmac/chart-frame"

const data = [
  { week: "W1", p50: 118, p95: 242 },
  { week: "W2", p50: 121, p95: 251 },
  { week: "W3", p50: 109, p95: 228 },
  { week: "W4", p50: 104, p95: 214 },
  { week: "W5", p50: 112, p95: 236 },
  { week: "W6", p50: 98, p95: 205 },
]

const series = [
  { key: "p50", label: "Median" },
  { key: "p95", label: "95th percentile" },
]

export default function ChartFrameDemo() {
  return (
    <ChartFrame className="w-full max-w-2xl" title="Response time" description="Milliseconds, per week" data={data} xKey="week" categoryLabel="Week" series={series} valueFormatter={(v) => `${v} ms`}>
      {(chart) => (
        <LineChart data={data} margin={chart.margin({ top: 8, right: 8, left: 0 })} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} reversed={chart.rtl} />
          <YAxis width="auto" tickLine={false} axisLine={false} tickMargin={8} orientation={chart.rtl ? "right" : "left"} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          {series.map((s) => (
            <Line key={s.key} dataKey={s.key} type="monotone" stroke={chart.color(s.key)} strokeWidth={2} dot={false} hide={chart.isHidden(s.key)} isAnimationActive={chart.animate} />
          ))}
        </LineChart>
      )}
    </ChartFrame>
  )
}
