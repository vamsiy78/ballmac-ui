import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-11",
  type: "registry:block",
  title: "Agent 11: run workbench",
  description:
    "A run workbench: the conversation with tool calls as openable cards, a live plan, a context meter and a steering box to redirect the agent while it works, with Stop, optimistic instructions and honest failures.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "workbench", "run", "tool calls", "plan", "context", "steering", "human in the loop"],
  files: [{ path: "components/blocks/agent-11/agent-11.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view", "agent-steering", "context-window", "plan-tracker", "thinking-loader", "tool-call-card"],
  examples: [
    { name: "agent-11-demo", title: "Default", file: "agent-11-demo.tsx" },
    { name: "agent-11-stopped", title: "Stopped", file: "agent-11-stopped.tsx" },
    { name: "agent-11-loading", title: "Loading", file: "agent-11-loading.tsx" },
    { name: "agent-11-empty", title: "No run yet", file: "agent-11-empty.tsx" },
    { name: "agent-11-error", title: "Could not load", file: "agent-11-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-11-loading", trigger: "state=\"loading\"", note: "Skeleton conversation and side panels under the real heading, announced as loading." },
    { id: "empty", title: "No run yet", example: "agent-11-empty", trigger: "state=\"empty\"", note: "Says there is no run yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "agent-11-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A steering instruction that fails is taken back with the reason; Stop that fails leaves the run going and says why." },
  ],
  ai: {
    summary:
      "Agent run workbench. <Agent11 title model running step messages={[{ id, role: 'user'|'agent', text } | { id, role: 'tool', name, status, server?, input?, result?, duration?, icon? }]} plan={PlanStep[]} context={{ segments, limit, reserved? }} notes={SteeringNote[]} onSteer={(text, mode) => Promise} onRemoveNote onStop onCompact onRetryTool={(messageId) => Promise} />. Steering is optimistic: the instruction shows as queued and is taken back with the reason if onSteer rejects.",
    whenToUse: ["The screen where a person watches and steers one long-running agent", "A task view with the conversation, the plan and the memory meter together"],
    whenNotToUse: ["Many agents at once; use agent-12", "Reviewing finished runs; use agent-3", "A plain chat; use ai-chat-1"],
    composesWith: ["agent-12", "agent-2", "agent-9", "app-shell-1"],
    a11y: [
      { keys: "Conversation", action: "A log region that announces new messages politely; each speaker is named for screen readers" },
      { keys: "Tool calls", action: "Disclosure cards with their state in words; Retry on a failed call" },
      { keys: "Steering", action: "A labelled box, a radio group for timing, and Ctrl or Command with Enter to send" },
      { keys: "Stop", action: "A button that shows busy; a failure is an alert and the run keeps its Running state" },
      { keys: "Side panels", action: "A landmark named Run details holding the plan and the context meter" },
    ],
    customization: ["title, model, step, running", "messages, plan, context, notes", "onSteer, onRemoveNote, onStop, onCompact, onRetryTool"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
