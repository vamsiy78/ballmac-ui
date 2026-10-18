import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "charts-3",
  type: "registry:block",
  title: "Charts 3: small multiples",
  description:
    "Small multiples: one small area chart per metric with the latest value, its change over the period in words and an arrow, which direction is good news, and a written summary for screen readers.",
  category: "blocks",
  blockCategory: "charts",
  tags: ["sparkline", "small multiples", "metrics", "kpi", "charts", "dashboard", "trend", "health", "overview"],
  files: [{ path: "components/blocks/charts-3/charts-3.tsx" }],
  dependencies: ["lucide-react", "motion@^12", "recharts@^3"],
  registryDependencies: ["shadcn:utils", "chart", "skeleton", "state-view"],
  examples: [
    { name: "charts-3-demo", title: "Six metrics", file: "charts-3-demo.tsx" },
    { name: "charts-3-loading", title: "Loading", file: "charts-3-loading.tsx" },
    { name: "charts-3-empty", title: "No metrics yet", file: "charts-3-empty.tsx" },
    { name: "charts-3-error", title: "Could not load", file: "charts-3-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "charts-3-loading", trigger: 'state="loading"', note: "Six placeholder tiles under the real heading, announced as loading." },
    { id: "empty", title: "No metrics yet", example: "charts-3-empty", trigger: 'state="empty" (or metrics={[]})', note: "Says each metric gets a chart once there is a second period; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "charts-3-error", trigger: 'state="error"', note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "<Charts3 title description metrics={[{ id, label, values, format?, better? }]} period='week' currency locale state />. values are one number per period, oldest first. The latest value and the change from the first value are worked out. format: number | currency | percent (percent values are fractions: 0.045 is 4.5%). better: 'lower' makes a fall count as good news.",
    whenToUse: ["An at-a-glance health page", "Comparing many metrics that share a period"],
    whenNotToUse: ["One metric in depth (use chart-area or chart-line)", "Comparing metrics on one scale (use chart-line with several series)"],
    composesWith: ["app-shell-1", "charts-1", "stat-card", "sparkline"],
    a11y: [
      { keys: "Change", action: "Written as 'better than 11 weeks ago', not only an arrow and a color; a fall in a 'lower is better' metric counts as better" },
      { keys: "Each tile", action: "Is a figure with a name and a summary: first and last value, change, highest and lowest" },
      { keys: "Hover or arrow keys", action: "Show the value at that point" },
    ],
    customization: ["period, currency and locale", "Per-metric format and better", "Make a tile a link by wrapping its heading in an <a>"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
