"use client"

import { Runbook1 } from "@/components/ballmac/blocks/runbook-1/runbook-1"

export default function Runbook1Demo() {
  return <Runbook1 defaultDone={["s1"]} onStepChange={() => new Promise((r) => setTimeout(r, 200))} onComplete={() => new Promise((r) => setTimeout(r, 400))} />
}
