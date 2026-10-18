import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "chart-line",
  type: "registry:ui",
  title: "Chart Line",
  description:
    "A line chart with four curves, dots or value labels, dashed series, labels at the end of each line instead of a legend and gaps for missing data, in a frame with a table view, a toggling legend, patterns and states.",
  category: "data-display",
  tags: ["chart", "line", "trend", "timeseries", "forecast", "recharts", "graph"],
  files: [{ path: "components/chart-line.tsx" }],
  dependencies: ["recharts@^3"],
  registryDependencies: ["chart", "chart-frame"],
  examples: [
    { name: "chart-line-demo", title: "Two series", file: "chart-line-demo.tsx" },
    { name: "chart-line-dots", title: "Linear with dots", file: "chart-line-dots.tsx" },
    { name: "chart-line-dashed", title: "Actual against plan", file: "chart-line-dashed.tsx" },
    { name: "chart-line-direct", title: "Labels on the lines", file: "chart-line-direct.tsx" },
    { name: "chart-line-labels", title: "Value labels", file: "chart-line-labels.tsx" },
    { name: "chart-line-step", title: "Step", file: "chart-line-step.tsx" },
    { name: "chart-line-gaps", title: "Gaps for missing data", file: "chart-line-gaps.tsx" },
    { name: "chart-line-compare", title: "Five series with patterns", file: "chart-line-compare.tsx" },
  ],
  ai: {
    summary:
      "<ChartLine title description data xKey series={[{ key, label, color? }]} />. curve: monotone | linear | step | natural. Also dots, dashed (series keys), directLabels (write names at the line ends and drop the legend), labels (values on points), gaps (null breaks the line), yFormatter, yDomain, referenceLines, legend, patterns, state and every ChartFrame prop.",
    whenToUse: ["Trends where the exact path matters and fills would get in the way", "Several series that cross (use directLabels)", "Forecast against actual (dashed)"],
    whenNotToUse: ["Part-to-whole over time (use chart-area with stack)", "Comparing a few categories (use chart-bar)"],
    composesWith: ["chart-frame", "stat-card", "segmented-control"],
    a11y: [
      { keys: "Arrow keys", action: "Move between data points (accessibilityLayer)" },
      { keys: "Tab, Enter / Space", action: "Legend buttons switch series; the Chart / Table switch shows the numbers as a table" },
      { keys: "Dashes", action: "Dashed lines tell series apart without color; patterns add dash styles to every other line" },
    ],
    customization: ["curve, dots and strokeWidth", "dashed for forecasts", "directLabels instead of a legend", "gaps to keep missing data visible"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
