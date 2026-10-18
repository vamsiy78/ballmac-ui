"use client"

import { ChartLine } from "@/components/ballmac/chart-line"

const data = [
  { hour: "00", nyc: 82, fra: 71, sin: 164, gru: 142, syd: 188 },
  { hour: "04", nyc: 79, fra: 69, sin: 158, gru: 139, syd: 181 },
  { hour: "08", nyc: 96, fra: 88, sin: 171, gru: 151, syd: 196 },
  { hour: "12", nyc: 118, fra: 104, sin: 182, gru: 163, syd: 204 },
  { hour: "16", nyc: 124, fra: 112, sin: 176, gru: 158, syd: 199 },
  { hour: "20", nyc: 101, fra: 93, sin: 168, gru: 147, syd: 190 },
]

export default function ChartLineCompare() {
  return (
    <ChartLine
      className="w-full max-w-2xl"
      title="Latency by region"
      description="Milliseconds. Turn series off in the legend, or switch Patterns on"
      data={data}
      xKey="hour"
      categoryLabel="Hour (UTC)"
      patterns="toggle"
      series={[
        { key: "nyc", label: "New York" },
        { key: "fra", label: "Frankfurt" },
        { key: "sin", label: "Singapore" },
        { key: "gru", label: "São Paulo" },
        { key: "syd", label: "Sydney" },
      ]}
      valueFormatter={(v) => `${v} ms`}
    />
  )
}
