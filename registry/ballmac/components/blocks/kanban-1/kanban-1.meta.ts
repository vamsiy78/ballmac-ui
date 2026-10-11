import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "kanban-1",
  type: "registry:block",
  title: "Kanban 1: project board with drag and keyboard moves",
  description: "A project board: columns with counts, rich task cards (tags, priority, due date, comments, assignee), drag and drop with a drop indicator, keyboard pick-up and move with announcements, a Move-to menu, quick add and a person filter.",
  category: "blocks",
  blockCategory: "kanban",
  tags: ["kanban", "board", "tasks", "drag and drop", "project", "keyboard"],
  files: [{ path: "components/blocks/kanban-1/kanban-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "avatar", "badge", "button", "dropdown-menu", "input", "state-view", "skeleton"],
  examples: [
    { name: "kanban-1-demo", title: "Default", file: "kanban-1-demo.tsx" },
    { name: "kanban-1-simple", title: "Three columns", file: "kanban-1-simple.tsx" },
    { name: "kanban-1-loading", title: "Loading", file: "kanban-1-loading.tsx" },
    { name: "kanban-1-error", title: "Could not load", file: "kanban-1-error.tsx" },
    { name: "kanban-1-no-cards", title: "No cards", file: "kanban-1-no-cards.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "kanban-1-loading", trigger: "state=\"loading\"", note: "A skeleton with the same shapes as the ready view, announced as loading; nothing is clickable." },
    { id: "empty", title: "No cards", example: "kanban-1-no-cards", trigger: "state=\"empty\"", note: "A clear message that there is nothing yet. emptyState sets the copy and can add an action." },
    { id: "error", title: "Could not load", example: "kanban-1-error", trigger: "state=\"error\"", note: "An error with a Try again button (onRetry), announced as an alert." },
  ],
  ai: {
    summary: "A task board. Pass defaultColumns=[{ id, title, tasks: [{ id, title, tags?, priority?, assignee?, due?, comments? }] }] and onChange(columns).",
    whenToUse: ["Project and sprint boards", "Pipelines, hiring and support queues"],
    whenNotToUse: ["A simple list of tasks (use a table)"],
    composesWith: ["app-shell-1", "calendar-1", "mail-1"],
    a11y: [
      { keys: "Space or Enter on a card", action: "Picks it up; Arrow keys move it between columns and positions; Space or Enter drops it; Escape puts it back" },
      { keys: "Move to menu", action: "Every card has a menu that moves it to any column, for people who don't drag" },
      { keys: "Announcements", action: "Each pick-up, move, drop and removal is announced politely" },
    ],
    customization: ["defaultColumns and onChange(columns)", "height of the board area", "priority: low, medium or high", "state: \"ready\" | \"loading\" | \"empty\" | \"error\"; onRetry, emptyState and errorState set the retry action and the copy. Pair with useResource: state={r.state} onRetry={r.retry}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (loading, empty, error) with onRetry, emptyState and errorState: a skeleton with the same shapes as the ready view, an error with retry, and an empty message. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
