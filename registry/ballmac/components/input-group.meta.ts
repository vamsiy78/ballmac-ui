import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "input-group",
  type: "registry:ui",
  title: "Input Group",
  description:
    "One bordered field that wraps an input or textarea with icon, text, button and keyboard-hint addons at either end or above and below.",
  category: "forms",
  tags: ["input", "addon", "form", "textarea"],
  files: [{ path: "components/input-group.tsx" }],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "input-group-demo", title: "Addons", file: "input-group-demo.tsx" },
    { name: "input-group-states", title: "Invalid and disabled", file: "input-group-states.tsx" },
  ],
  ai: {
    summary:
      "Put InputGroupInput or InputGroupTextarea plus InputGroupAddon parts inside InputGroup. The group draws the border, focus ring and invalid state.",
    whenToUse: ["URL and currency prefixes and suffixes", "Search fields with a button", "Chat composers with a send button"],
    whenNotToUse: ["A plain field; use input", "Attached separate buttons; use button-group"],
    composesWith: ["field", "button", "kbd"],
    a11y: [
      { keys: "Click addon text", action: "Focuses the control" },
      { keys: "Tab", action: "Moves between the control and addon buttons" },
    ],
    customization: ["addon align: inline-start | inline-end | block-start | block-end", "button size: xs | sm | icon-xs | icon-sm", "aria-invalid on the control"],
  },
  source: {
    name: "shadcn/ui Input Group",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
