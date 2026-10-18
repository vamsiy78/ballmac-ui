"use client"

import { ChartRadial } from "@/components/ballmac/chart-radial"

const data = [
  { name: "move", label: "Move", value: 84 },
  { name: "exercise", label: "Exercise", value: 62 },
  { name: "stand", label: "Stand", value: 41 },
]

export default function ChartRadialRings() {
  return <ChartRadial className="w-full max-w-sm" title="Today's rings" description="Percent of each daily goal" data={data} centerLabel={false} valueFormatter={(v) => `${v}%`} categoryLabel="Ring" valueLabel="done" />
}
