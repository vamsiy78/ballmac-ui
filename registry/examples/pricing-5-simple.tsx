"use client"

import { Pricing5 } from "@/components/ballmac/blocks/pricing-5/pricing-5"

export default function Pricing5Simple() {
  return <Pricing5 tiers={[{ upTo: 25, perSeat: 9 }, { upTo: Infinity, perSeat: 7 }]} addons={[]} max={100} salesFrom={500} />
}
