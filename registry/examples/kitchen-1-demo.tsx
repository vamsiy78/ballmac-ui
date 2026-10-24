"use client"

import { Kitchen1 } from "@/components/ballmac/blocks/kitchen-1/kitchen-1"

export default function Kitchen1Demo() {
  return <Kitchen1 onBump={() => new Promise((r) => setTimeout(r, 300))} />
}
