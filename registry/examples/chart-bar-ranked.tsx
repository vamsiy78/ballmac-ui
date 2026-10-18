"use client"

import { ChartBar } from "@/components/ballmac/chart-bar"

const data = [
  { rep: "Maya Jensen", closed: 412000 },
  { rep: "Tomás Rivera", closed: 368000 },
  { rep: "Aiko Tanaka", closed: 331000 },
  { rep: "Priya Nair", closed: 296000 },
  { rep: "Liam O'Connor", closed: 244000 },
  { rep: "Sofia Alvarez", closed: 198000 },
]

export default function ChartBarRanked() {
  return (
    <ChartBar
      className="w-full max-w-2xl"
      title="Closed deals"
      description="This quarter, by rep"
      data={data}
      xKey="rep"
      categoryLabel="Rep"
      layout="bars"
      sort="descending"
      labels
      valueAxis={false}
      grid="none"
      highlight="Maya Jensen"
      aspect="wide"
      series={[{ key: "closed", label: "Closed" }]}
      valueFormatter={(v) => `$${Math.round(v / 1000)}k`}
      radius={8}
    />
  )
}
