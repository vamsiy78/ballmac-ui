"use client"

import { Goals1 } from "@/components/ballmac/blocks/goals-1/goals-1"

export default function Goals1Demo() {
  return <Goals1 onUpdate={() => new Promise((r) => setTimeout(r, 500))} />
}
