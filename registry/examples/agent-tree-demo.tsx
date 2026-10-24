"use client"

import { AgentTree, type AgentNode } from "@/components/ballmac/agent-tree"

const agents: AgentNode[] = [
  { id: "orch", name: "Orchestrator", model: "Opus 5.5", status: "running", task: "Research the CRM market for a 10-person sales team and write a one-page brief.", cost: 0.12, tokens: 18400, duration: "3 min 12 s" },
  { id: "pricing", parentId: "orch", name: "Pricing researcher", model: "Sonnet 5.5", status: "running", task: "Collect current plan prices from six vendors.", cost: 0.09, tokens: 21300, duration: "2 min 40 s" },
  { id: "p1", parentId: "pricing", name: "Web search", model: "Haiku 5.5", status: "done", task: "Find each vendor's pricing page.", cost: 0.01, tokens: 3200, duration: "18 s" },
  { id: "p2", parentId: "pricing", name: "Page reader", model: "Haiku 5.5", status: "running", progress: 50, task: "Read the six pricing pages and pull out the plans.", cost: 0.03, tokens: 9800, duration: "1 min 20 s" },
  { id: "reviews", parentId: "orch", name: "Review analyst", model: "Sonnet 5.5", status: "running", task: "Summarise what customers say about setup and support.", progress: 65, cost: 0.07, tokens: 16100, duration: "2 min 5 s" },
  { id: "writer", parentId: "orch", name: "Brief writer", model: "Sonnet 5.5", status: "queued", task: "Write the brief once the research is in." },
  { id: "check", parentId: "orch", name: "Fact checker", model: "Opus 5.5", status: "waiting", task: "Check every price and claim against its source.", cost: 0.004 },
]

export default function AgentTreeDemo() {
  return (
    <div className="w-full max-w-3xl">
      <AgentTree agents={agents} title="Market research" defaultSelected="p2" />
    </div>
  )
}
