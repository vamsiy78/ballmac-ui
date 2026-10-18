import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "charts-4",
  type: "registry:block",
  title: "Charts 4: scorecard",
  description:
    "A quarterly scorecard: goals met and average progress, concentric rings for the goals, a radar of the team against its targets and a ranked bar chart, with a table view and CSV download on every chart.",
  category: "blocks",
  blockCategory: "charts",
  tags: ["scorecard", "okr", "goals", "radar", "radial", "ranking", "charts", "dashboard", "team", "performance"],
  files: [{ path: "components/blocks/charts-4/charts-4.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "chart-bar", "chart-radar", "chart-radial", "kpi-row", "skeleton", "state-view"],
  examples: [
    { name: "charts-4-demo", title: "Three goals, six areas, five leaders", file: "charts-4-demo.tsx" },
    { name: "charts-4-loading", title: "Loading", file: "charts-4-loading.tsx" },
    { name: "charts-4-empty", title: "No goals yet", file: "charts-4-empty.tsx" },
    { name: "charts-4-error", title: "Could not load", file: "charts-4-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "charts-4-loading", trigger: 'state="loading"', note: "Skeletons shaped like the figures and the three charts, under the real heading, announced as loading." },
    { id: "empty", title: "No goals yet", example: "charts-4-empty", trigger: 'state="empty" (or goals={[]})', note: "Says progress appears once a goal is set; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "charts-4-error", trigger: 'state="error"', note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "<Charts4 title description goals={[{ name, label, value }]} profile={[{ area, current, target }]} leaders={[{ name, value }]} leaderFormatter leaderTitle state />. goals are percents of target (100 is met). profile scores run 0 to 100. The goals met, average progress, biggest gap and leader are worked out from the data.",
    whenToUse: ["Quarterly or sprint reviews", "OKR and team performance pages"],
    whenNotToUse: ["Time series (use charts-1 or charts-3)", "Revenue (use charts-2)"],
    composesWith: ["app-shell-1", "goals-1", "leaderboard-1", "chart-frame"],
    a11y: [
      { keys: "Goals", action: "Each ring is named and read as 'value of target (share)' in the chart's summary" },
      { keys: "Each chart", action: "Has a Table view of the same numbers, a CSV download and a summary written from its data" },
      { keys: "Biggest gap", action: "Written as 'N points under target', not only a shape" },
    ],
    customization: ["Pass your own goals, profile and leaders", "leaderFormatter writes the ranking's numbers", "Swap a chart for another chart-* component"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
