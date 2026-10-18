"use client"

import { Habits1 } from "@/components/ballmac/blocks/habits-1/habits-1"

export default function Habits1Demo() {
  return <Habits1 onToggle={() => new Promise((r) => setTimeout(r, 400))} />
}
