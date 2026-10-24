"use client"

import { Agent15 } from "@/components/ballmac/blocks/agent-15/agent-15"

export default function Agent15Fresh() {
  return <Agent15 draft={{ text: "Thanks for waiting.", suggestions: [{ id: "1", find: "Thanks for waiting", replace: "Thank you for your patience", reason: "Warmer.", kind: "tone" }] }} />
}
