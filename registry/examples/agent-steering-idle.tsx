"use client"

import { AgentSteering } from "@/components/ballmac/agent-steering"

export default function AgentSteeringIdle() {
  return (
    <div className="w-full max-w-xl">
      <AgentSteering
        running={false}
        notes={[
          { id: "1", text: "Skip the competitor pages.", mode: "now", state: "applied", at: "2:10 pm" },
          { id: "2", text: "Write it as a table.", mode: "end", state: "dropped", at: "2:14 pm" },
        ]}
      />
    </div>
  )
}
