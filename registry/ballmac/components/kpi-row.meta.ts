import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "kpi-row",
  type: "registry:ui",
  title: "KPI Row",
  description:
    "A compact, semantic row of key metrics that adapts from one to four columns.",
  category: "data-display",
  tags: ["metric", "dashboard", "summary"],
  files: [{ path: "components/kpi-row.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "kpi-row-demo", title: "Overview", file: "kpi-row-demo.tsx" },
    {
      name: "kpi-row-states",
      title: "States and variants",
      file: "kpi-row-states.tsx",
    },
  ],
  ai: {
    summary:
      "A compact, semantic row of key metrics that adapts from one to four columns.",
    whenToUse: ["Show several related metrics together"],
    whenNotToUse: ["Use Stat Card when each metric needs more context"],
    composesWith: ["stat-card"],
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
