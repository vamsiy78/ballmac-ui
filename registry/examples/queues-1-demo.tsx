"use client"

import { Queues1 } from "@/components/ballmac/blocks/queues-1/queues-1"

export default function Queues1Demo() {
  return <Queues1 defaultOpenId="email" onPause={() => new Promise((r) => setTimeout(r, 400))} onRetryJobs={() => new Promise((r) => setTimeout(r, 400))} onDiscard={() => new Promise((r) => setTimeout(r, 400))} />
}
