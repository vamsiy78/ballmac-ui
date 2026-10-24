import { AgentRoster, type RosterAgent } from "@/components/ballmac/agent-roster"

const agents: RosterAgent[] = [
  { id: "plan", name: "Planner", role: "Breaks down the task", status: "idle", task: "Finished the plan for the invoice export.", load: 4, lastActive: "2 min ago" },
  { id: "research", name: "Researcher", role: "Finds what exists", status: "working", task: "Reading the payment client to see where the failure surfaces.", load: 72, lastActive: "just now" },
  { id: "code", name: "Coder", role: "Writes the change", status: "working", task: "Editing the export view and four tests.", load: 88, lastActive: "just now" },
  { id: "review", name: "Reviewer", role: "Checks the result", status: "waiting", task: "Waiting for the coder to finish before reading the diff.", load: 0, lastActive: "1 min ago" },
  { id: "deploy", name: "Releaser", role: "Ships approved changes", status: "blocked", task: "Needs a person to approve the production deploy.", load: 0, lastActive: "6 min ago" },
  { id: "support", name: "Support triage", role: "Sorts new tickets", status: "offline", task: "Paused for the night.", lastActive: "8 h ago" },
]

export default function AgentRosterDemo() {
  return (
    <div className="w-full max-w-4xl">
      <AgentRoster agents={agents} defaultSelected="code" />
    </div>
  )
}
