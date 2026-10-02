import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "color-picker",
  type: "registry:ui",
  title: "Color Picker",
  description:
    "A native color chooser paired with an editable hex field and a live swatch.",
  category: "forms",
  tags: ["color", "picker", "hex"],
  files: [{ path: "components/color-picker.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    {
      name: "color-picker-demo",
      title: "Overview",
      file: "color-picker-demo.tsx",
    },
    {
      name: "color-picker-states",
      title: "States and variants",
      file: "color-picker-states.tsx",
    },
  ],
  ai: {
    summary:
      "A native color chooser paired with an editable hex field and a live swatch.",
    whenToUse: [
      "Choose a custom brand or annotation color",
      "Edit a color precisely by hexadecimal value",
    ],
    whenNotToUse: ["Use theme tokens for application chrome"],
    composesWith: ["input"],
    a11y: [
      { keys: "Tab", action: "Moves between color and text inputs" },
      { keys: "Enter", action: "Accepts a native color selection" },
    ],
    customization: [
      "value / defaultValue and onValueChange",
      "name: form field name",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
