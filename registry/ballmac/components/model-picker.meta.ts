import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "model-picker",
  type: "registry:ui",
  title: "Model Picker",
  description:
    "A searchable model selector grouped by provider, with capability icons, locked plans and a detail pane that follows the highlighted model with context window, cost and abilities.",
  category: "ai",
  tags: ["ai", "model", "select", "combobox", "llm", "picker"],
  files: [{ path: "components/model-picker.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "popover", "command", "i18n"],
  examples: [
    { name: "model-picker-demo", title: "Grouped with details", file: "model-picker-demo.tsx" },
    { name: "model-picker-compact", title: "Compact in a composer", file: "model-picker-compact.tsx" },
  ],
  ai: {
    summary:
      "models is an array of { id, name, provider?, description?, capabilities?, contextWindow?, cost?, isNew?, locked? }. value/onValueChange or defaultValue. Locked models call onLockedSelect. variant default | compact.",
    whenToUse: ["Choosing the model for a chat or an agent", "Any picker where options have facts worth comparing"],
    whenNotToUse: ["A plain short list of choices; use select", "Settings with many fields; use settings-panel"],
    composesWith: ["prompt-input", "ai-chat", "token-meter"],
    a11y: [
      { keys: "Enter / Space / ArrowDown", action: "Opens the list from the trigger" },
      { keys: "ArrowUp / ArrowDown", action: "Moves the highlight; the detail pane updates" },
      { keys: "Enter", action: "Selects the model and returns focus to the trigger" },
      { keys: "Escape", action: "Closes without changing" },
    ],
    customization: ["searchable", "showDetails", "variant", "align", "onLockedSelect", "lockedLabel per model"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
