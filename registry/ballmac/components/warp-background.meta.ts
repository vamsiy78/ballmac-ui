import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "warp-background",
  type: "registry:ui",
  title: "Warp Background",
  description:
    "A hyperspace tunnel of streaks flying out from the center on a canvas, in theme colors with a soft vignette for readable content, parallax toward the pointer, pausing off screen.",
  category: "backgrounds",
  tags: ["warp", "hyperspace", "canvas", "background", "hero"],
  files: [{ path: "components/warp-background.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "color"],
  examples: [
    { name: "warp-background-demo", title: "Hero in the tunnel", file: "warp-background-demo.tsx" },
    { name: "warp-background-cards", title: "Calm, dense variant", file: "warp-background-cards.tsx" },
  ],
  ai: {
    summary:
      "<WarpBackground density speed colors vignette parallax>content</WarpBackground>. colors takes CSS variable names. The content sits on its own layer above the canvas.",
    whenToUse: ["Launch and waitlist pages", "A dramatic backdrop for one centered message"],
    whenNotToUse: ["Content-heavy pages", "Anything that must be calm all the time"],
    composesWith: ["particles", "retro-grid", "light-rays"],
    a11y: [
      { keys: "Screen readers", action: "The canvas is aria-hidden; children are read normally" },
      { keys: "Contrast", action: "The vignette darkens the center behind text" },
      { keys: "Reduced motion", action: "A single still frame of streaks" },
    ],
    customization: ["density", "speed", "colors", "vignette", "parallax"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
