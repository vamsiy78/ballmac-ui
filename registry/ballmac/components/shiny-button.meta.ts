import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "shiny-button",
  type: "registry:ui",
  title: "Shiny Button",
  description:
    "A button with a diagonal band of light that sweeps across on hover and focus, or on a timer to draw the eye, built on the Ballmac button.",
  category: "motion",
  tags: ["button", "shine", "hover", "cta", "motion"],
  files: [{ path: "components/shiny-button.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "button"],
  examples: [
    { name: "shiny-button-demo", title: "Hover and loop", file: "shiny-button-demo.tsx" },
    { name: "shiny-button-variants", title: "On every variant", file: "shiny-button-variants.tsx" },
  ],
  ai: {
    summary:
      "<ShinyButton shine='hover|loop' interval>Label</ShinyButton>. Accepts every Button prop. No shine under reduced motion.",
    whenToUse: ["Primary calls to action that deserve a little life", "Pricing and signup buttons"],
    whenNotToUse: ["Dense toolbars", "Destructive actions"],
    composesWith: ["button", "rainbow-button", "magnetic-button"],
    a11y: [
      { keys: "Enter / Space", action: "Activates like any button" },
      { keys: "Reduced motion", action: "No shine is drawn" },
    ],
    customization: ["shine", "interval", "all Button props"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
