import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "dashboard-2",
  type: "registry:block",
  title: "Dashboard 2: traffic analytics",
  description: "A web analytics page: a live-now pill, date range and compare switch, a visitors line chart against the previous period, traffic sources as a donut, devices, top countries and a top-pages table.",
  category: "blocks",
  blockCategory: "dashboard",
  tags: ["dashboard", "analytics", "traffic", "line chart", "donut", "visitors", "web"],
  files: [{ path: "components/blocks/dashboard-2/dashboard-2.tsx" }],
  dependencies: ["lucide-react", "recharts@^3"],
  registryDependencies: ["shadcn:utils", "chart", "segmented-control", "status-dot", "switch", "i18n", "state-view", "skeleton"],
  examples: [
    { name: "dashboard-2-demo", title: "Default", file: "dashboard-2-demo.tsx" },
    { name: "dashboard-2-week", title: "Compact, no live pill", file: "dashboard-2-week.tsx" },
    { name: "dashboard-2-loading", title: "Loading", file: "dashboard-2-loading.tsx" },
    { name: "dashboard-2-error", title: "Could not load", file: "dashboard-2-error.tsx" },
    { name: "dashboard-2-no-data", title: "No traffic yet", file: "dashboard-2-no-data.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "dashboard-2-loading", trigger: "state=\"loading\"", note: "A skeleton with the same shapes as the ready view, announced as loading; nothing is clickable." },
    { id: "empty", title: "No traffic yet", example: "dashboard-2-no-data", trigger: "state=\"empty\"", note: "A clear message that there is nothing yet. emptyState sets the copy and can add an action." },
    { id: "error", title: "Could not load", example: "dashboard-2-error", trigger: "state=\"error\"", note: "An error with a Try again button (onRetry), announced as an alert." },
  ],
  ai: {
    summary: "A traffic dashboard. Pass getSeries(range) returning { label, visitors, previous }[], plus sources, devices, pages, countries and live (null hides the pill).",
    whenToUse: ["Site and product analytics", "Marketing performance pages"],
    whenNotToUse: ["Sales and revenue (use dashboard-1)"],
    composesWith: ["app-shell-1", "dashboard-1", "settings-1"],
    a11y: [
      { keys: "Arrow Left / Right", action: "Changes the date range" },
      { keys: "Compare switch", action: "Shows or hides the dashed previous-period line; the legend appears with it" },
      { keys: "Charts", action: "Each chart is a labelled figure with a text summary; sources, devices and countries are also listed as text with their values" },
    ],
    customization: ["getSeries, sources, devices, pages, countries", "live: number | null", "locale", "state: \"ready\" | \"loading\" | \"empty\" | \"error\"; onRetry, emptyState and errorState set the retry action and the copy. Pair with useResource: state={r.state} onRetry={r.retry}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (loading, empty, error) with onRetry, emptyState and errorState: a skeleton of the cards, chart and tables under the real heading, an error with retry, and an empty message. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
