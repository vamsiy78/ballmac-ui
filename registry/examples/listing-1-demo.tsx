"use client"

import { Listing1 } from "@/components/ballmac/blocks/listing-1/listing-1"

export default function Listing1Demo() {
  return <Listing1 onRequestViewing={() => new Promise((r) => setTimeout(r, 600))} />
}
