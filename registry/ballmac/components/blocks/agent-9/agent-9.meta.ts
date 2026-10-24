import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-9",
  type: "registry:block",
  title: "Agent 9: autonomy and limits",
  description:
    "How much an AI agent may do alone: a plain-words autonomy level, spend caps per run and per day, a step limit and the tools it may use, with a warning for risky mixes and a save bar that holds edits until saved.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "autonomy", "guardrails", "budget", "limits", "permissions", "tools", "settings", "safety"],
  files: [{ path: "components/blocks/agent-9/agent-9.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view", "switch"],
  examples: [
    { name: "agent-9-demo", title: "Default", file: "agent-9-demo.tsx" },
    { name: "agent-9-free", title: "Acting on its own", file: "agent-9-free.tsx" },
    { name: "agent-9-loading", title: "Loading", file: "agent-9-loading.tsx" },
    { name: "agent-9-empty", title: "No tools connected", file: "agent-9-empty.tsx" },
    { name: "agent-9-error", title: "Could not load", file: "agent-9-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-9-loading", trigger: "state=\"loading\"", note: "Skeleton cards under the real heading, announced as loading." },
    { id: "empty", title: "No tools connected", example: "agent-9-empty", trigger: "state=\"empty\"", note: "Says no tools are connected; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "agent-9-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A save that fails keeps every edit and says why." },
  ],
  ai: {
    summary:
      "Agent autonomy and limits. <Agent9 config={{ autonomy: 'suggest'|'ask'|'auto', perRun, perDay, tools: ['id'], maxSteps }} tools={[{ id, name, description, writes? }]} currency='USD' onSave={(config) => Promise} />. Edits are held until Save; Discard puts them back. A run limit above the daily limit, or a bad step count, blocks saving and says why. Acting on its own with tools that write shows a plain-words warning.",
    whenToUse: ["Where an owner decides how much an agent may do without asking", "Spend caps, step limits and tool permissions in one place"],
    whenNotToUse: ["Choosing the model and prompt; use agent-7", "Approving one action; use agent-2"],
    composesWith: ["agent-2", "agent-7", "agent-8", "cost-1"],
    a11y: [
      { keys: "Autonomy", action: "A radio group; each level has its name and what it means written" },
      { keys: "Limits", action: "Labelled number fields; errors are alerts tied to the field" },
      { keys: "Tools", action: "Switches named '<tool> is allowed'; tools that change things are labelled in words" },
      { keys: "Save bar", action: "A polite live region says unsaved, saved or the failure; failures are alerts" },
    ],
    customization: ["config, tools, currency, title", "onSave", "Autonomy levels are fixed: suggest, ask, auto"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
