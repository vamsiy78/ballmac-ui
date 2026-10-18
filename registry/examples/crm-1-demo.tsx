"use client"

import { Crm1 } from "@/components/ballmac/blocks/crm-1/crm-1"

export default function Crm1Demo() {
  return <Crm1 onLog={() => new Promise((r) => setTimeout(r, 500))} />
}
