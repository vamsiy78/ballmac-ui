import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "meteors",
  type: "registry:ui",
  title: "Meteors",
  description:
    "Thin meteors with glowing heads and fading tails streak across a container at a set angle. Randomized after mount (hydration-safe), paused off-screen, hidden under reduced motion.",
  category: "backgrounds",
  tags: ["meteors", "shooting stars", "background", "card", "decorative"],
  files: [{ path: "components/meteors.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "meteors-demo", title: "Release card", file: "meteors-demo.tsx" },
    { name: "meteors-colored", title: "Steep, colored", file: "meteors-colored.tsx" },
  ],
  ai: {
    summary:
      "Put <Meteors /> inside a relative, overflow-hidden card or section (it is absolute inset-0, aria-hidden, pointer-events-none) and lift content with relative z-10. Meteor positions are generated on the client after mount, so the server renders an empty layer.",
    whenToUse: [
      "A launch, release or milestone card that should feel special",
      "Dark hero sections or CTA panels that need a hint of motion",
    ],
    whenNotToUse: [
      "Dense UI or data tables",
      "Communicating anything; it is decorative and hidden under reduced motion",
    ],
    composesWith: ["spotlight-card", "badge", "button"],
    customization: [
      "count (default 14), angle in degrees (default 135, down-left)",
      "duration: [min, max] seconds per crossing; tail: [min, max] px",
      "color: any CSS color, default 70% --foreground; try var(--chart-1)",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
