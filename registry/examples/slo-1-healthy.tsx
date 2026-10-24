"use client"

import { Slo1 } from "@/components/ballmac/blocks/slo-1/slo-1"

export default function Slo1Healthy() {
  return <Slo1 slos={[{ id: "a", name: "Checkout availability", service: "Payments", target: 99.9, current: 99.99, windowDays: 30, burn: 0.1, series: [100, 99.99, 100, 100, 99.98, 100] }, { id: "b", name: "Search latency under 300 ms", service: "Search", target: 99.5, current: 99.9, windowDays: 30, burn: 0.2, series: [99.9, 99.8, 99.9, 99.9, 99.95, 99.9] }]} />
}
