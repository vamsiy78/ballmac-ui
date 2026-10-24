import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-12",
  type: "registry:block",
  title: "Agent 12: mission control",
  description:
    "Mission control for a team of agents: spend, tokens, running agents and decisions waiting at the top, the delegation tree below, and an inbox of requests with Approve and Deny that report back honestly.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agents", "multi-agent", "orchestration", "approvals", "cost", "tree", "dashboard", "human in the loop"],
  files: [{ path: "components/blocks/agent-12/agent-12.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view", "agent-tree"],
  examples: [
    { name: "agent-12-demo", title: "Default", file: "agent-12-demo.tsx" },
    { name: "agent-12-clear", title: "Nothing waiting", file: "agent-12-clear.tsx" },
    { name: "agent-12-loading", title: "Loading", file: "agent-12-loading.tsx" },
    { name: "agent-12-empty", title: "No agents running", file: "agent-12-empty.tsx" },
    { name: "agent-12-error", title: "Could not load", file: "agent-12-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-12-loading", trigger: "state=\"loading\"", note: "Skeleton totals, tree and inbox under the real heading, announced as loading." },
    { id: "empty", title: "No agents running", example: "agent-12-empty", trigger: "state=\"empty\"", note: "Says no agents are running; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "agent-12-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). An approve or deny that fails keeps the request and says why." },
  ],
  ai: {
    summary:
      "Multi-agent mission control. <Agent12 title agents={AgentNode[]} requests={[{ id, agentId?, title, detail?, risk?: 'low'|'high' }]} currency onApprove={(request) => Promise} onDeny={(request) => Promise} />. The totals are computed from agents; Needs you is the number of requests. Approve and Deny remove the request and say what was done, or keep it with the reason if the handler rejects.",
    whenToUse: ["Overseeing an orchestrator and its sub-agents, with spend and decisions in one place", "A queue of approvals that agents are blocked on"],
    whenNotToUse: ["Steering one run in detail; use agent-11", "A single approval; use agent-2", "Past runs and traces; use agent-3"],
    composesWith: ["agent-11", "agent-2", "agent-9", "cost-1"],
    a11y: [
      { keys: "Totals", action: "A description list: each total has a label and a value" },
      { keys: "Tree", action: "A real tree: arrow keys, Home, End, Enter; every agent's state is a word" },
      { keys: "Requests", action: "A labelled list; risk is written as 'High risk'; Approve and Deny are native buttons" },
      { keys: "Result", action: "What was approved or denied is announced in a polite live region; failures are alerts tied to the request" },
    ],
    customization: ["title and agents", "requests and currency", "onApprove and onDeny"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
