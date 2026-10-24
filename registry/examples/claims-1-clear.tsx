"use client"

import { Claims1 } from "@/components/ballmac/blocks/claims-1/claims-1"

export default function Claims1Clear() {
  return <Claims1 claims={[{ id: "c", number: "CLM-1", title: "Cracked windscreen", stage: "Assessed", amount: 380, updated: "Today" }]} />
}
