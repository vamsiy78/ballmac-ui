"use client"

import { Event1 } from "@/components/ballmac/blocks/event-1/event-1"

export default function Event1Saved() {
  // s2 (10:00 to 10:45) and s3 (10:15 to 11:00) overlap, so the page warns.
  return <Event1 defaultSaved={["s1", "s2", "s3", "s5"]} />
}
