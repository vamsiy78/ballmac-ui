import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "glow-border",
  type: "registry:ui",
  title: "Glow Border",
  description:
    "Wraps any content in a border drawn by a rotating conic gradient in theme colors, with a soft outer glow. Speed, width, radius and arc length are props; it stops at a still angle under reduced motion.",
  category: "motion",
  tags: ["border", "gradient", "glow", "conic", "highlight", "pricing", "button", "motion"],
  files: [{ path: "components/glow-border.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "glow-border-demo", title: "Pricing highlight", file: "glow-border-demo.tsx" },
    { name: "glow-border-button", title: "Buttons", file: "glow-border-button.tsx" },
  ],
  ai: {
    summary:
      "Put content inside <GlowBorder>; it renders a padded wrapper whose padding shows a rotating conic gradient and a content surface (bg-card, radius minus width). Use arc={1} for a full rainbow ring, a smaller arc for a comet.",
    whenToUse: [
      "The recommended plan in a pricing table",
      "One primary call-to-action or an AI entry point",
      "Marking a card as new, live or selected",
    ],
    whenNotToUse: [
      "Several elements at once on the same screen (use it for one focal point)",
      "A thin light that travels along an existing border (use border-beam)",
    ],
    composesWith: ["button", "border-beam", "tilt-card"],
    customization: [
      "duration: seconds per rotation (default 4); width: ring px (default 1.5); radius: px (default 14, 999 for pills)",
      "colors: CSS colors or var(--chart-n) values; arc: 0–1 share of the ring lit (default 0.55)",
      "glow: 0–1 outer glow strength (0 turns it off)",
      "contentClassName styles the inner surface (bg-background, bg-primary…)",
      "Animates a registered CSS property (--glow-border-angle); pauses off-screen",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
