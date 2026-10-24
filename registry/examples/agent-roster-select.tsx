"use client"

import * as React from "react"

import { AgentRoster, type RosterAgent } from "@/components/ballmac/agent-roster"

const agents: RosterAgent[] = [
  { id: "a", name: "Billing agent", role: "Answers billing questions", status: "working", task: "Replying to 3 tickets.", load: 54, lastActive: "just now" },
  { id: "b", name: "Onboarding agent", role: "Guides new accounts", status: "idle", task: "Sent 12 welcome emails today.", load: 6, lastActive: "4 min ago" },
  { id: "c", name: "Refund agent", role: "Handles refund requests", status: "blocked", task: "One request is over its limit and needs a person.", load: 0, lastActive: "11 min ago" },
]

export default function AgentRosterSelect() {
  const [picked, setPicked] = React.useState<string | null>(null)
  const agent = agents.find((a) => a.id === picked)
  return (
    <div className="grid w-full max-w-3xl gap-4">
      <AgentRoster agents={agents} selected={picked} onSelectedChange={setPicked} />
      <p aria-live="polite" className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
        {agent ? <>Opening the run for <strong className="text-foreground">{agent.name}</strong>.</> : "Pick an agent to open its run."}
      </p>
    </div>
  )
}
