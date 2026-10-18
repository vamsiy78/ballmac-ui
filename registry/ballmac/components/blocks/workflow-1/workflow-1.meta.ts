import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "workflow-1",
  type: "registry:block",
  title: "Workflow 1: automation builder",
  description:
    "An automation builder as a vertical flow: a trigger, then conditions, waits and actions you add, reorder and delete, each opening to its settings, and a test run that shows every step as done or where a condition stopped it.",
  category: "blocks",
  blockCategory: "workflow",
  tags: ["workflow", "automation", "trigger", "conditions", "actions", "zapier", "rules", "no-code", "builder", "flow"],
  files: [{ path: "components/blocks/workflow-1/workflow-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "input", "select", "skeleton", "state-view", "switch"],
  examples: [
    { name: "workflow-1-demo", title: "A flow with a condition", file: "workflow-1-demo.tsx" },
    { name: "workflow-1-open", title: "A step open", file: "workflow-1-open.tsx" },
    { name: "workflow-1-loading", title: "Loading", file: "workflow-1-loading.tsx" },
    { name: "workflow-1-empty", title: "Nothing automated yet", file: "workflow-1-empty.tsx" },
    { name: "workflow-1-error", title: "Could not load", file: "workflow-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "workflow-1-loading", trigger: "state=\"loading\"", note: "Skeleton step cards under the real heading, announced as loading." },
    { id: "empty", title: "Nothing automated yet", example: "workflow-1-empty", trigger: "state=\"empty\"", note: "Says to pick what starts it and add what should happen; emptyState sets the copy and can add a button." },
    { id: "error", title: "Could not load", example: "workflow-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "An automation builder. <Workflow1 title trigger triggers steps={[{ id, type: 'condition', field, operator: 'is' | 'is not' | 'is more than' | 'contains', value } | { id, type: 'delay', amount, unit: 'minutes' | 'hours' | 'days' } | { id, type: 'action', action: 'email' | 'slack' | 'task' | 'tag', text }]} sample={{ 'Order total': '640' }} stepMs={450} onChange={({ trigger, steps, enabled }) => ...} />. Test run walks the steps with the sample facts; a condition that fails stops it there. Every edit calls onChange with the whole flow.",
    whenToUse: ["Rules and automations in a SaaS product", "A no-code 'when this happens, do that' editor"],
    whenNotToUse: ["A marketing diagram of a workflow (use a features block)", "A graph with branches and loops"],
    composesWith: ["flags-1", "webhooks-1", "app-shell-1", "tickets-1"],
    a11y: [
      { keys: "Tab, Enter / Space", action: "Each step's title is a button that says whether it is open; reorder and delete buttons say which step they act on" },
      { keys: "Test run", action: "Each step says Ran fine, Running or Stopped here with why, with an icon, and the end result is a status message" },
      { keys: "Changes", action: "Adding, moving and deleting a step are announced politely, with the new position" },
    ],
    customization: ["Steps are a plain array, so saving and loading flows is a JSON round trip", "stepMs sets how long each step takes in a test run; 0 is instant", "The trigger card is dark so the start of the flow is always clear"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
