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
  registryDependencies: ["shadcn:utils", "avatar", "badge", "button", "dropdown-menu", "input"],
  examples: [
    { name: "kanban-1-demo", title: "Default", file: "kanban-1-demo.tsx" },
    { name: "kanban-1-simple", title: "Three columns", file: "kanban-1-simple.tsx" },
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
    customization: ["defaultColumns and onChange(columns)", "height of the board area", "priority: low, medium or high"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
