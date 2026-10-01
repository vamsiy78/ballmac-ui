import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "rainbow-button",
  type: "registry:ui",
  title: "Rainbow Button",
  description:
    "A button with a border of theme colors circling it and a glow on hover, built on the Ballmac button so every size, variant and focus state still works.",
  category: "motion",
  tags: ["button", "gradient", "border", "glow", "cta"],
  files: [{ path: "components/rainbow-button.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "button"],
  examples: [
    { name: "rainbow-button-demo", title: "Primary call to action", file: "rainbow-button-demo.tsx" },
    { name: "rainbow-button-sizes", title: "Sizes and pill", file: "rainbow-button-sizes.tsx" },
  ],
  ai: {
    summary:
      "Use like <Button>: <RainbowButton size variant shape duration glow>Label</RainbowButton>. Best with default, secondary or outline variants (the inside needs a background).",
    whenToUse: ["The single most important call to action on a page", "Upgrade and launch prompts"],
    whenNotToUse: ["Several buttons on one screen", "Ghost buttons (no background to sit on the border)"],
    composesWith: ["button", "shiny-button", "pulse-button"],
    a11y: [
      { keys: "Enter / Space", action: "Activates like any button" },
      { keys: "Focus", action: "The standard focus ring and the glow both appear on keyboard focus" },
      { keys: "Reduced motion", action: "The border is a still gradient" },
    ],
    customization: ["duration", "glow", "shape: default | pill", "all Button props"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
