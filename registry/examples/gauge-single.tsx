"use client"

import { Gauge } from "@/components/ballmac/gauge"

export default function GaugeSingle() {
  return (
    <div className="w-full max-w-xs">
      <Gauge label="Customer satisfaction" value={4.3} min={0} max={5} format={(v) => v.toFixed(1)} zones={[{ to: 2.5, label: "Poor" }, { to: 4, label: "Good" }, { to: 5, label: "Excellent" }]} target={4.5} />
    </div>
  )
}
