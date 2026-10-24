"use client"

import { Capacity1 } from "@/components/ballmac/blocks/capacity-1/capacity-1"

export default function Capacity1Demo() {
  return <Capacity1 onRequest={() => new Promise((r) => setTimeout(r, 500))} />
}
