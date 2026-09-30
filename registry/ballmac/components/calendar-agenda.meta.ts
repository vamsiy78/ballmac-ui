import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "calendar-agenda",
  type: "registry:ui",
  title: "Calendar Agenda",
  description:
    "A day agenda with native date entry, adjacent-day controls, and accessible event times.",
  category: "data-display",
  tags: ["calendar", "agenda", "events"],
  files: [{ path: "components/calendar-agenda.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "calendar-agenda-demo",
      title: "Overview",
      file: "calendar-agenda-demo.tsx",
    },
    {
      name: "calendar-agenda-states",
      title: "States and variants",
      file: "calendar-agenda-states.tsx",
    },
  ],
  ai: {
    summary:
      "A day agenda with native date entry, adjacent-day controls, and accessible event times.",
    whenToUse: ["Show scheduled events for one day"],
    whenNotToUse: ["Use a full calendar for month-level date picking"],
    composesWith: ["timeline"],
    a11y: [
      {
        keys: "Tab / Enter / Space",
        action: "Changes the day through native date input and buttons",
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
