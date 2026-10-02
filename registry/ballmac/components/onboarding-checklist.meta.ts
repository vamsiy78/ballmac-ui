import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "onboarding-checklist",
  type: "registry:ui",
  title: "Onboarding Checklist",
  description:
    "A get-started checklist with a progress ring and segmented bar, expandable steps with actions, checkable tasks and a short celebration when everything is done.",
  category: "saas",
  tags: ["onboarding", "checklist", "progress", "activation"],
  files: [{ path: "components/onboarding-checklist.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "motion-presets", "i18n"],
  examples: [
    { name: "onboarding-checklist-demo", title: "Setup steps", file: "onboarding-checklist-demo.tsx" },
    { name: "onboarding-checklist-states", title: "Complete and dismissible", file: "onboarding-checklist-states.tsx" },
  ],
  ai: {
    summary:
      "steps: {id,title,description,action}. completed/defaultCompleted/onCompletedChange track progress. The open step shows its description and action.",
    whenToUse: ["First-run setup for new accounts", "Activation nudges in a dashboard corner"],
    whenNotToUse: ["Multi-page wizards; use stepper-form", "A plain progress bar; use progress"],
    composesWith: ["progress-ring", "card", "button"],
    a11y: [
      { keys: "Tab", action: "Reaches each step's checkbox and its expand button" },
      { keys: "Space", action: "Toggles a step done (role checkbox)" },
      { keys: "Enter / Space on the title", action: "Expands or collapses the step (aria-expanded)" },
      { keys: "Reduced motion", action: "Check, bar and panel changes are instant" },
    ],
    customization: ["controlled completed ids", "defaultOpenId", "onDismiss", "completeMessage"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
