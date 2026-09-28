import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "switch",
  type: "registry:ui",
  title: "Switch",
  description:
    "A Radix toggle switch in two sizes with a CSS-animated thumb, for settings that take effect immediately. Stops animating under reduced motion.",
  category: "primitives",
  tags: ["switch", "toggle", "settings", "form", "radix"],
  files: [{ path: "components/switch.tsx" }],
  dependencies: ["radix-ui", "class-variance-authority"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "switch-demo", title: "Default", file: "switch-demo.tsx" },
    { name: "switch-settings", title: "Settings rows", file: "switch-settings.tsx" },
  ],
  ai: {
    summary:
      "On/off control for settings that apply immediately. Pair with a Label via id/htmlFor; use size=\"sm\" in dense lists.",
    whenToUse: ["Enabling or disabling a feature or notification", "Settings pages with labelled rows", "Toggles inside dense menus or tables (size sm)"],
    whenNotToUse: ["Choices submitted later with a form, or agreeing to terms (use checkbox)", "More than two options (use select)"],
    composesWith: ["label", "badge"],
    a11y: [
      { keys: "Space", action: "Toggles the switch" },
      { keys: "Enter", action: "Toggles the switch" },
      { keys: "Tab", action: "Moves focus to the switch" },
    ],
    customization: ["size: sm | default", "checked / defaultChecked with onCheckedChange", "aria-invalid=\"true\" for errors"],
  },
  source: {
    name: "shadcn/ui Switch",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
