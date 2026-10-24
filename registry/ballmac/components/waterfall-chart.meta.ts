import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "waterfall-chart",
  type: "registry:ui",
  title: "Waterfall Chart",
  description:
    "A waterfall or bridge chart from a start to an end: floating bars for increases and decreases with a + or − sign as well as colour, totals on the baseline, connectors, real HTML labels and a table of the numbers for screen readers.",
  category: "data-display",
  tags: ["waterfall", "bridge", "chart", "variance", "revenue", "finance", "cost", "change"],
  files: [{ path: "components/waterfall-chart.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "waterfall-chart-demo", title: "Monthly recurring revenue", file: "waterfall-chart-demo.tsx" },
    { name: "waterfall-chart-negative", title: "Crossing zero", file: "waterfall-chart-negative.tsx" },
  ],
  ai: {
    summary:
      "steps is [{ id, label, value, kind?: 'change' | 'total' }]. A change floats from where the last step ended (positive is an increase, negative a decrease); a total sits on the baseline and resets the running total. format(value), height, title. Exports buildBars(steps). Server-rendered, no client code.",
    whenToUse: ["Explaining how a number moved from one value to another: revenue, headcount, cost", "A variance or bridge between two periods"],
    whenNotToUse: ["Showing a trend; use chart-line", "Parts of a whole; use treemap or chart-pie", "Steps with drop-off between stages; use flow-sankey"],
    composesWith: ["stat-card", "bullet-chart", "chart-frame", "run-ledger"],
    a11y: [
      { keys: "Screen readers", action: "The bars are decoration; a table lists each step with its change (+ or − and increase or decrease) and the total after it" },
      { keys: "Signs", action: "Increases and decreases are written with + and − on the bars, so colour is never the only signal" },
    ],
    customization: ["height", "title", "format", "totals in the middle for sub-totals"],
  },
  statesNone: "A presentational chart: you pass the steps in, so it has nothing of its own to load or fail.",
  version: "1.0.0",
  updated: "2026-10-24",
})
