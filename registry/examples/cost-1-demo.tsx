"use client"

import { Cost1 } from "@/components/ballmac/blocks/cost-1/cost-1"

export default function Cost1Demo() {
  return <Cost1 onAcknowledge={() => new Promise((r) => setTimeout(r, 400))} />
}
