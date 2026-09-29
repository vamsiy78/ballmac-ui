import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "flickering-grid",
  type: "registry:ui",
  title: "Flickering Grid",
  description:
    "A canvas grid of small squares that flicker at random brightness, like a busy status board. Pixel-snapped, token-colored, DPR aware, pauses off-screen, static under reduced motion.",
  category: "backgrounds",
  tags: ["grid", "pixels", "flicker", "canvas", "background", "hero"],
  files: [{ path: "components/flickering-grid.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "color"],
  examples: [
    { name: "flickering-grid-demo", title: "Section background", file: "flickering-grid-demo.tsx" },
    { name: "flickering-grid-accent", title: "Accent card", file: "flickering-grid-accent.tsx" },
  ],
  ai: {
    summary:
      "Place <FlickeringGrid /> as the first child of a relative, overflow-hidden container; it fills it (absolute inset-0, aria-hidden, pointer-events-none). Tune squareSize, gap and maxOpacity for density and contrast.",
    whenToUse: [
      "Section or hero backgrounds for infrastructure, data or developer products",
      "Feature cards that should feel alive without a focal animation",
    ],
    whenNotToUse: [
      "Behind small or low-contrast text (keep maxOpacity low or add a scrim)",
      "Very large full-page areas on low-power devices (use dot-pattern)",
    ],
    composesWith: ["number-ticker", "shimmer-text"],
    customization: [
      "squareSize (px, default 4), gap (px, default 6)",
      "flickerChance: changes per square per second (default 0.3); maxOpacity (default 0.3)",
      "color: CSS variable name or color, default --foreground; fade toggles the radial mask",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
