import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "currency-input",
  type: "registry:ui",
  title: "Currency Input",
  description:
    "A locale-aware money field that formats on blur while keeping editing and caret behavior simple.",
  category: "forms",
  tags: ["currency", "money", "input"],
  files: [{ path: "components/currency-input.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "currency-input-demo",
      title: "Overview",
      file: "currency-input-demo.tsx",
    },
    {
      name: "currency-input-states",
      title: "States and variants",
      file: "currency-input-states.tsx",
    },
  ],
  ai: {
    summary:
      "A locale-aware money field that formats on blur while keeping editing and caret behavior simple.",
    whenToUse: ["Collect prices, budgets, or payment amounts"],
    whenNotToUse: ["Use Number Input for unitless quantities"],
    composesWith: ["number-input"],
    a11y: [
      {
        keys: "Tab / typing",
        action: "Enters a numeric amount and formats it on blur",
      },
    ],
    customization: [
      "Controlled and uncontrolled value",
      "Tokens and state styling",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
