import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "input",
  type: "registry:ui",
  title: "Input",
  description:
    "A text input in three heights that match Button, plus InputGroup and InputGroupAddon for leading or trailing icons, units and domains.",
  category: "primitives",
  tags: ["input", "text-field", "form", "search"],
  files: [{ path: "components/input.tsx" }],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "input-demo", title: "Default", file: "input-demo.tsx" },
    { name: "input-with-icon", title: "With icon and suffix", file: "input-with-icon.tsx" },
    { name: "input-invalid", title: "Invalid", file: "input-invalid.tsx" },
  ],
  ai: {
    summary:
      "Single-line text field. Use size to match neighbouring buttons, wrap in InputGroup with InputGroupAddon (align start or end) for icons or text like \".com\", and set aria-invalid for error styling.",
    whenToUse: ["Any single-line form field (email, name, URL, search)", "Search boxes with a leading icon", "Fields with a fixed unit or domain suffix"],
    whenNotToUse: ["Multi-line text (use textarea)", "Choosing from a fixed list (use select)", "On/off settings (use switch or checkbox)"],
    composesWith: ["label", "button", "kbd", "tooltip", "dialog"],
    a11y: [
      { keys: "Tab", action: "Moves focus to the input" },
      { keys: "Click on an addon", action: "Focuses the input" },
    ],
    customization: ["size: sm | default | lg (h-8 / h-9 / h-11)", "InputGroup size: sm | default | lg; InputGroupAddon align: start | end", "aria-invalid=\"true\" switches to destructive border and ring", "htmlSize maps to the native size attribute"],
  },
  source: {
    name: "shadcn/ui Input",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
