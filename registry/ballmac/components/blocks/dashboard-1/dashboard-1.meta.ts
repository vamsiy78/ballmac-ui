import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "dashboard-1",
  type: "registry:block",
  title: "Dashboard 1: sales overview",
  description: "A sales dashboard page: a date-range switch that recomputes everything, four KPI cards with change and trend, a revenue area chart against the previous period, revenue by channel and a recent-orders table.",
  category: "blocks",
  blockCategory: "dashboard",
  tags: ["dashboard", "analytics", "kpi", "chart", "orders", "sales", "table"],
  files: [{ path: "components/blocks/dashboard-1/dashboard-1.tsx" }],
  dependencies: ["lucide-react", "recharts@^3"],
  registryDependencies: ["shadcn:utils", "badge", "button", "chart", "segmented-control", "sparkline", "i18n", "state-view", "skeleton"],
  examples: [
    { name: "dashboard-1-demo", title: "Default", file: "dashboard-1-demo.tsx" },
    { name: "dashboard-1-week", title: "Seven days, your data", file: "dashboard-1-week.tsx" },
    { name: "dashboard-1-loading", title: "Loading", file: "dashboard-1-loading.tsx" },
    { name: "dashboard-1-error", title: "Could not load", file: "dashboard-1-error.tsx" },
    { name: "dashboard-1-no-data", title: "No sales yet", file: "dashboard-1-no-data.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "dashboard-1-loading", trigger: "state=\"loading\"", note: "A skeleton with the same shapes as the ready view, announced as loading; nothing is clickable." },
    { id: "empty", title: "No sales yet", example: "dashboard-1-no-data", trigger: "state=\"empty\"", note: "A clear message that there is nothing yet. emptyState sets the copy and can add an action." },
    { id: "error", title: "Could not load", example: "dashboard-1-error", trigger: "state=\"error\"", note: "An error with a Try again button (onRetry), announced as an alert." },
  ],
  ai: {
    summary: "The first screen of a store or SaaS admin. Pass getSeries(range) returning { label, revenue, previous, orders }[], plus channels, orders and currency; the KPIs, deltas and chart are derived from the series.",
    whenToUse: ["Admin home pages", "Sales, billing and usage overviews"],
    whenNotToUse: ["Traffic analytics (use dashboard-2)"],
    composesWith: ["app-shell-1", "dashboard-2", "billing-1", "settings-1"],
    a11y: [
      { keys: "Arrow Left / Right", action: "Changes the date range" },
      { keys: "Chart", action: "Labelled figure with a plain-language summary; the same numbers are in the KPI cards and the table" },
      { keys: "Tab", action: "The orders table scrolls sideways on phones and is focusable" },
    ],
    customization: ["getSeries(range) for your own data", "channels, orders, currency, locale", "onRangeChange to fetch", "state: \"ready\" | \"loading\" | \"empty\" | \"error\"; onRetry, emptyState and errorState set the retry action and the copy. Pair with useResource: state={r.state} onRetry={r.retry}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (loading, empty, error) with onRetry, emptyState and errorState: a skeleton of the cards, chart and tables under the real heading, an error with retry, and an empty message. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
