"use client"

import { Deploys1 } from "@/components/ballmac/blocks/deploys-1/deploys-1"

export default function Deploys1Demo() {
  return <Deploys1 onRollback={() => new Promise((r) => setTimeout(r, 600))} />
}
