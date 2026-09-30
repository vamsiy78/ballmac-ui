import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "status-dot",
  type: "registry:ui",
  title: "Status Dot",
  description:
    "A compact status indicator that always pairs its color with a visible label.",
  category: "feedback",
  tags: ["status", "presence", "online"],
  files: [
    {
      path: "components/status-dot.tsx",
    },
  ],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "status-dot-demo",
      title: "Overview",
      file: "status-dot-demo.tsx",
    },
    {
      name: "status-dot-states",
      title: "States and variants",
      file: "status-dot-states.tsx",
    },
  ],
  ai: {
    summary:
      "A compact status indicator that always pairs its color with a visible label.",
    whenToUse: [
      "Show presence or service state",
      "Label a live operational status",
    ],
    whenNotToUse: ["Use badge for category labels"],
    composesWith: ["badge", "avatar"],
    a11y: [
      {
        keys: "None",
        action: "Status is expressed in visible text",
      },
    ],
    customization: [
      "status: online | busy | away | offline",
      "Optional reduced-motion pulse",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
