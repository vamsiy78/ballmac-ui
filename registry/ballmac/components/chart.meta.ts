import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "chart",
  type: "registry:ui",
  title: "Chart",
  description:
    "Theme-aware chart wrapper for Recharts with token colors, a styled tooltip and legend, a named figure with a screen-reader summary, and keyboard navigation.",
  category: "data-display",
  tags: ["chart", "recharts", "graph", "data"],
  files: [{ path: "components/chart.tsx" }],
  dependencies: ["recharts@^3"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "chart-demo", title: "Revenue area chart", file: "chart-demo.tsx" },
    { name: "chart-bars", title: "Grouped bars", file: "chart-bars.tsx" },
    { name: "chart-donut", title: "Donut", file: "chart-donut.tsx" },
  ],
  ai: {
    summary:
      "Wrap any Recharts chart in ChartContainer with a config of label and color per series. Use ChartTooltipContent and ChartLegendContent. Always pass label and summary.",
    whenToUse: ["Dashboards and reports", "Trends, comparisons and proportions"],
    whenNotToUse: ["A tiny inline trend; use sparkline", "A single ring value; use progress-ring"],
    composesWith: ["card", "stat-card"],
    a11y: [
      { keys: "Arrow keys", action: "Move between data points (accessibilityLayer)" },
      { keys: "Screen readers", action: "Read the figure name and summary" },
    ],
    customization: ["config colors via chart tokens", "tooltip indicator: dot | line | dashed", "legend content", "summary text for assistive tech"],
  },
  source: {
    name: "shadcn/ui Chart",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.1.0",
  updated: "2026-10-18",
  changelog: [
    { version: "1.1.0", date: "2026-10-18", note: "Adds ChartCenterLabel and a `format` prop on ChartContainer, groups tooltip numbers by the locale (useLocale) and looks a series up by what `nameKey` points at first, which fixes pie legends. No prop was removed." },
  ],
});
