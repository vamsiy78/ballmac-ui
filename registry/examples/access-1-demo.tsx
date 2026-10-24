"use client"

import { Access1 } from "@/components/ballmac/blocks/access-1/access-1"

export default function Access1Demo() {
  return <Access1 due="Due 31 Oct" onSubmit={() => new Promise((r) => setTimeout(r, 500))} />
}
