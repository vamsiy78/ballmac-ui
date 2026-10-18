import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "charts-2",
  type: "registry:block",
  title: "Charts 2: revenue report",
  description:
    "A revenue report: monthly recurring revenue, annual run rate, what was added last month and the largest plan, then revenue by plan as stacked columns and net revenue retention as a line against the 100% mark.",
  category: "blocks",
  blockCategory: "charts",
  tags: ["revenue", "mrr", "finance", "charts", "retention", "saas", "report", "stacked", "dashboard", "metrics"],
  files: [{ path: "components/blocks/charts-2/charts-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "chart-bar", "chart-line", "kpi-row", "skeleton", "state-view"],
  examples: [
    { name: "charts-2-demo", title: "Twelve months", file: "charts-2-demo.tsx" },
    { name: "charts-2-loading", title: "Loading", file: "charts-2-loading.tsx" },
    { name: "charts-2-empty", title: "No revenue yet", file: "charts-2-empty.tsx" },
    { name: "charts-2-error", title: "Could not load", file: "charts-2-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "charts-2-loading", trigger: 'state="loading"', note: "Skeletons shaped like the figures and the two charts, under the real heading, announced as loading." },
    { id: "empty", title: "No revenue yet", example: "charts-2-empty", trigger: 'state="empty" (or months={[]})', note: "Says revenue appears once there are paying customers; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "charts-2-error", trigger: 'state="error"', note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "<Charts2 title description months={[{ month, starter, pro, team, retention }]} currency='USD' locale state />. One row per month, oldest first. Monthly recurring revenue, annual run rate, the month's net addition and the largest plan are worked out from the rows; plans are fixed to starter, pro and team in this version, so rename them in the source for your own tiers.",
    whenToUse: ["A finance or SaaS revenue page", "Showing growth by plan next to retention"],
    whenNotToUse: ["Traffic and conversion (use charts-1)", "A pricing table (use pricing-1)"],
    composesWith: ["app-shell-1", "billing-1", "charts-1", "chart-frame"],
    a11y: [
      { keys: "Change", action: "Written as 'up 7.8% from Sep', not only an arrow and a color" },
      { keys: "Each chart", action: "Has a Table view of the same numbers, a CSV download and a summary written from its data" },
      { keys: "Retention", action: "A labeled reference line at 100% says what flat looks like" },
    ],
    customization: ["currency and locale for every figure", "Rename the three plans in the source", "Swap a chart for another chart-* component"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
