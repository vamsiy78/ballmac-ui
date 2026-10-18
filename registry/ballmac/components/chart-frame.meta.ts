import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "chart-frame",
  type: "registry:ui",
  title: "Chart Frame",
  description:
    "The card around a Recharts chart: a Table view with CSV download, a legend that toggles series, patterns so series differ by more than color, a summary for screen readers, and loading, empty and error states.",
  category: "data-display",
  tags: ["chart", "recharts", "table", "accessibility", "legend", "patterns", "csv", "states", "graph"],
  files: [{ path: "components/chart-frame.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "chart", "segmented-control", "skeleton", "state-view", "toggle", "direction", "i18n"],
  examples: [
    { name: "chart-frame-demo", title: "Lines with a table view", file: "chart-frame-demo.tsx" },
    { name: "chart-frame-loading", title: "Loading", file: "chart-frame-loading.tsx" },
    { name: "chart-frame-empty", title: "No data yet", file: "chart-frame-empty.tsx" },
    { name: "chart-frame-error", title: "Could not load", file: "chart-frame-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "chart-frame-loading", trigger: 'state="loading"', note: "A skeleton in the shape of the chart (area, bars, donut, lines or radar), under the real title." },
    { id: "empty", title: "No data yet", example: "chart-frame-empty", trigger: 'state="empty" (or data={[]})', note: "Says when the chart will appear; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "chart-frame-error", trigger: 'state="error"', note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "Wrap any Recharts chart: <ChartFrame title description data xKey series={[{ key, label }]}>{(chart) => <LineChart>…</LineChart>}</ChartFrame>. Use chart.color(key) for strokes, chart.fill(key) for fills, chart.isHidden(key) for `hide`, chart.defs in <defs>, chart.animate for isAnimationActive and chart.rtl to reverse the x axis. The frame adds a Chart/Table switch, a CSV download, a toggling legend, optional patterns, a written summary and state handling. Prefer the ready-made ChartArea, ChartBar, ChartLine, ChartPie, ChartRadar, ChartRadial or ChartScatter when one fits.",
    whenToUse: ["Any chart that people need to read, compare or export", "A custom Recharts chart that should be accessible and handle loading and errors"],
    whenNotToUse: ["A tiny inline trend (use sparkline)", "A single ring value (use progress-ring)"],
    composesWith: ["chart", "segmented-control", "stat-card"],
    a11y: [
      { keys: "Tab, Enter / Space", action: "Each legend item is a button that switches its series off or on (at least one stays on)" },
      { keys: "Chart / Table switch", action: "Shows the same numbers as an accessible table with row and column headers, and a CSV download" },
      { keys: "Screen readers", action: "The figure has a name and a summary written from the data (first to last, highest and lowest, or a ranking); pass summary to say what it means" },
      { keys: "Patterns", action: "Series are filled with stripes, dots and hatching as well as color, so color is never the only signal" },
    ],
    customization: ["legend: toggle | static | none", "patterns: true | 'toggle'", "aspect: video | wide | panorama | square | tall", "valueFormatter and categoryFormatter write numbers and categories everywhere", "table: your own columns for charts whose data is not one column per series"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
