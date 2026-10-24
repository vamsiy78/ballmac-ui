"use client"

import { AgentQueue } from "@/components/ballmac/agent-queue"

export default function AgentQueueEmpty() {
  return (
    <div className="w-full max-w-2xl">
      <AgentQueue slots={2} tasks={[{ id: "r1", title: "Summarise yesterday's tickets", state: "running", progress: 82, eta: "about 1 min", agent: "Support agent" }]} />
    </div>
  )
}
