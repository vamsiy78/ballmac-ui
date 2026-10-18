"use client"

import { ChartScatter } from "@/components/ballmac/chart-scatter"

const data = [
  { name: "Aero", price: 29, rating: 3.9 },
  { name: "Brio", price: 39, rating: 4.1 },
  { name: "Cove", price: 45, rating: 4.4 },
  { name: "Dune", price: 52, rating: 4.2 },
  { name: "Echo", price: 58, rating: 4.6 },
  { name: "Flux", price: 64, rating: 4.5 },
  { name: "Glow", price: 71, rating: 4.8 },
  { name: "Hive", price: 79, rating: 4.7 },
  { name: "Iris", price: 88, rating: 4.9 },
  { name: "Jolt", price: 95, rating: 4.3 },
]

export default function ChartScatterDemo() {
  return (
    <ChartScatter
      className="w-full max-w-2xl"
      title="Price and rating"
      description="Ten headphones"
      data={data}
      xKey="price"
      yKey="rating"
      nameKey="name"
      xLabel="Price"
      yLabel="Rating"
      xFormatter={(v) => `$${v}`}
      yDomain={[3.5, 5]}
      categoryLabel="Model"
    />
  )
}
