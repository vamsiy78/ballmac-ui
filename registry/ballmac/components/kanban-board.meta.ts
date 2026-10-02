import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "kanban-board",
  type: "registry:ui",
  title: "Kanban Board",
  description:
    "A responsive task board with pointer drag and keyboard movement between columns.",
  category: "data-display",
  tags: ["kanban", "tasks", "board"],
  files: [{ path: "components/kanban-board.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "direction"],
  examples: [
    {
      name: "kanban-board-demo",
      title: "Overview",
      file: "kanban-board-demo.tsx",
    },
    {
      name: "kanban-board-states",
      title: "States and variants",
      file: "kanban-board-states.tsx",
    },
  ],
  ai: {
    summary:
      "A responsive task board with pointer drag and keyboard movement between columns.",
    whenToUse: ["Organize tasks across workflow stages"],
    whenNotToUse: ["Use a table for dense sortable records"],
    composesWith: ["card"],
    a11y: [
      {
        keys: "Tab / Alt + Arrow keys",
        action: "Focuses and moves cards; buttons also move between columns",
      },
    ],
    customization: [
      "Controlled and uncontrolled state",
      "Content and token-based className styling",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
