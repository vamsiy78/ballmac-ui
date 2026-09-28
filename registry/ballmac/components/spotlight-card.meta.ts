import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "spotlight-card",
  type: "registry:ui",
  title: "Spotlight Card",
  description:
    "A card whose surface and border pick up a soft glow that follows the pointer, driven by CSS variables with no re-render per move. Keyboard focus shows a steady glow.",
  category: "motion",
  tags: ["card", "hover", "glow", "pointer", "feature", "motion"],
  files: [{ path: "components/spotlight-card.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "spotlight-card-demo", title: "Feature card", file: "spotlight-card-demo.tsx" },
    { name: "spotlight-card-grid", title: "Feature grid", file: "spotlight-card-grid.tsx" },
  ],
  ai: {
    summary:
      "A drop-in card surface (rounded-xl, border, bg-card, p-6) with a pointer-following glow in the --ring color. Put any content inside; if the card contains a link or button, focusing it lights the card.",
    whenToUse: [
      "Feature grids on landing pages",
      "Pricing or plan cards that should respond to hover",
      "Clickable tiles in a dashboard or settings index",
    ],
    whenNotToUse: [
      "Dense data tables or long lists of cards (the effect loses meaning when everything glows)",
      "Plain content containers with no interaction (use card)",
    ],
    composesWith: ["badge", "button", "border-beam"],
    customization: [
      "size: glow radius in px (default 320)",
      "Glow color follows --ring; override per card with className like [--ring:var(--chart-2)]",
      "Surface styles are ordinary classes: replace p-6, rounded-xl or bg-card through className",
      "Parts: [data-slot=spotlight-card-surface] and [data-slot=spotlight-card-border]",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
