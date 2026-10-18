import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "portfolio-1",
  type: "registry:block",
  title: "Portfolio 1: investments overview",
  description:
    "An investment portfolio: total value and its change over a week, month or year, a line you scrub by pointer or arrow keys, an allocation ring, and sortable holdings with price, share, day change and a small trend line.",
  category: "blocks",
  blockCategory: "portfolio",
  tags: ["portfolio", "investments", "holdings", "stocks", "finance", "allocation", "wealth", "returns", "dashboard", "assets"],
  files: [{ path: "components/blocks/portfolio-1/portfolio-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "segmented-control", "skeleton", "state-view"],
  examples: [
    { name: "portfolio-1-demo", title: "A month, up", file: "portfolio-1-demo.tsx" },
    { name: "portfolio-1-down", title: "A year, down", file: "portfolio-1-down.tsx" },
    { name: "portfolio-1-loading", title: "Loading", file: "portfolio-1-loading.tsx" },
    { name: "portfolio-1-empty", title: "No holdings", file: "portfolio-1-empty.tsx" },
    { name: "portfolio-1-error", title: "Could not load", file: "portfolio-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "portfolio-1-loading", trigger: "state=\"loading\"", note: "A skeleton chart and table under the real heading, announced as loading." },
    { id: "empty", title: "No holdings", example: "portfolio-1-empty", trigger: "state=\"empty\" (or holdings={[]})", note: "Says holdings appear once an account is added or connected; emptyState sets the copy and can add a button." },
    { id: "error", title: "Could not load", example: "portfolio-1-error", trigger: "state=\"error\"", note: "An alert saying your holdings are safe, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "An investment portfolio. <Portfolio1 holdings={[{ id, symbol, name, kind: 'Stocks', shares, price, dayPct, spark: number[] }]} series={{ '1W': number[], '1M': number[], '1Y': number[] }} currency='USD' locale defaultRange='1M' />. Total value, allocation by kind, each holding's share and today's gain are worked out from holdings; the change over the range comes from the first and last point of the series. The line is a slider (Left, Right, Home, End) that reads out any point. Gains and losses carry a sign and an arrow as well as color.",
    whenToUse: ["An investing or wealth app's overview", "A finance dashboard showing what is held and how it is doing"],
    whenNotToUse: ["A trading screen with order entry", "A single stock price chart with candles"],
    composesWith: ["dashboard-1", "invoice-1", "funnel-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, then Left / Right / Home / End", action: "The value line is a slider; its value text reads the amount and 'point 12 of 30', and a pointer shows the same on hover" },
      { keys: "Sort and filter", action: "Column headers are buttons with aria-sort; type filters say whether they are on; the table is a captioned, focusable region that scrolls on phones" },
      { keys: "Gains and losses", action: "Written as '+0.82%' or '−0.34%' with an up or down arrow, never by color alone; the ring has a text equivalent listing each share" },
    ],
    customization: ["series can hold any of the three ranges; a missing one falls back to the month", "currency and locale format every amount", "The chart and ring keep their direction in right-to-left, like any chart"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
