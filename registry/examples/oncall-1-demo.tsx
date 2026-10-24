"use client"

import { Oncall1 } from "@/components/ballmac/blocks/oncall-1/oncall-1"

export default function Oncall1Demo() {
  return <Oncall1 onTake={() => new Promise((r) => setTimeout(r, 400))} onRequestSwap={() => new Promise((r) => setTimeout(r, 400))} />
}
