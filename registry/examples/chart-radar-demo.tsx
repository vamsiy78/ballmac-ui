"use client"

import { ChartRadar } from "@/components/ballmac/chart-radar"

const data = [
  { skill: "Design", level: 86 },
  { skill: "Frontend", level: 94 },
  { skill: "Backend", level: 72 },
  { skill: "Data", level: 61 },
  { skill: "Writing", level: 78 },
  { skill: "Research", level: 83 },
]

export default function ChartRadarDemo() {
  return <ChartRadar className="w-full max-w-md" title="Team skills" description="Self-rated, 0 to 100" data={data} xKey="skill" categoryLabel="Skill" series={[{ key: "level", label: "Level" }]} domain={[0, 100]} />
}
