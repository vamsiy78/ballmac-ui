"use client"

import { Flags1 } from "@/components/ballmac/blocks/flags-1/flags-1"

export default function Flags1Demo() {
  return <Flags1 onChange={() => new Promise((r) => setTimeout(r, 500))} />
}
