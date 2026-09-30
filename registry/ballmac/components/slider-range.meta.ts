import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "slider-range",
  type: "registry:ui",
  title: "Slider Range",
  description:
    "A two-thumb Radix slider with a labeled value span, keyboard operation, and minimum thumb spacing.",
  category: "forms",
  tags: ["slider", "range", "filter"],
  files: [{ path: "components/slider-range.tsx" }],
  dependencies: ["radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "slider-range-demo",
      title: "Overview",
      file: "slider-range-demo.tsx",
    },
    {
      name: "slider-range-states",
      title: "States and variants",
      file: "slider-range-states.tsx",
    },
  ],
  ai: {
    summary:
      "A two-thumb Radix slider with a labeled value span, keyboard operation, and minimum thumb spacing.",
    whenToUse: ["Filter a bounded numeric interval"],
    whenNotToUse: ["Use Number Input for exact values"],
    composesWith: ["number-input"],
    a11y: [
      {
        keys: "Arrow keys / Home / End / Page Up / Page Down",
        action: "Adjusts the focused minimum or maximum thumb",
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
