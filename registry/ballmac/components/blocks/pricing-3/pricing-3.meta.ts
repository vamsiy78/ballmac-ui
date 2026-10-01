import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "pricing-3",
  type: "registry:block",
  title: "Pricing 3: full plan comparison",
  description: "A feature-by-feature comparison table with a sticky plan header, collapsible groups and a highlighted column. On phones it becomes a plan switcher with one clean list.",
  category: "blocks",
  blockCategory: "pricing",
  tags: ["pricing", "comparison", "table", "sticky", "plans", "features"],
  files: [{ path: "components/blocks/pricing-3/pricing-3.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "badge", "button", "segmented-control"],
  examples: [
    { name: "pricing-3-demo", title: "Default", file: "pricing-3-demo.tsx" },
    { name: "pricing-3-two", title: "Two plans", file: "pricing-3-two.tsx" },
  ],
  ai: {
    summary: "The detailed pricing table for buyers who compare. Pass plans=[{ key, name, price, period?, cta, featured? }] and groups=[{ title, rows: [{ label, hint?, values: { [planKey]: boolean | string } }] }].",
    whenToUse: ["Below pricing cards, for buyers who want every detail", "Products with many differentiating features"],
    whenNotToUse: ["Two simple plans (pricing-1 is enough)"],
    composesWith: ["pricing-2", "faq-2", "cta-1", "header-1"],
    a11y: [
      { keys: "Enter / Space on a group heading", action: "Collapses or expands the group" },
      { keys: "Arrow Left / Right (phones)", action: "Switches the plan shown" },
    ],
    customization: ["stickyOffset: pixels to keep from the top when you have a fixed site header", "values: true / false render an icon with a text label; strings render as text"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
