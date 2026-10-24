"use client"

import { Clinic1 } from "@/components/ballmac/blocks/clinic-1/clinic-1"

export default function Clinic1Demo() {
  return <Clinic1 onStatus={() => new Promise((r) => setTimeout(r, 400))} />
}
