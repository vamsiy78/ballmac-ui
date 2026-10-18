import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "chart-radial",
  type: "registry:ui",
  title: "Chart Radial",
  description:
    "Radial bars: one ring is a gauge, several are concentric progress rings. Full or half circle, a track, text in the middle, in a frame with a table, patterns and states.",
  category: "data-display",
  tags: ["chart", "radial", "gauge", "ring", "progress", "goal", "recharts", "graph"],
  files: [{ path: "components/chart-radial.tsx" }],
  dependencies: ["recharts@^3"],
  registryDependencies: ["chart", "chart-frame", "i18n"],
  examples: [
    { name: "chart-radial-demo", title: "A goal gauge", file: "chart-radial-demo.tsx" },
    { name: "chart-radial-rings", title: "Concentric rings", file: "chart-radial-rings.tsx" },
    { name: "chart-radial-half", title: "Half-circle gauge", file: "chart-radial-half.tsx" },
    { name: "chart-radial-patterns", title: "Patterns for color blindness", file: "chart-radial-patterns.tsx" },
  ],
  ai: {
    summary:
      "<ChartRadial title description data={[{ name, label?, value, color? }]} max={100} />. One row is a gauge, several rows are concentric rings. half for a semicircle, centerLabel (true writes the first ring's share, or { value, label }), track, valueLabel, legend, patterns, state.",
    whenToUse: ["Progress toward a goal", "A single metric against its maximum", "Activity or goal rings"],
    whenNotToUse: ["Parts of a whole (use chart-pie)", "Comparing many categories (use chart-bar)"],
    composesWith: ["chart-frame", "stat-card", "progress-ring"],
    a11y: [
      { keys: "Screen readers", action: "The summary reads every ring as 'value of max (share)'" },
      { keys: "Tab, Enter / Space", action: "Legend buttons switch series off and on; the Chart / Table switch shows the numbers as a table" },
      { keys: "Screen readers", action: "The figure has a name and a summary written from the data" },
    ],
    customization: ["half and track", "max (the full ring)", "per-ring colors"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
