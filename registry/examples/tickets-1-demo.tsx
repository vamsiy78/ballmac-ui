"use client"

import { Tickets1 } from "@/components/ballmac/blocks/tickets-1/tickets-1"

export default function Tickets1Demo() {
  return <Tickets1 onSend={() => new Promise((r) => setTimeout(r, 700))} />
}
