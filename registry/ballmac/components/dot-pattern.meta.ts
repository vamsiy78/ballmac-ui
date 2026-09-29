import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "dot-pattern",
  type: "registry:ui",
  title: "Dot Pattern",
  description:
    "A lightweight SVG dot grid background with an optional radial fade and a few softly pulsing glow dots. One pattern element, token colors, hydration-safe, still under reduced motion.",
  category: "backgrounds",
  tags: ["dots", "pattern", "grid", "svg", "background", "decorative"],
  files: [{ path: "components/dot-pattern.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "dot-pattern-demo", title: "Glowing dots", file: "dot-pattern-demo.tsx" },
    { name: "dot-pattern-dense", title: "Dense, no glow", file: "dot-pattern-dense.tsx" },
  ],
  ai: {
    summary:
      "Place <DotPattern /> as the first child of a relative, overflow-hidden container (absolute inset-0, aria-hidden, pointer-events-none). Add glow for a few pulsing accent dots. The cheapest Ballmac background; safe for large areas.",
    whenToUse: [
      "Quiet texture behind heroes, feature cards, empty states and auth pages",
      "Large page areas where canvas effects would be too heavy",
    ],
    whenNotToUse: [
      "When you want visible motion as the focal point (use flickering-grid or beams-background)",
    ],
    composesWith: ["orbiting-circles", "animated-beam", "spotlight-card"],
    customization: [
      "width / height: dot spacing in px (default 16); radius (default 1)",
      "glow, glowCount (default 18), glowColor (default var(--chart-1))",
      "radialMask toggles the edge fade; dot color is the --dot CSS variable: className=\"[--dot:var(--chart-2)]\"",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
