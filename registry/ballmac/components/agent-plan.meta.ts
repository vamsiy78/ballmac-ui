import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-plan",
  type: "registry:ui",
  title: "Agent Plan",
  description:
    "A live task plan for agents: a vertical timeline with pending, running, done, failed and skipped steps, nested substeps, expandable output, segmented progress and retry on failure.",
  category: "ai",
  tags: ["ai", "agent", "plan", "steps", "timeline", "tasks"],
  files: [{ path: "components/agent-plan.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "agent-plan-demo", title: "Plan that runs", file: "agent-plan-demo.tsx" },
    { name: "agent-plan-failed", title: "Failure with retry", file: "agent-plan-failed.tsx" },
  ],
  ai: {
    summary:
      "steps is [{ id, title, status, description?, duration?, detail?, error?, steps? }]. Update statuses as the agent works and the timeline, progress bar and screen reader summary follow. onRetry adds a Retry button to failed steps.",
    whenToUse: ["Showing what an agent will do and is doing", "Multi-step workflows that can fail part-way"],
    whenNotToUse: ["A single tool invocation; use tool-call-card", "Onboarding checklists; use onboarding-checklist"],
    composesWith: ["tool-call-card", "approval-card", "thinking-indicator"],
    a11y: [
      { keys: "Enter / Space", action: "Expands or collapses a step's output" },
      { keys: "Screen readers", action: "Each step reads its status first; a polite status line announces the current step" },
      { keys: "Color", action: "Every state has an icon and, for running and failed, a word" },
    ],
    customization: ["expanded / onExpandedChange", "onRetry", "actions slot", "nested steps"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
