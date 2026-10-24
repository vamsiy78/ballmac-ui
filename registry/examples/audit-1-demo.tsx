"use client"

import { Audit1 } from "@/components/ballmac/blocks/audit-1/audit-1"

export default function Audit1Demo() {
  return <Audit1 onExport={() => new Promise((r) => setTimeout(r, 400))} defaultOpenId="e5" />
}
