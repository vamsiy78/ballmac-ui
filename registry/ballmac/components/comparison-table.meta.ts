import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "comparison-table",
  type: "registry:ui",
  title: "Comparison Table",
  description:
    "A semantic feature matrix with a highlighted choice and accessible boolean values.",
  category: "data-display",
  tags: ["comparison", "pricing", "features"],
  files: [{ path: "components/comparison-table.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "comparison-table-demo",
      title: "Overview",
      file: "comparison-table-demo.tsx",
    },
    {
      name: "comparison-table-states",
      title: "States and variants",
      file: "comparison-table-states.tsx",
    },
  ],
  ai: {
    summary:
      "A semantic feature matrix with a highlighted choice and accessible boolean values.",
    whenToUse: ["Compare capabilities across choices"],
    whenNotToUse: ["Use Description List for one object"],
    composesWith: ["description-list"],
    a11y: [
      {
        keys: "Tab / Arrow keys",
        action: "Focuses and scrolls the comparison region when narrow",
      },
    ],
    customization: ["Content, layout, and token-based className styling"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
