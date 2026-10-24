"use client"

import { Alerts1 } from "@/components/ballmac/blocks/alerts-1/alerts-1"

export default function Alerts1Demo() {
  return <Alerts1 onToggle={() => new Promise((r) => setTimeout(r, 300))} onMute={() => new Promise((r) => setTimeout(r, 300))} onTest={() => new Promise((r) => setTimeout(r, 400))} />
}
