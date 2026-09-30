import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "timeline",
  type: "registry:ui",
  title: "Timeline",
  description:
    "A composable sequence of milestones with current and complete states, dates, and connectors.",
  category: "data-display",
  tags: ["events", "steps", "history"],
  files: [{ path: "components/timeline.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "timeline-demo", title: "Overview", file: "timeline-demo.tsx" },
    {
      name: "timeline-states",
      title: "States and variants",
      file: "timeline-states.tsx",
    },
  ],
  ai: {
    summary:
      "A composable sequence of milestones with current and complete states, dates, and connectors.",
    whenToUse: ["Show milestones or a chronological process"],
    whenNotToUse: ["Use Activity Feed for a compact actor log"],
    composesWith: ["activity-feed"],
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
