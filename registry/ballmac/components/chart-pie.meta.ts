import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "chart-pie",
  type: "registry:ui",
  title: "Chart Pie",
  description:
    "A pie or donut with the total in the hole, outside labels, a pulled-out slice and a half ring, in a frame with a legend that switches slices off, a table of value and share, a written ranking, patterns and states.",
  category: "data-display",
  tags: ["chart", "pie", "donut", "share", "proportion", "gauge", "recharts", "graph"],
  files: [{ path: "components/chart-pie.tsx" }],
  dependencies: ["recharts@^3"],
  registryDependencies: ["chart", "chart-frame", "i18n"],
  examples: [
    { name: "chart-pie-demo", title: "Donut with the total", file: "chart-pie-demo.tsx" },
    { name: "chart-pie-full", title: "Full pie with labels", file: "chart-pie-full.tsx" },
    { name: "chart-pie-half", title: "Half ring", file: "chart-pie-half.tsx" },
    { name: "chart-pie-highlight", title: "A pulled-out slice", file: "chart-pie-highlight.tsx" },
    { name: "chart-pie-patterns", title: "Patterns for color blindness", file: "chart-pie-patterns.tsx" },
    { name: "chart-pie-center", title: "A goal ring with your own center", file: "chart-pie-center.tsx" },
  ],
  ai: {
    summary:
      "<ChartPie title description data={[{ name, label?, value, color? }]} valueLabel='visitors' />. donut (default) or donut={false}; half for a semicircle; centerLabel (true writes the total; or { value, label }); labels='outside'; highlight (a slice name); gap; legend; patterns; state. The legend switches slices off and the total and shares follow. Slices are rows, not series.",
    whenToUse: ["A few parts of one whole (up to about six)", "A goal or quota ring (two slices, custom centerLabel)"],
    whenNotToUse: ["More than six categories or exact comparison (use chart-bar with layout='bars')", "Change over time (use chart-area or chart-line)"],
    composesWith: ["chart-frame", "stat-card"],
    a11y: [
      { keys: "Arrow keys", action: "Move between slices (accessibilityLayer)" },
      { keys: "Tab, Enter / Space", action: "Legend buttons switch slices off and on; the Chart / Table switch shows value and share as a table" },
      { keys: "Screen readers", action: "The summary lists every slice with its share and value, largest first" },
    ],
    customization: ["donut, half and gap", "slice colors through `color` or the theme's chart colors", "centerLabel for a custom total", "valueFormatter for units"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
