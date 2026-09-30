import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "contribution-graph",
  type: "registry:ui",
  title: "Contribution Graph",
  description:
    "A compact daily activity heatmap with token-based intensity and an accessible summary.",
  category: "data-display",
  tags: ["heatmap", "activity", "calendar"],
  files: [{ path: "components/contribution-graph.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "contribution-graph-demo",
      title: "Overview",
      file: "contribution-graph-demo.tsx",
    },
    {
      name: "contribution-graph-states",
      title: "States and variants",
      file: "contribution-graph-states.tsx",
    },
  ],
  ai: {
    summary:
      "A compact daily activity heatmap with token-based intensity and an accessible summary.",
    whenToUse: ["Show a daily activity pattern over time"],
    whenNotToUse: ["Use a calendar when dates need interaction"],
    composesWith: ["activity-feed"],
    a11y: [
      {
        keys: "Tab / Arrow keys",
        action: "Focuses and scrolls the heatmap; total and date span are announced",
      },
    ],
    customization: ["Content, layout, and token-based className styling"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
