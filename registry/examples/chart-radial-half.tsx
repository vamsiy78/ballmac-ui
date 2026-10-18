"use client"

import { ChartRadial } from "@/components/ballmac/chart-radial"

const data = [{ name: "cpu", label: "CPU load", value: 64, color: "var(--chart-4)" }]

export default function ChartRadialHalf() {
  return <ChartRadial className="w-full max-w-md" title="Server load" description="Now" data={data} half valueFormatter={(v) => `${v}%`} categoryLabel="Metric" valueLabel="used" />
}
