"use client"

import { Cron1 } from "@/components/ballmac/blocks/cron-1/cron-1"

export default function Cron1Demo() {
  return <Cron1 onToggle={() => new Promise((r) => setTimeout(r, 400))} onRunNow={() => new Promise((r) => setTimeout(r, 400))} />
}
