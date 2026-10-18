"use client"

import { ChartBar } from "@/components/ballmac/chart-bar"

const data = [
  { page: "/pricing", views: 18420 },
  { page: "/docs/get-started/install", views: 15310 },
  { page: "/blocks", views: 12980 },
  { page: "/components/button", views: 9640 },
  { page: "/themes", views: 7220 },
  { page: "/changelog", views: 4150 },
]

export default function ChartBarHorizontal() {
  return (
    <ChartBar
      className="w-full max-w-2xl"
      title="Top pages"
      description="Views in the last 30 days"
      data={data}
      xKey="page"
      categoryLabel="Page"
      layout="bars"
      labels
      valueAxis={false}
      grid="none"
      sort="descending"
      series={[{ key: "views", label: "Views" }]}
      aspect="wide"
    />
  )
}
