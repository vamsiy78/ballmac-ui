import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "comparison-1",
  type: "registry:block",
  title: "Comparison 1: us versus the alternatives",
  description: "A product-versus-alternatives table where your column is lifted into its own card, with yes, partly, no and text values and a row of headline results. Phones switch between alternatives.",
  category: "blocks",
  blockCategory: "comparison",
  tags: ["comparison", "versus", "alternatives", "table", "switch", "features"],
  files: [{ path: "components/blocks/comparison-1/comparison-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "segmented-control"],
  examples: [
    { name: "comparison-1-demo", title: "Default", file: "comparison-1-demo.tsx" },
    { name: "comparison-1-single", title: "One alternative", file: "comparison-1-single.tsx" },
  ],
  ai: {
    summary: "A switch-from-X page section. Pass product, competitors=[{ key, name }] and rows=[{ label, hint?, values: { us, [key]: true | false | 'partial' | text } }].",
    whenToUse: ["Landing pages aimed at people evaluating alternatives", "Migration and 'vs' pages"],
    whenNotToUse: ["Comparing your own plans (use pricing-3)"],
    composesWith: ["pricing-2", "testimonials-2", "cta-1", "faq-2"],
    a11y: [
      { keys: "Arrow Left / Right (phones)", action: "Switches the alternative shown" },
      { keys: "Screen reader", action: "Each cell reads as 'Name, capability: yes / partly / no'" },
    ],
    customization: ["values use the key 'us' for your product", "reasons: [] hides the headline results"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
