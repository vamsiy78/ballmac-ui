import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "flow-sankey",
  type: "registry:ui",
  title: "Flow Sankey",
  description:
    "A dependency-free flow diagram: columns placed by the longest chain, crossings reduced, links as thick as their value, nodes as buttons that light up their flows, a detail line, and the same flows as a table for screen readers.",
  category: "data-display",
  tags: ["sankey", "flow", "funnel", "chart", "journey", "diagram", "conversion", "attribution"],
  files: [{ path: "components/flow-sankey.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "flow-sankey-demo", title: "Where sign-ups go", file: "flow-sankey-demo.tsx" },
    { name: "flow-sankey-agent", title: "An agent run's outcomes", file: "flow-sankey-agent.tsx" },
  ],
  ai: {
    summary:
      "nodes is [{ id, label, group? }]; links is [{ source, target, value }]. Columns, order and sizes are computed (layoutSankey is exported). format(value), selected / defaultSelected / onSelectedChange. Links with zero value, unknown ids or a node linking to itself are ignored.",
    whenToUse: ["Showing where traffic, money or users go step by step, with drop-off", "Outcomes of agent runs: attempts, tool calls, approvals, results"],
    whenNotToUse: ["A simple conversion funnel of one path; use funnel-1", "Proportions with no steps; use treemap", "A graph where cycles matter; use agent-graph"],
    composesWith: ["treemap", "run-ledger", "chart-frame", "heat-grid"],
    a11y: [
      { keys: "Tab", action: "Enters the diagram once, on the first node (or the selected one)" },
      { keys: "ArrowDown / ArrowUp", action: "Next or previous node in the same column" },
      { keys: "ArrowRight / ArrowLeft", action: "The nearest node in the next or previous column" },
      { keys: "Enter / Space", action: "Selects the node and shows its totals in a polite live region" },
      { keys: "Screen readers", action: "Each node reads 'Search: 12,400 in, 11,900 out'; every flow is also in a hidden table with From, To and Amount" },
    ],
    customization: ["format", "group colours follow the order groups first appear (chart 1 to 5)", "layoutSankey is exported for custom drawing"],
  },
  statesNone: "A presentational chart: you pass the nodes and links in, so it has nothing of its own to load or fail.",
  version: "1.0.1",
  updated: "2026-10-25",
  changelog: [
    { version: "1.0.1", date: "2026-10-25", note: "Fits inside its column on a phone." },
    { version: "1.0.0", date: "2026-10-24", note: "First release." },
  ],
})
