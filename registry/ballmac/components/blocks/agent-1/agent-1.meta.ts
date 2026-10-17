import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-1",
  type: "registry:block",
  title: "Agent 1: live agent run",
  description:
    "One AI agent run as it happens: the task and status, the plan beside it, every note, tool call and approval request in order, approvals that pause the run, the result with copy, and a follow-up box.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "run", "tool calls", "approval", "human in the loop", "plan", "trace", "autonomous"],
  files: [{ path: "components/blocks/agent-1/agent-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "agent-plan", "approval-card", "button", "skeleton", "state-view", "tool-call-card"],
  examples: [
    { name: "agent-1-demo", title: "Waiting for approval", file: "agent-1-demo.tsx" },
    { name: "agent-1-done", title: "Done, with a result", file: "agent-1-done.tsx" },
    { name: "agent-1-loading", title: "Loading", file: "agent-1-loading.tsx" },
    { name: "agent-1-empty", title: "No run yet", file: "agent-1-empty.tsx" },
    { name: "agent-1-error", title: "Could not load", file: "agent-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-1-loading", trigger: "state=\"loading\"", note: "A skeleton of the plan and the activity under the real header." },
    { id: "empty", title: "No run yet", example: "agent-1-empty", trigger: "state=\"empty\"", note: "Explains that the plan and progress will appear; emptyState can add a Start button." },
    { id: "error", title: "Could not load", example: "agent-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "An agent run view. <Agent1 run={{ task, agent, status: 'running' | 'waiting' | 'done' | 'failed' | 'stopped', elapsed, usage: { tokens, cost }, steps: PlanStep[], events: [{ type: 'message', text } | { type: 'tool', name, status, input, result, duration } | { type: 'approval', title, risk, details, preview, status }], output }} onApprove={(id) => …} onDeny onStop onRunAgain onFollowUp />. Map your agent loop's stream (AI SDK tool calls, LangGraph interrupts) onto events.",
    whenToUse: ["Watching an autonomous agent work and approving its risky steps", "The detail page of a background agent task"],
    whenNotToUse: ["A chat conversation (use ai-chat-1 or ai-chat-2)", "A list of many runs (use agent-3)", "A queue of approvals from many agents (use agent-2)"],
    composesWith: ["agent-2", "agent-3", "app-shell-1"],
    a11y: [
      { keys: "Status", action: "The run status is a live status region, so \"Waiting for you\" is announced" },
      { keys: "Tab", action: "Reaches each tool call's details toggle and each approval's Approve and Deny" },
      { keys: "Enter in the follow-up box", action: "Sends the instruction (onFollowUp)" },
    ],
    customization: [
      "Approvals update in place when pressed; pass the new run from your backend to confirm",
      "preview on an approval takes any node: a diff-viewer, a code-block or an email draft",
      "locale formats the token count",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
