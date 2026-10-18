"use client"

import * as React from "react"

import { ChartArea } from "@/components/ballmac/chart-area"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"

// 90 days of sample data, worked out from the day number so the server and the browser agree.
const start = Date.UTC(2026, 6, 1)
const data = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(start + i * 86_400_000)
  const weekend = [0, 6].includes(date.getUTCDay())
  return {
    date: date.toISOString().slice(0, 10),
    desktop: Math.round(380 + i * 3.4 + Math.sin(i / 3) * 46 - (weekend ? 90 : 0)),
    mobile: Math.round(260 + i * 4.1 + Math.cos(i / 4) * 38 + (weekend ? 70 : 0)),
  }
})

const label = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

export default function ChartAreaInteractive() {
  const [range, setRange] = React.useState("90")
  const shown = data.slice(-Number(range))
  return (
    <ChartArea
      className="w-full max-w-3xl"
      title="Visitors"
      description={`The last ${range} days`}
      data={shown}
      xKey="date"
      categoryFormatter={(v) => label.format(new Date(`${v}T00:00:00Z`))}
      series={[
        { key: "desktop", label: "Desktop" },
        { key: "mobile", label: "Mobile" },
      ]}
      aspect="wide"
      actions={
        <SegmentedControl size="sm" aria-label="Range" value={range} onValueChange={setRange}>
          <SegmentedControlItem value="90">90 days</SegmentedControlItem>
          <SegmentedControlItem value="30">30 days</SegmentedControlItem>
          <SegmentedControlItem value="7">7 days</SegmentedControlItem>
        </SegmentedControl>
      }
    />
  )
}
