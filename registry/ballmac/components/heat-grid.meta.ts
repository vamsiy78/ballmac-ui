import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "heat-grid",
  type: "registry:ui",
  title: "Heat Grid",
  description:
    "A matrix of values shaded by size, such as models against test cases or services against regions: a real ARIA grid with arrow-key navigation, value text in every cell, a tone mode with icons and words, hatched empty cells and a legend.",
  category: "data-display",
  tags: ["heatmap", "matrix", "grid", "evals", "status", "comparison", "chart", "table"],
  files: [{ path: "components/heat-grid.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "direction", "i18n"],
  examples: [
    { name: "heat-grid-demo", title: "Shaded by value", file: "heat-grid-demo.tsx" },
    { name: "heat-grid-tone", title: "Pass, warn, fail", file: "heat-grid-tone.tsx" },
  ],
  ai: {
    summary:
      "rows and columns are [{ id, label }]; values is number[][] (rows then columns, null for no data). domain [min, max], format(value), selected / onSelectedChange as [row, col]. tone(value) returns 'good' | 'warn' | 'bad' to classify instead of shade; those cells also show an icon and a word.",
    whenToUse: ["Comparing many things against many conditions at a glance", "Eval results, service health by region, usage by hour and weekday"],
    whenNotToUse: ["A trend over time; use chart-line or sparkline", "Exact records people sort and filter; use data-table", "A calendar of activity; use contribution-graph"],
    composesWith: ["chart-frame", "data-table", "agent-roster", "run-ledger"],
    a11y: [
      { keys: "Tab", action: "Enters the grid once, on one cell" },
      { keys: "Arrow keys", action: "Move between cells (left and right swap in right-to-left); Home and End go to the row ends, with Ctrl to the grid corners" },
      { keys: "Enter / Space", action: "Chooses the cell and reports it" },
      { keys: "Screen readers", action: "A grid with row and column headers; each cell reads 'Model A, Case 3: 92, Good' and an empty cell reads 'No data'" },
      { keys: "Colour", action: "Every value is text; tone cells add an icon and a word" },
    ],
    customization: ["domain and format", "tone for pass, warn and fail", "rowLabel and columnLabel", "Controlled selection"],
  },
  statesNone: "A presentational chart: you pass the values in, so it has nothing of its own to load or fail.",
  version: "1.0.0",
  updated: "2026-10-24",
})
