"use client"

import { Agent9 } from "@/components/ballmac/blocks/agent-9/agent-9"

export default function Agent9Free() {
  return <Agent9 config={{ autonomy: "auto", perRun: 10, perDay: 50, tools: ["search", "docs", "mail", "calendar"], maxSteps: 60 }} />
}
