import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-14",
  type: "registry:block",
  title: "Agent 14: batch run",
  description:
    "A batch run in one view: tiles for everything being processed (done, running or failed, with Retry), and the queue of what runs next, where waiting work can be reordered, paused or cancelled.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "batch", "bulk", "queue", "retry", "progress", "parallel", "operations"],
  files: [{ path: "components/blocks/agent-14/agent-14.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view", "agent-queue", "fan-out-grid"],
  examples: [
    { name: "agent-14-demo", title: "Default", file: "agent-14-demo.tsx" },
    { name: "agent-14-small", title: "A small batch", file: "agent-14-small.tsx" },
    { name: "agent-14-loading", title: "Loading", file: "agent-14-loading.tsx" },
    { name: "agent-14-empty", title: "No batch running", file: "agent-14-empty.tsx" },
    { name: "agent-14-error", title: "Could not load", file: "agent-14-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-14-loading", trigger: "state=\"loading\"", note: "Skeleton grid and queue under the real heading, announced as loading." },
    { id: "empty", title: "No batch running", example: "agent-14-empty", trigger: "state=\"empty\"", note: "Says no batch is running; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "agent-14-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A retry or a queue change that fails says why and changes nothing." },
  ],
  ai: {
    summary:
      "Batch run. <Agent14 title description items={FanItem[]} tasks={QueueTask[]} slots onRetryItems={(ids) => Promise} onMove onPause onCancel onPriority />. The grid answers which items went wrong (it opens on the first failed one); the queue answers what happens next. Both report failures plainly and change nothing when a handler rejects. (onRetry is the usual retry for the error state.)",
    whenToUse: ["Watching a bulk job where one agent task runs over many files or records", "Deciding what runs next and retrying only what failed"],
    whenNotToUse: ["One long run; use agent-11", "A team of different agents; use agent-12"],
    composesWith: ["agent-12", "agent-11", "agent-13", "cost-1"],
    a11y: [
      { keys: "Tiles", action: "Buttons named for the item and state; arrow keys move in every direction; the state is an icon and a word, not only colour" },
      { keys: "Queue", action: "Move up and down are real buttons named for the task; every change is announced" },
      { keys: "Retry", action: "Native buttons; failures are alerts" },
    ],
    customization: ["title, description, slots", "items and tasks", "onRetryItems, onMove, onPause, onCancel, onPriority"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
