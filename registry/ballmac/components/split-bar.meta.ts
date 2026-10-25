import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "split-bar",
  type: "registry:ui",
  title: "Split Bar",
  description:
    "One bar cut into shares with a legend that says the same in numbers. Pointing at a legend row lights its slice and dims the rest, and choosing it keeps it lit.",
  category: "data-display",
  tags: ["chart", "share", "stacked", "composition", "budget", "breakdown", "legend"],
  files: [{ path: "components/split-bar.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "split-bar-demo", title: "Where the spend goes", file: "split-bar-demo.tsx" },
    { name: "split-bar-two", title: "Two shares", file: "split-bar-two.tsx" },
  ],
  ai: {
    summary:
      "segments is [{ id, label, value, hint? }]; title, total (text above the bar), format(value). The legend lists every segment with its value and percent; hover or focus lights a slice, and a click keeps it lit (aria-pressed).",
    whenToUse: ["Breaking a total into a handful of parts", "Spend, storage, traffic or time splits"],
    whenNotToUse: ["Many parts or nested parts; use treemap", "Ranking; use bar-list"],
    composesWith: ["bar-list", "treemap", "stat-card", "waterfall-chart"],
    a11y: [
      { keys: "Legend", action: "The accessible version: buttons with label, value and percent; pressed state" },
      { keys: "Bar", action: "Decoration only" },
      { keys: "Color", action: "Never the only way to tell parts apart" },
    ],
    customization: ["segments and title", "total and format"],
  },
  statesNone: "A presentational chart: the segments are passed in, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
