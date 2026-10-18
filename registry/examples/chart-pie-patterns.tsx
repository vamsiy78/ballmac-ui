"use client"

import { ChartPie } from "@/components/ballmac/chart-pie"

const data = [
  { name: "chrome", label: "Chrome", value: 8420 },
  { name: "safari", label: "Safari", value: 5130 },
  { name: "firefox", label: "Firefox", value: 1980 },
  { name: "edge", label: "Edge", value: 1610 },
  { name: "other", label: "Other", value: 640 },
]

export default function ChartPiePatterns() {
  return <ChartPie className="w-full max-w-md" title="Browsers" description="Switch Patterns on to read the slices without color" data={data} patterns="toggle" valueLabel="visitors" categoryLabel="Browser" />
}
