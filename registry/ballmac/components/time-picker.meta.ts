import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "time-picker",
  type: "registry:ui",
  title: "Time Picker",
  description:
    "A native time field with optional quick-pick presets and controlled or uncontrolled state.",
  category: "forms",
  tags: ["time", "schedule", "input"],
  files: [{ path: "components/time-picker.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    {
      name: "time-picker-demo",
      title: "Overview",
      file: "time-picker-demo.tsx",
    },
    {
      name: "time-picker-states",
      title: "States and variants",
      file: "time-picker-states.tsx",
    },
  ],
  ai: {
    summary:
      "A native time field with optional quick-pick presets and controlled or uncontrolled state.",
    whenToUse: [
      "Schedule an appointment or reminder",
      "Offer common meeting times as shortcuts",
    ],
    whenNotToUse: ["Use date-range-picker for a period across days"],
    composesWith: ["input"],
    a11y: [
      { keys: "Arrow keys", action: "Edits the native time field" },
      { keys: "Tab / Enter", action: "Activates a time preset" },
    ],
    customization: ["presets", "value / defaultValue and onValueChange"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
