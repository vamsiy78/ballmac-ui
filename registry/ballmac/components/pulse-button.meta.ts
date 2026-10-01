import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "pulse-button",
  type: "registry:ui",
  title: "Pulse Button",
  description:
    "A call-to-action button that sends soft rings outward to ask for attention, calming as soon as it is hovered or focused, and switchable off once the person acts.",
  category: "motion",
  tags: ["button", "pulse", "attention", "cta", "notification"],
  files: [{ path: "components/pulse-button.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "button"],
  examples: [
    { name: "pulse-button-demo", title: "Attention ring", file: "pulse-button-demo.tsx" },
    { name: "pulse-button-tones", title: "Tones and states", file: "pulse-button-tones.tsx" },
  ],
  ai: {
    summary:
      "<PulseButton tone rings duration active>Label</PulseButton>. Rings stop on hover and focus, and when active is false or the button is disabled.",
    whenToUse: ["Onboarding steps and 'try it now' prompts", "Live or record buttons"],
    whenNotToUse: ["More than one per view", "Anything permanent: attention fades if it never stops"],
    composesWith: ["button", "shiny-button", "status-dot"],
    a11y: [
      { keys: "Enter / Space", action: "Activates like any button" },
      { keys: "Screen readers", action: "Rings are aria-hidden" },
      { keys: "Reduced motion", action: "A still faint ring replaces the pulse" },
    ],
    customization: ["tone", "rings", "duration", "active"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
