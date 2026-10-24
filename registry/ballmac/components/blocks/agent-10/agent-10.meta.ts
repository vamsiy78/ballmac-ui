import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-10",
  type: "registry:block",
  title: "Agent 10: console with handoff",
  description:
    "An agent console: the conversation with each tool call as a step you can open to see what was asked and what came back, Stop while it works, Enter to send, and a clear Take over and Hand back so a person is never mistaken for the agent.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "console", "chat", "handoff", "human in the loop", "tool calls", "support", "transcript"],
  files: [{ path: "components/blocks/agent-10/agent-10.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "agent-10-demo", title: "Default", file: "agent-10-demo.tsx" },
    { name: "agent-10-working", title: "Working", file: "agent-10-working.tsx" },
    { name: "agent-10-human", title: "A person took over", file: "agent-10-human.tsx" },
    { name: "agent-10-loading", title: "Loading", file: "agent-10-loading.tsx" },
    { name: "agent-10-empty", title: "No messages yet", file: "agent-10-empty.tsx" },
    { name: "agent-10-error", title: "Could not load", file: "agent-10-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-10-loading", trigger: "state=\"loading\"", note: "Skeleton bubbles under the real heading, announced as loading." },
    { id: "empty", title: "No messages yet", example: "agent-10-empty", trigger: "state=\"empty\"", note: "Says there are no messages yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "agent-10-error", trigger: "state=\"error\"", note: "An alert saying nothing was sent, with Try again (onRetry). A message that fails to send stays in the box and says why." },
  ],
  ai: {
    summary:
      "Agent console. <Agent10 messages={[{ id, role: 'user'|'agent'|'human', text, at?, name? (human), tools?: [{ name, input, output?, status: 'running'|'done'|'failed' }] }]} running humanActive onSend={(text) => Promise} onStop={() => void} onHandoff={(takeOver: boolean) => Promise} />. A person's reply is labelled '(a person)' and framed differently. While a person is active the agent is shown as paused.",
    whenToUse: ["Operating or supervising a support or task agent", "Any transcript where tool calls and a human takeover matter"],
    whenNotToUse: ["A public chat widget; use ai-chat-1", "Reviewing finished runs; use agent-3"],
    composesWith: ["agent-1", "agent-2", "agent-9", "escalation-card"],
    a11y: [
      { keys: "Log", action: "A focusable log region that announces new messages politely" },
      { keys: "Sender", action: "Who said what is written above every message, including '(a person)'" },
      { keys: "Steps", action: "Each tool call is a disclosure with its status in words; failures are marked in words" },
      { keys: "Enter", action: "Sends; Shift and Enter adds a line; an empty send is an alert" },
      { keys: "Handoff", action: "A button that says Take over or Hand back; the state is announced" },
    ],
    customization: ["messages, title, running, humanActive", "onSend, onStop, onHandoff"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
