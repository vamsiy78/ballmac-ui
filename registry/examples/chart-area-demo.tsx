"use client"

import { ChartArea } from "@/components/ballmac/chart-area"

const data = [
  { month: "Jan", desktop: 4210, mobile: 2480 },
  { month: "Feb", desktop: 4860, mobile: 3120 },
  { month: "Mar", desktop: 4540, mobile: 3790 },
  { month: "Apr", desktop: 5320, mobile: 4650 },
  { month: "May", desktop: 5910, mobile: 5230 },
  { month: "Jun", desktop: 6480, mobile: 6140 },
]

export default function ChartAreaDemo() {
  return (
    <ChartArea
      className="w-full max-w-2xl"
      title="Visitors"
      description="Desktop and mobile, January to June"
      data={data}
      xKey="month"
      categoryLabel="Month"
      series={[
        { key: "desktop", label: "Desktop" },
        { key: "mobile", label: "Mobile" },
      ]}
    />
  )
}
