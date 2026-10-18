import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "chart-bar",
  type: "registry:ui",
  title: "Chart Bar",
  description:
    "A bar chart with upright columns or flat bars, grouped, stacked or expanded to 100%, value labels, one color per category, a highlight, negative coloring and sorting, in a frame with a table view, patterns and states.",
  category: "data-display",
  tags: ["chart", "bar", "column", "stacked", "ranking", "comparison", "recharts", "graph"],
  files: [{ path: "components/chart-bar.tsx" }],
  dependencies: ["recharts@^3"],
  registryDependencies: ["shadcn:utils", "chart", "chart-frame", "i18n"],
  examples: [
    { name: "chart-bar-demo", title: "Grouped columns", file: "chart-bar-demo.tsx" },
    { name: "chart-bar-horizontal", title: "Flat bars with labels", file: "chart-bar-horizontal.tsx" },
    { name: "chart-bar-stacked", title: "Stacked", file: "chart-bar-stacked.tsx" },
    { name: "chart-bar-expanded", title: "Expanded to 100%", file: "chart-bar-expanded.tsx" },
    { name: "chart-bar-labels", title: "Value labels and a highlight", file: "chart-bar-labels.tsx" },
    { name: "chart-bar-categories", title: "One color per category", file: "chart-bar-categories.tsx" },
    { name: "chart-bar-negative", title: "Positive and negative", file: "chart-bar-negative.tsx" },
    { name: "chart-bar-ranked", title: "Ranking", file: "chart-bar-ranked.tsx" },
    { name: "chart-bar-patterns", title: "Patterns for color blindness", file: "chart-bar-patterns.tsx" },
  ],
  ai: {
    summary:
      "<ChartBar title description data xKey series={[{ key, label, color? }]} />. layout: columns | bars (flat, for long names). stack: none | stacked | expanded. Also labels, colorBy ('category' for one color per bar), highlight, negativeColor, sort, gap, valueAxis, axisFormatter, referenceLines, legend, patterns, state and every ChartFrame prop.",
    whenToUse: ["Comparing values across categories", "Rankings (layout='bars', sort='descending')", "Parts of a whole across groups (stack)"],
    whenNotToUse: ["A trend over time with many points (use chart-area or chart-line)", "A single share of a whole (use chart-pie or chart-radial)"],
    composesWith: ["chart-frame", "stat-card", "segmented-control"],
    a11y: [
      { keys: "Arrow keys", action: "Move between bars (accessibilityLayer)" },
      { keys: "Tab, Enter / Space", action: "Legend buttons switch series or categories; the Chart / Table switch shows the numbers as a table" },
    ],
    customization: ["layout, stack, radius and gap", "highlight to emphasize one category", "negativeColor for gains and losses", "labels with valueAxis={false} for a cleaner look"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
