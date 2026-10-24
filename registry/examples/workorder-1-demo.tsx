"use client"

import { Workorder1 } from "@/components/ballmac/blocks/workorder-1/workorder-1"

export default function Workorder1Demo() {
  return <Workorder1 onAdvance={() => new Promise((r) => setTimeout(r, 400))} onAddLine={() => new Promise((r) => setTimeout(r, 300))} onMessage={() => new Promise((r) => setTimeout(r, 400))} />
}
