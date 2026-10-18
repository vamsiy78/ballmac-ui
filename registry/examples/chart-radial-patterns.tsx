"use client"

import { ChartRadial } from "@/components/ballmac/chart-radial"

const data = [
  { name: "docs", label: "Docs", value: 92 },
  { name: "tests", label: "Tests", value: 74 },
  { name: "types", label: "Types", value: 58 },
]

export default function ChartRadialPatterns() {
  return <ChartRadial className="w-full max-w-sm" title="Coverage" description="Switch Patterns on to tell the rings apart without color" data={data} patterns="toggle" centerLabel={false} valueFormatter={(v) => `${v}%`} categoryLabel="Area" valueLabel="covered" />
}
