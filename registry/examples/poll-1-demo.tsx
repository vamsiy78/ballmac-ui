"use client"

import { Poll1 } from "@/components/ballmac/blocks/poll-1/poll-1"

export default function Poll1Demo() {
  return <Poll1 onVote={() => new Promise((r) => setTimeout(r, 600))} />
}
