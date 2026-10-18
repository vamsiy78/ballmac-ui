"use client"

import { Tickets1 } from "@/components/ballmac/blocks/tickets-1/tickets-1"

// Send fails every time, so typing a reply and sending shows Not sent with Retry.
export default function Tickets1Failed() {
  return <Tickets1 onSend={() => Promise.reject(new Error("offline"))} />
}
