import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "label",
  type: "registry:ui",
  title: "Label",
  description:
    "An accessible form label built on Radix Label that dims itself when the paired peer control is disabled and never selects text on double-click.",
  category: "primitives",
  tags: ["label", "form", "radix"],
  files: [{ path: "components/label.tsx" }],
  dependencies: ["radix-ui"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "label-demo", title: "Default", file: "label-demo.tsx" },
  ],
  ai: {
    summary:
      "Text label for a form control. Pair with htmlFor/id; put the control before it with className=\"peer\" (Checkbox and Switch already are) to get disabled styling.",
    whenToUse: ["Naming inputs, textareas, selects, checkboxes and switches", "Clickable text next to a checkbox or switch"],
    whenNotToUse: ["Headings or section titles (use a heading element)", "Helper or error text under a field (use a p with text-muted-foreground or text-destructive)"],
    composesWith: ["input", "textarea", "checkbox", "switch", "select"],
    a11y: [
      { keys: "Click", action: "Focuses or toggles the associated control" },
    ],
    customization: ["Disabled styling via peer-disabled (control before label) or a parent with group and data-disabled=\"true\"", "Lays out children in a row with gap-2, so icons or badges can sit beside the text"],
  },
  source: {
    name: "shadcn/ui Label",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
