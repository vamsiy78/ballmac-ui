import { AgentGraph } from "@/components/ballmac/agent-graph"

export default function AgentGraphReview() {
  return (
    <div className="w-full max-w-3xl">
      <AgentGraph
        nodes={[
          { id: "plan", label: "Planner", kind: "agent", status: "done" },
          { id: "code", label: "Coder", kind: "agent", status: "blocked", detail: "The tests keep failing on the same file." },
          { id: "review", label: "Reviewer", kind: "agent", status: "waiting" },
          { id: "you", label: "You", kind: "human", status: "waiting", detail: "Approval is needed before the change is merged." },
        ]}
        edges={[
          { from: "plan", to: "code", label: "plan" },
          { from: "code", to: "review", label: "diff", active: true },
          { from: "review", to: "code", label: "changes" },
          { from: "review", to: "you", label: "approve?" },
        ]}
      />
    </div>
  )
}
