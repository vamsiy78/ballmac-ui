import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "bar-list",
  type: "registry:ui",
  title: "Bar List",
  description:
    "A ranked list of bars with the name and number on top of the bar, so both stay readable at any width. Rows can be links or buttons, a long list folds to its top few, and every value is real text.",
  category: "data-display",
  tags: ["chart", "ranking", "top list", "analytics", "bars", "dashboard", "leaderboard"],
  files: [{ path: "components/bar-list.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "bar-list-demo", title: "Top pages with links and a fold", file: "bar-list-demo.tsx" },
    { name: "bar-list-select", title: "Rows as filter buttons", file: "bar-list-select.tsx" },
  ],
  ai: {
    summary:
      "items is [{ id, label, value, href?, icon?, hint? }]. Sorted by value unless sort is false. title, format(value), showShare (percent of total), limit (folds the rest behind a Show N more button). href makes a row a link; onSelect(id) with selected makes rows toggle buttons. The bar is decoration behind real text.",
    whenToUse: ["Top pages, sources, countries, products or errors in an analytics view", "A leaderboard where the label matters more than the shape"],
    whenNotToUse: ["Comparing a few values precisely over time; use chart-bar", "Part-to-whole with many parts; use treemap or split-bar"],
    composesWith: ["split-bar", "funnel-chart", "stat-card", "kpi-row"],
    a11y: [
      { keys: "List", action: "An ordered list; each row also says 'Number n' for screen readers" },
      { keys: "Rows", action: "Links and buttons are native; buttons have pressed state" },
      { keys: "Fold", action: "A button with aria-expanded" },
      { keys: "Values", action: "Written as text, with the share as a percent if asked, so nothing depends on bar length" },
    ],
    customization: ["items and title", "format, showShare", "limit", "onSelect and selected"],
  },
  statesNone: "A presentational list: the items are passed in, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
