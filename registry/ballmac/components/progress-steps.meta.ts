import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "progress-steps",
  type: "registry:ui",
  title: "Progress Steps",
  description:
    "An ordered progress sequence with current-step semantics and optional navigation to completed steps.",
  category: "feedback",
  tags: ["steps", "wizard", "progress"],
  files: [
    {
      path: "components/progress-steps.tsx",
    },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    {
      name: "progress-steps-demo",
      title: "Overview",
      file: "progress-steps-demo.tsx",
    },
    {
      name: "progress-steps-states",
      title: "States and variants",
      file: "progress-steps-states.tsx",
    },
  ],
  ai: {
    summary:
      "An ordered progress sequence with current-step semantics and optional navigation to completed steps.",
    whenToUse: ["Show a multi-step flow", "Let users revisit completed steps"],
    whenNotToUse: ["Use progress for an unlabelled percentage"],
    composesWith: ["stepper-form", "progress"],
    a11y: [
      {
        keys: "Tab / Enter",
        action: "Return to a completed step when navigable",
      },
    ],
    customization: [
      "Controlled or uncontrolled active index",
      "Optional descriptions",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
