"use client"

import { Webhooks1 } from "@/components/ballmac/blocks/webhooks-1/webhooks-1"

export default function Webhooks1Demo() {
  return <Webhooks1 onResend={() => new Promise((r) => setTimeout(r, 700))} />
}
