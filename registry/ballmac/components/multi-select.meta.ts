import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "multi-select",
  type: "registry:ui",
  title: "Multi Select",
  description:
    "Search and select several options in a Radix popover with native checkboxes and a selection cap.",
  category: "forms",
  tags: ["multi-select", "filter", "checkbox"],
  files: [{ path: "components/multi-select.tsx" }],
  dependencies: ["radix-ui", "lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    {
      name: "multi-select-demo",
      title: "Overview",
      file: "multi-select-demo.tsx",
    },
    {
      name: "multi-select-states",
      title: "States and variants",
      file: "multi-select-states.tsx",
    },
  ],
  ai: {
    summary:
      "Search and select several options in a Radix popover with native checkboxes and a selection cap.",
    whenToUse: [
      "Choose multiple teammates or categories",
      "Filter a list by several states",
    ],
    whenNotToUse: ["Use select when only one option is allowed"],
    composesWith: ["select"],
    a11y: [
      { keys: "Enter / Space", action: "Opens the option popover" },
      { keys: "Tab / Space", action: "Moves to and toggles native checkboxes" },
      { keys: "Escape", action: "Closes the popover" },
    ],
    customization: [
      "options, maxSelected",
      "value / defaultValue and onValueChange",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
