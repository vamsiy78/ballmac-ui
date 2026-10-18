"use client"

import { ChartArea } from "@/components/ballmac/chart-area"

const data = [
  { hour: "00:00", jobs: 12 },
  { hour: "04:00", jobs: 8 },
  { hour: "08:00", jobs: 46 },
  { hour: "10:00", jobs: 78 },
  { hour: "12:00", jobs: 54 },
  { hour: "14:00", jobs: 91 },
  { hour: "16:00", jobs: 63 },
  { hour: "18:00", jobs: 29 },
  { hour: "22:00", jobs: 14 },
]

export default function ChartAreaStep() {
  return (
    <ChartArea
      className="w-full max-w-2xl"
      title="Queue depth"
      description="Jobs waiting, sampled through the day"
      data={data}
      xKey="hour"
      categoryLabel="Time"
      curve="step"
      series={[{ key: "jobs", label: "Jobs waiting" }]}
      tooltip="dot"
    />
  )
}
