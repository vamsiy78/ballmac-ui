import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "neon-card",
  type: "registry:ui",
  title: "Neon Card",
  description:
    "A card framed by a two-color neon border with a soft outer light and inner glow, tunable thickness, intensity and corner radius, with an optional warm-up flicker that never plays under reduced motion.",
  category: "motion",
  tags: ["card", "neon", "glow", "border", "gradient"],
  files: [{ path: "components/neon-card.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "motion-presets"],
  examples: [
    { name: "neon-card-demo", title: "Pricing tier", file: "neon-card-demo.tsx" },
    { name: "neon-card-tones", title: "Tones and flicker", file: "neon-card-tones.tsx" },
  ],
  ai: {
    summary:
      "<NeonCard from to borderWidth glow flicker radius contentClassName>content</NeonCard>. Colors are theme tokens, so it follows any theme. The light is strongest in dark mode.",
    whenToUse: ["A single highlighted plan, product or announcement", "Dark-themed landing pages"],
    whenNotToUse: ["Several cards at once", "A rotating border (glow-border)"],
    composesWith: ["glow-border", "magic-card", "card"],
    a11y: [
      { keys: "Contrast", action: "Content sits on the normal card surface; the glow is decorative" },
      { keys: "Reduced motion", action: "Flicker is never played" },
    ],
    customization: ["from and to", "borderWidth", "glow", "flicker", "radius"],
  },
  version: "1.0.1",
  updated: "2026-10-11",
  changelog: [
    { version: "1.0.1", date: "2026-10-11", note: "Decorative loops hold still when the theme turns ambient motion off (and under reduced motion), via useLoopsPaused. Unchanged by default." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
