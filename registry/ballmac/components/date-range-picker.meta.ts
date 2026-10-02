import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "date-range-picker",
  type: "registry:ui",
  title: "Date Range Picker",
  description:
    "Two native date controls with inclusive range correction and quick-select presets.",
  category: "forms",
  tags: ["date", "range", "calendar"],
  files: [{ path: "components/date-range-picker.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    {
      name: "date-range-picker-demo",
      title: "Overview",
      file: "date-range-picker-demo.tsx",
    },
    {
      name: "date-range-picker-states",
      title: "States and variants",
      file: "date-range-picker-states.tsx",
    },
  ],
  ai: {
    summary:
      "Two native date controls with inclusive range correction and quick-select presets.",
    whenToUse: ["Pick report or booking date windows"],
    whenNotToUse: ["Use Date Picker for one date"],
    composesWith: ["time-picker"],
    a11y: [
      {
        keys: "Tab / Arrow keys",
        action: "Edits native date fields and activates presets",
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
