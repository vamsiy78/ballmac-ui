import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "tasks-1",
  type: "registry:block",
  title: "Tasks 1: task list",
  description:
    "A tasks page: a progress ring and quick add, tasks grouped as overdue, today, upcoming and no date, a strike-through that draws itself, inline edit, reordering by button or Alt and arrow keys, shortcuts and Undo on delete.",
  category: "blocks",
  blockCategory: "tasks",
  tags: ["tasks", "todo", "to-do", "checklist", "productivity", "due dates", "priority", "keyboard", "reorder", "list"],
  files: [{ path: "components/blocks/tasks-1/tasks-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "blur-fade", "button", "checkbox", "circular-progress", "kbd", "segmented-control", "select", "skeleton", "state-view"],
  examples: [
    { name: "tasks-1-demo", title: "Default", file: "tasks-1-demo.tsx" },
    { name: "tasks-1-completed", title: "Completed tasks open", file: "tasks-1-completed.tsx" },
    { name: "tasks-1-empty", title: "Nothing to do", file: "tasks-1-empty.tsx" },
    { name: "tasks-1-loading", title: "Loading", file: "tasks-1-loading.tsx" },
    { name: "tasks-1-error", title: "Could not load", file: "tasks-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "tasks-1-loading", trigger: "state=\"loading\"", note: "A skeleton of the summary and the task rows under the real heading, announced as loading." },
    { id: "empty", title: "Nothing to do", example: "tasks-1-empty", trigger: "state=\"empty\" (or tasks={[]})", note: "A calm message pointing at the add box; a filter with no matches says so instead. emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "tasks-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was lost, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A personal task list. <Tasks1 tasks={[{ id, title, done, due: '2026-10-18', priority: 'normal' | 'high', assignee: 'JL', labels }]} today=\"2026-10-18\" locale onAdd onToggle onEdit onDelete onRestore onReorder />. Pass today yourself (an ISO date) so the server and browser agree about what is overdue; the block never reads the clock. Groups come from due dates.",
    whenToUse: ["A personal or team to-do list inside an app", "A today view with overdue items called out"],
    whenNotToUse: ["A project board (use kanban-1)", "A one-time setup checklist (use onboarding-checklist)", "Gantt or schedule views"],
    composesWith: ["app-shell-1", "kanban-1", "calendar-1", "inbox-1"],
    a11y: [
      { keys: "J / K or arrow keys", action: "Move between tasks; X completes, E edits, Delete removes (with Undo), Alt+Up and Alt+Down reorder, N jumps to the add box" },
      { keys: "Reorder buttons", action: "Move up and Move down buttons exist for every task, so ordering never needs a pointer or a drag" },
      { keys: "Due and priority", action: "Overdue and High priority are written as words next to their icon, not color alone; completing a task is announced" },
    ],
    customization: ["today, locale, title", "defaultShowCompleted opens the Completed section", "Reordering applies within a group (same due date), so every move is visible; persist the new order from onReorder"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
