import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-2",
  type: "registry:block",
  title: "Agent 2: approvals inbox",
  description:
    "One inbox for every action AI agents are waiting on: requests with their risk, the full request beside the list, Approve and Deny with A and D, J and K to move, and approve all low-risk requests at once.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "approvals", "human in the loop", "inbox", "queue", "review", "keyboard"],
  files: [{ path: "components/blocks/agent-2/agent-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "approval-card", "button", "kbd", "segmented-control", "skeleton", "state-view"],
  examples: [
    { name: "agent-2-demo", title: "Default", file: "agent-2-demo.tsx" },
    { name: "agent-2-loading", title: "Loading", file: "agent-2-loading.tsx" },
    { name: "agent-2-empty", title: "All caught up", file: "agent-2-empty.tsx" },
    { name: "agent-2-error", title: "Could not load", file: "agent-2-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-2-loading", trigger: "state=\"loading\"", note: "Skeleton requests and a detail panel under the real heading; the filter is disabled." },
    { id: "empty", title: "All caught up", example: "agent-2-empty", trigger: "state=\"empty\" (or no waiting requests)", note: "Says nothing is waiting. Shown by itself once the last request is decided." },
    { id: "error", title: "Could not load", example: "agent-2-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "An approvals queue for many agents. <Agent2 requests={[{ id, agent, title, description, risk: 'low' | 'medium' | 'high', details, preview, requested: '2 min ago', task, status: 'pending' | 'approved' | 'denied' | 'expired' }]} onApprove={(id) => …} onDeny={(id) => …} />. After a decision the next waiting request is selected, so a queue clears from the keyboard.",
    whenToUse: ["A central place where people approve what agents want to do (refunds, emails, deploys, data changes)", "Human-in-the-loop review for AI SDK tool calls that need approval or LangGraph interrupts"],
    whenNotToUse: ["One approval inside a single run (use agent-1 or approval-card)", "Approving documents or expenses between people"],
    composesWith: ["agent-1", "agent-3", "app-shell-1"],
    a11y: [
      { keys: "Up / Down or J / K in the list", action: "Moves between requests (a listbox; the selection is announced)" },
      { keys: "A / D in the list", action: "Approves or denies the selected request; the decision is announced" },
      { keys: "Tab", action: "From the list to the request's Approve and Deny buttons" },
    ],
    customization: ["title", "Decisions update in place; refresh requests from your backend to confirm", "preview takes any node, e.g. a diff-viewer"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
