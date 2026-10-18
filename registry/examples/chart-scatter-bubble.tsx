"use client"

import { ChartScatter } from "@/components/ballmac/chart-scatter"

const data = [
  { city: "Lagos", region: "africa", people: 15.4, growth: 3.2, gdp: 98 },
  { city: "Nairobi", region: "africa", people: 5.1, growth: 3.6, gdp: 32 },
  { city: "Cairo", region: "africa", people: 21.3, growth: 1.9, gdp: 160 },
  { city: "Mumbai", region: "asia", people: 21.7, growth: 1.1, gdp: 310 },
  { city: "Dhaka", region: "asia", people: 23.2, growth: 2.9, gdp: 140 },
  { city: "Jakarta", region: "asia", people: 11.2, growth: 1.4, gdp: 240 },
  { city: "Seoul", region: "asia", people: 9.9, growth: 0.1, gdp: 880 },
  { city: "Berlin", region: "europe", people: 3.7, growth: 0.4, gdp: 210 },
  { city: "Madrid", region: "europe", people: 6.7, growth: 0.5, gdp: 230 },
  { city: "Bogotá", region: "americas", people: 11.5, growth: 1.7, gdp: 130 },
  { city: "Toronto", region: "americas", people: 6.3, growth: 1.3, gdp: 410 },
]

export default function ChartScatterBubble() {
  return (
    <ChartScatter
      className="w-full max-w-2xl"
      title="Cities"
      description="Size shows economic output"
      data={data}
      xKey="people"
      yKey="growth"
      zKey="gdp"
      groupKey="region"
      nameKey="city"
      xLabel="People (millions)"
      yLabel="Growth (%)"
      zLabel="Output ($bn)"
      groups={[
        { key: "africa", label: "Africa" },
        { key: "asia", label: "Asia" },
        { key: "europe", label: "Europe" },
        { key: "americas", label: "Americas" },
      ]}
      categoryLabel="City"
    />
  )
}
