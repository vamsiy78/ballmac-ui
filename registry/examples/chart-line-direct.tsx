"use client"

import { ChartLine } from "@/components/ballmac/chart-line"

const data = [
  { year: "2021", oslo: 41, lima: 33, pune: 27, reno: 22 },
  { year: "2022", oslo: 44, lima: 36, pune: 31, reno: 24 },
  { year: "2023", oslo: 47, lima: 42, pune: 38, reno: 25 },
  { year: "2024", oslo: 49, lima: 47, pune: 46, reno: 27 },
  { year: "2025", oslo: 52, lima: 51, pune: 55, reno: 28 },
]

export default function ChartLineDirect() {
  return (
    <ChartLine
      className="w-full max-w-2xl"
      title="Customers by office"
      description="Hundreds, labeled on the lines instead of in a legend"
      data={data}
      xKey="year"
      categoryLabel="Year"
      directLabels
      curve="monotone"
      series={[
        { key: "oslo", label: "Oslo" },
        { key: "lima", label: "Lima" },
        { key: "pune", label: "Pune" },
        { key: "reno", label: "Reno" },
      ]}
    />
  )
}
