"use client"

import { Agent7 } from "@/components/ballmac/blocks/agent-7/agent-7"

/** A new agent: named, but with no tools and no knowledge turned on yet. */
export default function Agent7Bare() {
  return (
    <Agent7
      defaultConfig={{ name: "Research helper", instructions: "Find and summarize what the team has written about a topic.", model: "lyra-mini", tools: {}, sources: [], askBeforeExternal: true, maxSteps: 6 }}
    />
  )
}
