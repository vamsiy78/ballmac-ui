"use client"

import { AgentTree, type AgentNode } from "@/components/ballmac/agent-tree"

const agents: AgentNode[] = [
  { id: "orch", name: "Release agent", model: "Opus 5.5", status: "running", task: "Prepare and ship version 2.4.", cost: 0.21 },
  { id: "tests", parentId: "orch", name: "Test runner", model: "Haiku 5.5", status: "done", task: "Run the unit and end-to-end suites.", cost: 0.04, duration: "4 min 10 s" },
  { id: "notes", parentId: "orch", name: "Release notes", model: "Sonnet 5.5", status: "done", task: "Write the changelog from merged pull requests.", cost: 0.06, duration: "55 s" },
  { id: "deploy", parentId: "orch", name: "Deployer", model: "Sonnet 5.5", status: "failed", task: "Deploy to staging and check the health endpoint.", cost: 0.02, duration: "1 min 9 s" },
  { id: "d1", parentId: "deploy", name: "Health check", model: "Haiku 5.5", status: "failed", task: "GET /healthz returned 503 three times.", cost: 0.004 },
]

export default function AgentTreeFailed() {
  return (
    <div className="w-full max-w-3xl">
      <AgentTree agents={agents} title="Release 2.4" defaultSelected="d1" />
    </div>
  )
}
