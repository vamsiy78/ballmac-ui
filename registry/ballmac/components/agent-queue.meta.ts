import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-queue",
  type: "registry:ui",
  title: "Agent Queue",
  description:
    "What an agent has on its plate: tasks running in their slots and waiting ones in order, with real buttons to move, pause, prioritise and cancel (cancel asks first), moves shown at once and undone with the reason if they fail.",
  category: "ai",
  tags: ["ai", "agents", "queue", "tasks", "priority", "reorder", "pause", "scheduling"],
  files: [{ path: "components/agent-queue.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "motion-presets"],
  examples: [
    { name: "agent-queue-demo", title: "Reorder, pause and cancel", file: "agent-queue-demo.tsx" },
    { name: "agent-queue-empty", title: "Nothing waiting", file: "agent-queue-empty.tsx" },
  ],
  ai: {
    summary:
      "tasks is [{ id, title, state: running | queued | paused, priority?: high | normal | low, progress?, eta?, agent? }] (required); slots (default 3). Running tasks fill the slots; the rest wait in order. onMove(id, toIndex), onPause(id, paused), onCancel(id) (after the person confirms) and onPriority(id, priority) may be async: a move is shown at once and put back with the reason if it rejects. Each button only appears when its handler is given.",
    whenToUse: ["Letting a person see and reorder the work an agent will do next", "A job queue with priorities, pause and cancel"],
    whenNotToUse: ["Many parallel items of the same kind; use fan-out-grid", "Steps of one plan; use plan-tracker", "Scheduled recurring jobs; use cron-1"],
    composesWith: ["fan-out-grid", "agent-tree", "plan-tracker", "agent-steering"],
    a11y: [
      { keys: "Reordering", action: "Move up and Move down are real buttons named for the task, so it works from the keyboard and a screen reader; the first cannot move up and the last cannot move down" },
      { keys: "Announcements", action: "Every change is announced in a polite live region, such as 'Email receipts moved to position 1'" },
      { keys: "Cancel", action: "A two-step confirmation in a labelled group: 'Cancel this task?' with 'Yes, cancel it' and 'Keep it'" },
      { keys: "Progress", action: "Running tasks have a progressbar named for the task" },
      { keys: "Errors", action: "A failed change is an alert on the task, and a failed move puts the task back" },
    ],
    customization: ["tasks and slots", "onMove, onPause, onCancel, onPriority", "title"],
  },
  statesNone: "A presentational list: the tasks are passed in with their own state, so it has nothing of its own to load. An empty queue says nothing is waiting.",
  version: "1.0.0",
  updated: "2026-10-25",
})
