import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "funnel-chart",
  type: "registry:ui",
  title: "Funnel Chart",
  description:
    "A funnel as bars that narrow step by step. Between steps it says how many carried on and how many dropped out, flags the biggest drop, and ends with the overall result as a sentence.",
  category: "data-display",
  tags: ["chart", "funnel", "conversion", "analytics", "steps", "drop-off", "dashboard"],
  files: [{ path: "components/funnel-chart.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "funnel-chart-demo", title: "Visit to purchase, with selection", file: "funnel-chart-demo.tsx" },
    { name: "funnel-chart-static", title: "Three steps", file: "funnel-chart-static.tsx" },
  ],
  ai: {
    summary:
      "steps is [{ id, label, value, hint? }] from first to last. title, format(value). Between steps: '40% carried on, 600 dropped out', and the biggest drop is tagged in words. onSelect(id | null) with selected makes steps toggle buttons. Ends with 'X% of everyone who started reached the end'.",
    whenToUse: ["Checkout, signup or onboarding conversion", "Any process where people drop out between steps"],
    whenNotToUse: ["Steps that can happen in any order; use bar-list", "Flow with branches; use flow-sankey"],
    composesWith: ["bar-list", "stat-card", "kpi-row", "flow-sankey"],
    a11y: [
      { keys: "Steps", action: "An ordered list; drop-off and conversion are text, never only bar length" },
      { keys: "Selection", action: "Optional buttons with pressed state" },
      { keys: "Biggest drop", action: "Tagged with the words 'Biggest drop'" },
    ],
    customization: ["steps and title", "format", "onSelect and selected"],
  },
  statesNone: "A presentational chart: the steps are passed in, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
