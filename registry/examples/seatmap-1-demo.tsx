"use client"

import { Seatmap1 } from "@/components/ballmac/blocks/seatmap-1/seatmap-1"

export default function Seatmap1Demo() {
  return <Seatmap1 onContinue={() => new Promise((r) => setTimeout(r, 700))} />
}
