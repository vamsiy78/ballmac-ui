"use client"

import { Roster1 } from "@/components/ballmac/blocks/roster-1/roster-1"

export default function Roster1Demo() {
  return <Roster1 onPublish={() => new Promise((r) => setTimeout(r, 700))} />
}
