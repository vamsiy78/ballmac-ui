import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "animated-grid",
  type: "registry:ui",
  title: "Animated Grid",
  description:
    "A decorative hairline grid background where a few random cells softly light up and fade, like instrument lights. SVG, hydration-safe, static under reduced motion.",
  category: "motion",
  tags: ["background", "grid", "pattern", "hero", "decorative", "motion"],
  files: [{ path: "components/animated-grid.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "motion-presets"],
  examples: [{ name: "animated-grid-demo", title: "Hero background", file: "animated-grid-demo.tsx" }],
  ai: {
    summary:
      "Place <AnimatedGrid /> as the first child of a relative container (it is absolute inset-0, aria-hidden, pointer-events-none) and put content after it with relative positioning. Lit cells are picked on the client after mount, so SSR output is just the grid.",
    whenToUse: [
      "Hero or section backgrounds on developer-tool and SaaS landing pages",
      "Empty states or sign-in screens that need quiet texture",
    ],
    whenNotToUse: [
      "Behind dense text or data (it competes with content)",
      "More than one per screen",
    ],
    composesWith: ["text-reveal", "shimmer-text", "magnetic-button"],
    customization: [
      "cellSize in px (default 40); count of lit cells (default 8); interval in ms between changes (default 700)",
      "fade toggles the radial edge mask; pass your own mask via style",
      "Colors are CSS variables: className=\"[--grid-line:…] [--grid-light:…]\" (defaults: 8% foreground lines, 20% ring cells)",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
