import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "circular-progress",
  type: "registry:ui",
  title: "Circular Progress",
  description:
    "Concentric progress rings or a 270 degree gauge in theme colors with animated fills, a legend with values and a center slot, for goals, quotas and activity summaries.",
  category: "data-display",
  tags: ["progress", "rings", "gauge", "activity", "chart"],
  files: [{ path: "components/circular-progress.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "circular-progress-demo", title: "Activity rings", file: "circular-progress-demo.tsx" },
    { name: "circular-progress-gauge", title: "Gauge with center content", file: "circular-progress-gauge.tsx" },
  ],
  ai: {
    summary:
      "<CircularProgress rings={[{ label, value, max, tone, display }]} size thickness gap sweep legend>center</CircularProgress>. One ring is role=meter; several are a named group whose value text lists every ring. sweep=270 makes a gauge.",
    whenToUse: ["Daily goals and multi-metric summaries", "Storage, quota or score gauges"],
    whenNotToUse: ["A single small ring in a table (progress-ring)", "Time series (chart)"],
    composesWith: ["progress-ring", "usage-meter", "stat-card"],
    a11y: [
      { keys: "Screen readers", action: "Value text such as Move 74%, Exercise 38%; the legend repeats values as text" },
      { keys: "Color", action: "Each ring is named in the legend; color is not the only cue" },
      { keys: "Reduced motion", action: "Rings are drawn full length at once" },
    ],
    customization: ["rings", "sweep", "thickness and gap", "legend", "duration"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
