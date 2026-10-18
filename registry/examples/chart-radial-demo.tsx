"use client"

import { ChartRadial } from "@/components/ballmac/chart-radial"

const data = [{ name: "goal", label: "of the Q4 goal", value: 72 }]

export default function ChartRadialDemo() {
  return <ChartRadial className="w-full max-w-sm" title="Quarterly goal" description="Revenue target, $400k" data={data} valueFormatter={(v) => `${v}%`} categoryLabel="Goal" valueLabel="done" />
}
