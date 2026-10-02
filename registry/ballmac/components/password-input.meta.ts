import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "password-input",
  type: "registry:ui",
  title: "Password Input",
  description:
    "A password field with a visibility toggle and a four-step strength guide that explains how to improve the entry.",
  category: "forms",
  tags: ["password", "security", "strength"],
  files: [{ path: "components/password-input.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    {
      name: "password-input-demo",
      title: "Overview",
      file: "password-input-demo.tsx",
    },
    {
      name: "password-input-states",
      title: "States and variants",
      file: "password-input-states.tsx",
    },
  ],
  ai: {
    summary:
      "A password field with a visibility toggle and a four-step strength guide that explains how to improve the entry.",
    whenToUse: [
      "Create or change a password",
      "Give immediate guidance while typing",
    ],
    whenNotToUse: ["Use input for a standard text field"],
    composesWith: ["input"],
    a11y: [{ keys: "Tab / Space", action: "Toggles password visibility" }],
    customization: ["showStrength", "value / defaultValue and onValueChange"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
