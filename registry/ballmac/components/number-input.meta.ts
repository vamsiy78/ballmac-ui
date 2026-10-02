import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "number-input",
  type: "registry:ui",
  title: "Number Input",
  description:
    "A bounded numeric field with native spinbutton semantics, step buttons, and controlled or uncontrolled state.",
  category: "forms",
  tags: ["number", "stepper", "spinbutton"],
  files: [{ path: "components/number-input.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    {
      name: "number-input-demo",
      title: "Overview",
      file: "number-input-demo.tsx",
    },
    {
      name: "number-input-states",
      title: "States and variants",
      file: "number-input-states.tsx",
    },
  ],
  ai: {
    summary:
      "A bounded numeric field with native spinbutton semantics, step buttons, and controlled or uncontrolled state.",
    whenToUse: [
      "Choose a quantity or bounded count",
      "Adjust a value precisely using keys or buttons",
    ],
    whenNotToUse: ["Use a slider when approximate adjustment is sufficient"],
    composesWith: ["input"],
    a11y: [
      { keys: "Arrow Up / Down", action: "Changes the native numeric value" },
      { keys: "Tab / Enter", action: "Operates the step buttons" },
    ],
    customization: ["min, max, step", "value / defaultValue and onValueChange"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
