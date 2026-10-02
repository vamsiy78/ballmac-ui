import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "stepper-form",
  type: "registry:ui",
  title: "Stepper Form",
  description:
    "A guided multistep form shell with gated progression, review states, and keyboard-accessible navigation.",
  category: "forms",
  tags: ["wizard", "form", "steps"],
  files: [{ path: "components/stepper-form.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    {
      name: "stepper-form-demo",
      title: "Overview",
      file: "stepper-form-demo.tsx",
    },
    {
      name: "stepper-form-states",
      title: "States and variants",
      file: "stepper-form-states.tsx",
    },
  ],
  ai: {
    summary:
      "A guided multistep form shell with gated progression, review states, and keyboard-accessible navigation.",
    whenToUse: ["Guide a long onboarding or setup process"],
    whenNotToUse: ["Use a single form for short tasks"],
    composesWith: ["progress"],
    a11y: [
      {
        keys: "Tab / Enter / Space",
        action: "Navigates steps and completes the flow",
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
