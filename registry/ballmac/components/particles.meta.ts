import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "particles",
  type: "registry:ui",
  title: "Particles",
  description:
    "A canvas field of softly twinkling particles with depth, gentle drift and a pointer that attracts or repels them. Token colors, DPR aware, pauses off-screen, still under reduced motion.",
  category: "backgrounds",
  tags: ["particles", "stars", "canvas", "background", "hero", "interactive"],
  files: [{ path: "components/particles.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "color"],
  examples: [
    { name: "particles-demo", title: "Hero card", file: "particles-demo.tsx" },
    { name: "particles-rising", title: "Rising, repel", file: "particles-rising.tsx" },
  ],
  ai: {
    summary:
      "Place <Particles /> as the first child of a relative, overflow-hidden container; it fills it (absolute inset-0, aria-hidden, pointer-events-none) and tracks the pointer at window level, so content above it stays clickable.",
    whenToUse: [
      "Quiet hero or CTA backgrounds, especially on dark surfaces",
      "Space, AI or data themed sections that need depth without imagery",
    ],
    whenNotToUse: [
      "Behind long-form text",
      "Many instances on one page (each runs its own canvas loop)",
    ],
    composesWith: ["text-reveal", "shimmer-text", "magnetic-button"],
    customization: [
      "quantity (per ~800×500 px, scales with area), size (base radius px), maxOpacity",
      "color: CSS variable name or color, default --foreground; try --chart-1",
      "interaction: attract | repel | none; radius and ease shape the pointer response",
      "vx / vy add a constant drift (vy={-0.3} rises like embers)",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
