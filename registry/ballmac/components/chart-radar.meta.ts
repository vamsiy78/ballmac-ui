import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "chart-radar",
  type: "registry:ui",
  title: "Chart Radar",
  description:
    "A radar chart with filled or outlined shapes, polygon or circular rings, dots and a fixed scale, in a frame with a legend that switches series off, a table of every axis, patterns and states.",
  category: "data-display",
  tags: ["chart", "radar", "spider", "comparison", "scorecard", "recharts", "graph"],
  files: [{ path: "components/chart-radar.tsx" }],
  dependencies: ["recharts@^3"],
  registryDependencies: ["chart", "chart-frame"],
  examples: [
    { name: "chart-radar-demo", title: "One series", file: "chart-radar-demo.tsx" },
    { name: "chart-radar-compare", title: "Two series with the scale", file: "chart-radar-compare.tsx" },
    { name: "chart-radar-circle", title: "Circular rings, outlines and dots", file: "chart-radar-circle.tsx" },
    { name: "chart-radar-patterns", title: "Patterns for color blindness", file: "chart-radar-patterns.tsx" },
  ],
  ai: {
    summary:
      "<ChartRadar title description data xKey series={[{ key, label, color? }]} />. fillShape (false draws outlines), dots, grid: polygon | circle | none, domain ([0, 100]), scale (write the scale), legend, patterns, state and every ChartFrame prop.",
    whenToUse: ["Comparing a few things across the same 5 to 8 dimensions", "Scorecards and profiles"],
    whenNotToUse: ["Precise comparison of values (use chart-bar)", "More than three or four overlapping series"],
    composesWith: ["chart-frame", "stat-card"],
    a11y: [
      { keys: "Arrow keys", action: "Move between axes (accessibilityLayer)" },
      { keys: "Tab, Enter / Space", action: "Legend buttons switch series off and on; the Chart / Table switch shows the numbers as a table" },
      { keys: "Screen readers", action: "The figure has a name and a summary written from the data" },
    ],
    customization: ["fillShape and dots", "grid and domain", "series colors"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
