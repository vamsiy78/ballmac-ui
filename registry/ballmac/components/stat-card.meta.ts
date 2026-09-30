import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "stat-card",
  type: "registry:ui",
  title: "Stat Card",
  description:
    "A metric card with a clear comparison trend, optional visual, and readable value hierarchy.",
  category: "data-display",
  tags: ["metric", "dashboard", "analytics"],
  files: [{ path: "components/stat-card.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "stat-card-demo", title: "Overview", file: "stat-card-demo.tsx" },
    {
      name: "stat-card-states",
      title: "States and variants",
      file: "stat-card-states.tsx",
    },
  ],
  ai: {
    summary:
      "A metric card with a clear comparison trend, optional visual, and readable value hierarchy.",
    whenToUse: ["Track a key metric with a comparison period"],
    whenNotToUse: ["Use Kpi Row for several compact metrics"],
    composesWith: ["card"],
    a11y: [
      {
        keys: "None",
        action: "Static content is announced with semantic structure",
      },
    ],
    customization: ["Content, layout, and token-based className styling"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
