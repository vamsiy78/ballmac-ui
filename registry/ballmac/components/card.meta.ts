import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "card",
  type: "registry:ui",
  title: "Card",
  description:
    "A composable content surface with compact spacing, an action slot, and optional interactive feedback.",
  category: "data-display",
  tags: ["surface", "panel", "dashboard"],
  files: [{ path: "components/card.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "card-demo", title: "Overview", file: "card-demo.tsx" },
    {
      name: "card-states",
      title: "States and variants",
      file: "card-states.tsx",
    },
  ],
  ai: {
    summary:
      "A composable content surface with compact spacing, an action slot, and optional interactive feedback.",
    whenToUse: [
      "Group a related set of content and actions",
      "Present a dashboard metric or settings panel",
    ],
    whenNotToUse: ["Use an alert for status messages"],
    composesWith: ["button", "badge"],
    a11y: [
      { keys: "Tab", action: "reaches controls and links inside the card" },
    ],
    customization: [
      "size: default | sm",
      "interactive: emphasize cards with controls",
    ],
  },
  source: {
    name: "shadcn/ui Card",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
