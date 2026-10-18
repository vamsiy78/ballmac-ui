import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "charts-1",
  type: "registry:block",
  title: "Charts 1: analytics overview",
  description:
    "An analytics overview: a range picker, four figures with their change from the period before, a stacked area chart of new and returning visitors, top pages and a sources donut, each with a table view and CSV download.",
  category: "blocks",
  blockCategory: "charts",
  tags: ["analytics", "charts", "dashboard", "traffic", "visitors", "kpi", "area", "donut", "metrics", "range"],
  files: [{ path: "components/blocks/charts-1/charts-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "chart-area", "chart-bar", "chart-pie", "kpi-row", "segmented-control", "skeleton", "state-view"],
  examples: [
    { name: "charts-1-demo", title: "Thirty days", file: "charts-1-demo.tsx" },
    { name: "charts-1-loading", title: "Loading", file: "charts-1-loading.tsx" },
    { name: "charts-1-empty", title: "No visits yet", file: "charts-1-empty.tsx" },
    { name: "charts-1-error", title: "Could not load", file: "charts-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "charts-1-loading", trigger: 'state="loading"', note: "Skeletons shaped like the figures and charts, under the real heading, announced as loading." },
    { id: "empty", title: "No visits yet", example: "charts-1-empty", trigger: 'state="empty" (or daily={[]})', note: "Says the numbers appear once people visit; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "charts-1-error", trigger: 'state="error"', note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "<Charts1 title description daily={[{ date, newVisitors, returning, signups }]} pages sources defaultRange='30' onRangeChange state />. daily is one row per day, oldest first, at least twice the longest range. Figures (visitors, sign-ups, conversion, returning share) and their change from the previous period are worked out from daily. Pages and sources are what you pass; reload them in onRangeChange.",
    whenToUse: ["The overview page of a product or marketing site's analytics", "A starting point for any metric dashboard with a range picker"],
    whenNotToUse: ["A funnel (use funnel-1)", "Cohort retention (use retention-1)", "One chart only (use chart-area, chart-bar or chart-pie)"],
    composesWith: ["app-shell-1", "funnel-1", "retention-1", "chart-frame"],
    a11y: [
      { keys: "Range", action: "A labelled switch between 7, 30 and 90 days; the figures, change and chart follow" },
      { keys: "Change", action: "Written as 'up 12.4% from the previous 30 days', not only an arrow and a color" },
      { keys: "Each chart", action: "Has a Table view of the same numbers, a CSV download and a summary written from its data" },
    ],
    customization: ["Pass daily rows from your API; the figures follow", "onRangeChange to load that range's pages and sources", "Swap any chart for another chart-* component"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
