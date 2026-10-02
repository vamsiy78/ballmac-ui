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
  registryDependencies: ["shadcn:utils", "chart", "segmented-control", "status-dot", "switch", "i18n"],
  examples: [
    { name: "dashboard-2-demo", title: "Default", file: "dashboard-2-demo.tsx" },
    { name: "dashboard-2-week", title: "Compact, no live pill", file: "dashboard-2-week.tsx" },
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
    customization: ["getSeries, sources, devices, pages, countries", "live: number | null", "locale"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
