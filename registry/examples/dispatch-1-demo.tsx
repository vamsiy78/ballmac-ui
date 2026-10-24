"use client"

import { Dispatch1 } from "@/components/ballmac/blocks/dispatch-1/dispatch-1"

export default function Dispatch1Demo() {
  return <Dispatch1 onAssign={() => new Promise((r) => setTimeout(r, 400))} />
}
