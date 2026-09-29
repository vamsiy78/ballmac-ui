import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "beams-background",
  type: "registry:ui",
  title: "Beams Background",
  description:
    "Hairline rails with thin light beams rising along them and dissolving near the top, over a soft glow. Canvas, token colors, DPR aware, pauses off-screen, a still frame under reduced motion.",
  category: "backgrounds",
  featured: true,
  tags: ["beams", "light", "rails", "canvas", "background", "hero", "waitlist"],
  files: [{ path: "components/beams-background.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "color"],
  examples: [
    { name: "beams-background-demo", title: "Waitlist", file: "beams-background-demo.tsx" },
    { name: "beams-background-falling", title: "Falling, single color", file: "beams-background-falling.tsx" },
  ],
  ai: {
    summary:
      "Place <BeamsBackground /> as the first child of a relative, overflow-hidden section; it fills it (absolute inset-0, aria-hidden, pointer-events-none). Content goes after it; the rails fade out at the top and bottom edges.",
    whenToUse: [
      "Waitlist, sign-up or launch sections with centered content",
      "Hero backgrounds for developer tools, infrastructure or AI products",
    ],
    whenNotToUse: [
      "Behind long text or tables",
      "Pages that already have another animated background",
    ],
    composesWith: ["input", "button", "shimmer-text", "text-reveal"],
    customization: [
      "gap: rail spacing in px (default 36); density: beams per 1000 px of width (default 30)",
      "colors: CSS variable names or colors, default --chart-1, --chart-2, --chart-4",
      "direction: up | down; speed multiplier (default 1); railOpacity (default 0.07)",
      "glow toggles the soft light (in the first color) at the edge the beams come from",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
