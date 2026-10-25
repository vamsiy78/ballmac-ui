"use client"

import { Gauge } from "@/components/ballmac/gauge"

export default function GaugeDemo() {
  return (
    <div className="grid w-full max-w-3xl gap-8 sm:grid-cols-3">
      <Gauge label="Error budget left" value={72} format={(v) => `${v}%`} zones={[{ to: 25, label: "At risk" }, { to: 60, label: "Watch it" }, { to: 100, label: "Healthy" }]} target={50} description="Resets on the 1st" />
      <Gauge label="CPU load" value={91} format={(v) => `${v}%`} zones={[{ to: 60, label: "Healthy" }, { to: 85, label: "Watch it" }, { to: 100, label: "At risk" }]} />
      <Gauge label="Quota used" value={34} format={(v) => `${v}%`} />
    </div>
  )
}
