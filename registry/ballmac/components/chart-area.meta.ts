import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "chart-area",
  type: "registry:ui",
  title: "Chart Area",
  description:
    "An area chart with gradient, solid or no fill, stacked or expanded to 100%, four curves and reference lines, in a frame with a table view, a legend that toggles series, patterns for color blindness and loading, empty and error states.",
  category: "data-display",
  tags: ["chart", "area", "line", "stacked", "trend", "recharts", "graph", "timeseries"],
  files: [{ path: "components/chart-area.tsx" }],
  dependencies: ["recharts@^3"],
  registryDependencies: ["shadcn:utils", "chart", "chart-frame"],
  examples: [
    { name: "chart-area-demo", title: "Two series with gradient", file: "chart-area-demo.tsx" },
    { name: "chart-area-stacked", title: "Stacked", file: "chart-area-stacked.tsx" },
    { name: "chart-area-expanded", title: "Expanded to 100%", file: "chart-area-expanded.tsx" },
    { name: "chart-area-step", title: "Step", file: "chart-area-step.tsx" },
    { name: "chart-area-dots", title: "Linear with dots", file: "chart-area-dots.tsx" },
    { name: "chart-area-patterns", title: "Patterns for color blindness", file: "chart-area-patterns.tsx" },
    { name: "chart-area-target", title: "Reference line and footer", file: "chart-area-target.tsx" },
    { name: "chart-area-interactive", title: "With a range picker", file: "chart-area-interactive.tsx" },
    { name: "chart-area-states", title: "Loading, empty and error", file: "chart-area-states.tsx" },
  ],
  ai: {
    summary:
      "<ChartArea title description data xKey series={[{ key, label, color? }]} />. curve: monotone | linear | step | natural. stack: none | stacked | expanded (percent). fillMode: gradient | solid | none. Also dots, grid, yFormatter, yDomain, referenceLines, tooltip, legend, patterns, state and every ChartFrame prop. Colors come from the theme's chart colors in order.",
    whenToUse: ["Trends over time, especially more than one series", "Part-to-whole over time (stacked or expanded)"],
    whenNotToUse: ["Comparing a few categories (use chart-bar)", "Exact values matter more than shape (use chart-line with dots or the table view)"],
    composesWith: ["chart-frame", "segmented-control", "stat-card"],
    a11y: [
      { keys: "Arrow keys", action: "Move between data points (accessibilityLayer)" },
      { keys: "Tab, Enter / Space", action: "Legend buttons switch series; the Chart / Table switch shows the same data as a table" },
    ],
    customization: ["curve, stack and fillMode", "series color: any CSS color or token", "yFormatter and valueFormatter for units", "referenceLines for targets and limits", "yDomain to fix the axis"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
