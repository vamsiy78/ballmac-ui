import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "dumbbell-chart",
  type: "registry:ui",
  title: "Dumbbell Chart",
  description:
    "Before and after for many things at once: two dots on one scale with a line between, colored by whether the change is good. Every row also says it in words, such as up 8, better.",
  category: "data-display",
  tags: ["chart", "comparison", "before after", "benchmark", "change", "dumbbell", "analytics"],
  files: [{ path: "components/dumbbell-chart.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "dumbbell-chart-demo", title: "Answers rated helpful, by topic", file: "dumbbell-chart-demo.tsx" },
    { name: "dumbbell-chart-lower", title: "Response time, lower is better", file: "dumbbell-chart-lower.tsx" },
  ],
  ai: {
    summary:
      "rows is [{ id, label, before, after }]. beforeLabel and afterLabel name the dots; lowerIsBetter flips which direction is good; format(value); title. Each row writes 'before → after' and 'up N, better' or 'down N, worse' or 'no change'; the line color only repeats it.",
    whenToUse: ["Comparing two versions, periods or models across several measures", "Benchmarks and A/B results"],
    whenNotToUse: ["Change over many points in time; use chart-line", "One number against a target; use bullet-chart"],
    composesWith: ["bar-list", "eval-scorecard", "model-compare", "stat-card"],
    a11y: [
      { keys: "Rows", action: "Each row's change is text with better or worse" },
      { keys: "Chart", action: "The dots and line are decoration" },
      { keys: "Legend", action: "Named dots above the rows" },
    ],
    customization: ["rows", "beforeLabel and afterLabel", "lowerIsBetter", "format and title"],
  },
  statesNone: "A presentational chart: the rows are passed in, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
