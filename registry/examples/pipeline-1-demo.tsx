"use client"

import { Pipeline1 } from "@/components/ballmac/blocks/pipeline-1/pipeline-1"

export default function Pipeline1Demo() {
  return <Pipeline1 defaultOpenId="staging" onApprove={() => new Promise((r) => setTimeout(r, 500))} />
}
