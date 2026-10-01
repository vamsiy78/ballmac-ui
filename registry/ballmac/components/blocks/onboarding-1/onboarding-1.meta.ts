import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "onboarding-1",
  type: "registry:block",
  title: "Onboarding 1: workspace setup wizard",
  description: "A four-step setup wizard with a progress rail: name and address a workspace (auto-filled), pick goals as cards, invite teammates as removable chips, review, then a finish screen. Slides between steps.",
  category: "blocks",
  blockCategory: "onboarding",
  tags: ["onboarding", "wizard", "setup", "workspace", "steps", "invite"],
  files: [{ path: "components/blocks/onboarding-1/onboarding-1.tsx" }],
  dependencies: ["lucide-react", "motion@^12"],
  registryDependencies: ["shadcn:utils", "button", "field", "input"],
  examples: [
    { name: "onboarding-1-demo", title: "Default", file: "onboarding-1-demo.tsx" },
    { name: "onboarding-1-custom", title: "Custom goals", file: "onboarding-1-custom.tsx" },
  ],
  ai: {
    summary: "First-run setup after signup. Pass product, domain, goals=[{ id, title, description }] and onComplete(values) with { name, slug, color, goals, invites } (throw to show an error).",
    whenToUse: ["The first screen after signup or verification", "Products where a workspace or team has to be created"],
    whenNotToUse: ["A checklist that lives inside the app (use onboarding-checklist)"],
    composesWith: ["signup-1", "verify-1", "invite-1", "app-shell"],
    a11y: [
      { keys: "Continue / Back", action: "Focus moves to the new step's heading so the change is announced" },
      { keys: "Arrow keys on colors", action: "Move between color radios; goals are checkboxes toggled with Space" },
      { keys: "Enter in the email field", action: "Adds the address as a removable chip" },
    ],
    customization: ["goals: { id, title, description }[]", "product, domain, continueHref", "onComplete(values) async"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
