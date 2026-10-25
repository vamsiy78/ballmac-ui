import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "treemap",
  type: "registry:ui",
  title: "Treemap",
  description:
    "A dependency-free treemap: each item is a rectangle sized by its share of the whole in a squarified layout, with real text on the cells, group colours and a legend with totals, and arrow keys that move to the nearest cell.",
  category: "data-display",
  tags: ["treemap", "chart", "proportion", "share", "composition", "context window", "disk usage"],
  files: [{ path: "components/treemap.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "direction", "i18n"],
  examples: [
    { name: "treemap-demo", title: "Cloud spend by service", file: "treemap-demo.tsx" },
    { name: "treemap-context", title: "What fills a context window", file: "treemap-context.tsx" },
  ],
  ai: {
    summary:
      "items is [{ id, label, value, group?, detail? }]; zero or negative values are dropped. format(value), unit, aspect (width over height, default 16/9), selected / defaultSelected / onSelectedChange. Exports squarify(items, w, h) for your own layouts.",
    whenToUse: ["Showing how a whole divides into many parts of very different size", "Disk, cost, token or traffic breakdowns"],
    whenNotToUse: ["A handful of parts; use chart-pie or a bar list", "A change over time; use chart-area", "Flows between steps; use flow-sankey"],
    composesWith: ["token-meter", "run-ledger", "chart-frame", "heat-grid"],
    a11y: [
      { keys: "Tab", action: "Enters the chart once, on the largest cell (or the selected one)" },
      { keys: "Arrow keys", action: "Move to the nearest cell in that direction (left and right swap in right-to-left); Home and End go to the largest and smallest" },
      { keys: "Enter / Space", action: "Selects the cell; again to clear it" },
      { keys: "Screen readers", action: "Each cell reads 'Compute: 4,210 USD, 38.2% of the total, Production'; the selected item is a polite live region" },
    ],
    customization: ["aspect", "format and unit", "group colours follow the order groups first appear (chart 1 to 5)", "squarify is exported"],
  },
  statesNone: "A presentational chart: you pass the items in, so it has nothing of its own to load or fail.",
  version: "1.0.1",
  updated: "2026-10-25",
  changelog: [
    { version: "1.0.1", date: "2026-10-25", note: "Keeps a minimum height on a phone so small blocks stay readable." },
    { version: "1.0.0", date: "2026-10-24", note: "First release." },
  ],
})
