import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "analytics-1",
  type: "registry:block",
  title: "Analytics 1: product analytics",
  description:
    "A product analytics page that reads like a report: four metrics with their change and trend, the visit-to-purchase funnel with the biggest drop flagged, a tabbed ranking of pages, sources and countries, and a device split.",
  category: "blocks",
  blockCategory: "dashboard",
  tags: ["dashboard", "analytics", "funnel", "metrics", "traffic", "growth", "charts", "report"],
  files: [{ path: "components/blocks/analytics-1/analytics-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view", "sparkline", "bar-list", "funnel-chart", "split-bar"],
  examples: [
    { name: "analytics-1-demo", title: "Default", file: "analytics-1-demo.tsx" },
    { name: "analytics-1-week", title: "Last 7 days", file: "analytics-1-week.tsx" },
    { name: "analytics-1-loading", title: "Loading", file: "analytics-1-loading.tsx" },
    { name: "analytics-1-empty", title: "No data for this period", file: "analytics-1-empty.tsx" },
    { name: "analytics-1-error", title: "Could not load", file: "analytics-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "analytics-1-loading", trigger: "state=\"loading\"", note: "Skeleton metrics and charts under the real heading, announced as loading." },
    { id: "empty", title: "No data for this period", example: "analytics-1-empty", trigger: "state=\"empty\"", note: "Says there is no data for the period; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "analytics-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "Product analytics. <Analytics1 title description periods={[{ id, label, metrics, funnel, lists, devices }]} defaultPeriod onPeriodChange={(id) => void} />. Each period carries four metrics ({ label, value, change, series }), funnel steps, ranked lists for the tabs and device segments. Switching the period swaps every part. The period is a radio group; the ranking is a tablist with arrow keys.",
    whenToUse: ["The overview page of an analytics or growth tool", "A report a founder reads every morning"],
    whenNotToUse: ["Operational health; use reliability-1", "Revenue and billing detail; use cost-1 or dashboard-1"],
    composesWith: ["reliability-1", "reviews-2", "app-shell-1", "dashboard-2"],
    a11y: [
      { keys: "Period", action: "A labelled radio group; arrow keys change it and the whole page follows" },
      { keys: "Metrics", action: "A description list; changes are written as 'Up 8.2%', never only an arrow or a color" },
      { keys: "Ranking", action: "A tablist with a tabpanel; Left and Right move between tabs" },
      { keys: "Funnel", action: "Drop-off and conversion are text; steps are toggle buttons" },
    ],
    customization: ["title and description", "periods and defaultPeriod", "onPeriodChange"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
