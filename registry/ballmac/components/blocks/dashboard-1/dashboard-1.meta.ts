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
  registryDependencies: ["shadcn:utils", "badge", "button", "chart", "segmented-control", "sparkline", "i18n"],
  examples: [
    { name: "dashboard-1-demo", title: "Default", file: "dashboard-1-demo.tsx" },
    { name: "dashboard-1-week", title: "Seven days, your data", file: "dashboard-1-week.tsx" },
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
    customization: ["getSeries(range) for your own data", "channels, orders, currency, locale", "onRangeChange to fetch"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
