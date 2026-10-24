"use client"

import { Capacity1 } from "@/components/ballmac/blocks/capacity-1/capacity-1"

export default function Capacity1Calm() {
  return <Capacity1 resources={[{ id: "a", name: "Object storage", unit: "TB", used: 4.1, limit: 40, perDay: 0.03 }, { id: "b", name: "Log retention", unit: "GB", used: 900, limit: 5000, perDay: 0 }]} />
}
