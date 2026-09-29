import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "aurora-background",
  type: "registry:ui",
  title: "Aurora Background",
  description:
    "Soft, slowly drifting aurora light made of blurred token-colored glows with fine vertical curtains and an optional radial fade. Pure CSS layers, paused off-screen, still under reduced motion.",
  category: "backgrounds",
  tags: ["aurora", "gradient", "glow", "background", "hero", "decorative"],
  files: [{ path: "components/aurora-background.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "aurora-background-demo", title: "Hero", file: "aurora-background-demo.tsx" },
    { name: "aurora-background-warm", title: "Warm, no curtains", file: "aurora-background-warm.tsx" },
  ],
  ai: {
    summary:
      "Place <AuroraBackground /> as the first child of a relative, overflow-hidden hero; it is absolute inset-0, aria-hidden and pointer-events-none. The light sits along the top edge and fades down, so headline text reads on the page background.",
    whenToUse: [
      "Behind a hero headline or a launch announcement",
      "Sign-in or waitlist pages that need atmosphere without imagery",
    ],
    whenNotToUse: [
      "Behind dense content or data",
      "Several stacked sections (use once per page, at the top)",
    ],
    composesWith: ["text-reveal", "shimmer-text", "magnetic-button"],
    customization: [
      "colors: array of CSS colors, default chart-1, chart-2, chart-4, chart-1",
      "duration (s, default 22), intensity (0–1, default 0.75), blur (px, default 64)",
      "curtains toggles the vertical ray texture; radialMask toggles the elliptical fade",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
