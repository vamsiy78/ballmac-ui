import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "features-1",
  type: "registry:block",
  title: "Features 1: bento grid",
  description:
    "Bento feature grid of spotlight cards in two sizes, with an animated stat and keyboard-shortcut hints mixed in for texture.",
  category: "blocks",
  blockCategory: "features",
  tags: ["features", "bento", "grid", "landing"],
  files: [{ path: "components/blocks/features-1/features-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "kbd", "number-ticker", "spotlight-card"],
  examples: [{ name: "features-1-demo", title: "Default", file: "features-1-demo.tsx" }],
  ai: {
    summary: "A four-cell bento grid for a product's main features. Edit the cells directly; each is a SpotlightCard with an icon, title, body and optional extra content.",
    whenToUse: ["Showing 3–6 headline features with visual variety", "SaaS and developer product landing pages"],
    whenNotToUse: ["Long lists of features (use features-2)"],
    composesWith: ["hero-1", "pricing-1"],
    customization: ["eyebrow, title, description props", "Change cells, spans (md:col-span-2) and icons in the source"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
