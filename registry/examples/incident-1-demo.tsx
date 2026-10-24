"use client"

import { Incident1 } from "@/components/ballmac/blocks/incident-1/incident-1"

export default function Incident1Demo() {
  return <Incident1 onPostUpdate={() => new Promise((r) => setTimeout(r, 400))} onResolve={() => new Promise((r) => setTimeout(r, 400))} />
}
