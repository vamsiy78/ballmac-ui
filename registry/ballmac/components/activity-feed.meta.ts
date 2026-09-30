import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "activity-feed",
  type: "registry:ui",
  title: "Activity Feed",
  description:
    "A compact actor and action feed with timestamps and an empty state.",
  category: "data-display",
  tags: ["activity", "history", "events"],
  files: [{ path: "components/activity-feed.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "activity-feed-demo",
      title: "Overview",
      file: "activity-feed-demo.tsx",
    },
    {
      name: "activity-feed-states",
      title: "States and variants",
      file: "activity-feed-states.tsx",
    },
  ],
  ai: {
    summary:
      "A compact actor and action feed with timestamps and an empty state.",
    whenToUse: ["Show recent changes made by people or the system"],
    whenNotToUse: ["Use Timeline for milestone progression"],
    composesWith: ["timeline"],
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
