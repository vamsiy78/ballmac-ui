import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "run-ledger",
  type: "registry:ui",
  title: "Run Ledger",
  description:
    "What an agent run cost, step by step: sortable time, tokens and money with each row's share, a total, the most expensive step marked, and an optional budget meter that warns in words.",
  category: "ai",
  tags: ["ai", "agents", "cost", "usage", "ledger", "budget", "tokens", "table"],
  files: [{ path: "components/run-ledger.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "run-ledger-demo", title: "A run with a budget", file: "run-ledger-demo.tsx" },
    { name: "run-ledger-over", title: "Over budget", file: "run-ledger-over.tsx" },
  ],
  ai: {
    summary:
      "rows is [{ id, label, kind?, tokensIn?, tokensOut?, ms, cost }] with cost as a number in currency (default USD). Optional budget (same currency), warnAt (80), locale (en-US), defaultSort. Columns sort by label, time, tokens or cost; totals are computed.",
    whenToUse: ["Showing where an agent run's time and money went", "A cost breakdown people check before approving a repeat run"],
    whenNotToUse: ["Plan quotas and billing limits; use usage-meter", "The context window; use token-meter", "A general data table; use data-table"],
    composesWith: ["token-meter", "agent-lanes", "parallel-attempts", "trace"],
    a11y: [
      { keys: "Tab", action: "Reaches each column's sort button" },
      { keys: "Enter / Space", action: "Sorts by the column, then reverses; aria-sort says which way" },
      { keys: "Screen readers", action: "A real table with a caption, row headers and a total row; the budget is a meter with a value such as '$4.20 of $5.00. 80 cents left in the budget.'" },
      { keys: "Colour", action: "The warning and over-budget states add an icon and words; the top cost row says 'Most expensive'" },
    ],
    customization: ["currency and locale", "budget and warnAt", "defaultSort", "kind text on each row"],
  },
  statesNone: "A presentational breakdown: the rows are passed in, so it has nothing of its own to load or submit.",
  version: "1.0.0",
  updated: "2026-10-24",
})
