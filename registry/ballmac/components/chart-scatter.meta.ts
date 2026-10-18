import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "chart-scatter",
  type: "registry:ui",
  title: "Chart Scatter",
  description:
    "A scatter or bubble chart with grouped colors, point sizes from a third number and titled axes, in a frame with a toggling legend, a table of every point with CSV download, and states.",
  category: "data-display",
  tags: ["chart", "scatter", "bubble", "correlation", "distribution", "recharts", "graph"],
  files: [{ path: "components/chart-scatter.tsx" }],
  dependencies: ["recharts@^3"],
  registryDependencies: ["chart", "chart-frame", "i18n"],
  examples: [
    { name: "chart-scatter-demo", title: "One group", file: "chart-scatter-demo.tsx" },
    { name: "chart-scatter-groups", title: "Groups by color", file: "chart-scatter-groups.tsx" },
    { name: "chart-scatter-bubble", title: "Bubbles sized by a third number", file: "chart-scatter-bubble.tsx" },
  ],
  ai: {
    summary:
      "<ChartScatter title description data xKey yKey xLabel yLabel /> with optional zKey (point size), groupKey plus groups ([{ key, label, color? }]), nameKey, xDomain, yDomain, sizeRange, formatters, legend, patterns, state. Every row is one point.",
    whenToUse: ["Relationships between two numbers", "Distributions and outliers", "Bubble charts with a third measure"],
    whenNotToUse: ["Trends over time (use chart-line)", "Categories with one value each (use chart-bar)"],
    composesWith: ["chart-frame"],
    a11y: [
      { keys: "Arrow keys", action: "Move between points (accessibilityLayer)" },
      { keys: "Tab, Enter / Space", action: "Legend buttons switch series off and on; the Chart / Table switch shows the numbers as a table" },
      { keys: "Screen readers", action: "The figure has a name and a summary written from the data" },
      { keys: "Table", action: "Every point, with its name, group and values, in a table you can download as CSV" },
    ],
    customization: ["groups and colors", "zKey and sizeRange for bubbles", "xDomain and yDomain"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
