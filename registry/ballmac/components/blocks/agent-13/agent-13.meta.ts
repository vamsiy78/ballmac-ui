import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-13",
  type: "registry:block",
  title: "Agent 13: review desk",
  description:
    "A review desk for what agents produced: pick an item, read what it did and changed, approve it or send it back with a reason, all from the keyboard, and it moves on to the next one waiting.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "review", "approval", "human in the loop", "inbox", "diff", "keyboard"],
  files: [{ path: "components/blocks/agent-13/agent-13.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view", "review-center"],
  examples: [
    { name: "agent-13-demo", title: "Default", file: "agent-13-demo.tsx" },
    { name: "agent-13-clear", title: "All reviewed", file: "agent-13-clear.tsx" },
    { name: "agent-13-loading", title: "Loading", file: "agent-13-loading.tsx" },
    { name: "agent-13-empty", title: "Nothing to review", file: "agent-13-empty.tsx" },
    { name: "agent-13-error", title: "Could not load", file: "agent-13-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-13-loading", trigger: "state=\"loading\"", note: "Skeleton list and detail under the real heading, announced as loading." },
    { id: "empty", title: "Nothing to review", example: "agent-13-empty", trigger: "state=\"empty\"", note: "Says nothing is to review; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "agent-13-error", trigger: "state=\"error\"", note: "An alert saying nothing was approved or sent back, with Try again (onRetry). A decision that fails to save is taken back with the reason." },
  ],
  ai: {
    summary:
      "Review desk. <Agent13 title description items={ReviewItem[]} onApprove={(id) => Promise} onRequestChanges={(id, comment) => Promise} />. Each item's preview can be any node (the sample uses a diff with added and removed lines written out for screen readers). J and K move, A approves, R asks for changes; decisions are optimistic and undone with the reason if they reject.",
    whenToUse: ["The screen where a person checks what agents made before it goes out", "A fast approval queue with context"],
    whenNotToUse: ["One approval inside a chat; use approval-card", "Many agents at once; use agent-12", "A batch of identical items; use agent-14"],
    composesWith: ["agent-12", "agent-2", "agent-11", "app-shell-1"],
    a11y: [
      { keys: "List", action: "A listbox of items with state in words; J and K or the arrow keys move; one option is in the tab order" },
      { keys: "Decisions", action: "A and R decide; Approve and Request changes are native buttons; results are announced politely and failures are alerts" },
      { keys: "Diffs", action: "Added and removed lines are prefixed with the words 'Added:' and 'Removed:' for screen readers, as well as shown by colour and a sign" },
    ],
    customization: ["title and description", "items (with any preview)", "onApprove and onRequestChanges"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
