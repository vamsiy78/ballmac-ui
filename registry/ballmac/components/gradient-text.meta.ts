import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "gradient-text",
  type: "registry:ui",
  title: "Gradient Text",
  description:
    "Text filled with a gradient of theme colors that slowly drifts, or a shiny variant that sweeps a glint of light across it on a pause. Static under reduced motion; plain text in forced colors.",
  category: "text",
  tags: ["text", "gradient", "headline", "shine", "hero", "motion"],
  files: [{ path: "components/gradient-text.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "gradient-text-demo", title: "Flowing headline", file: "gradient-text-demo.tsx" },
    { name: "gradient-text-shiny", title: "Shiny", file: "gradient-text-shiny.tsx" },
  ],
  ai: {
    summary:
      "Wrap a few words: <GradientText>ship software</GradientText> inside a heading, or as=\"h2\". variant=\"flow\" (default) drifts the gradient; variant=\"shiny\" adds a periodic white glint. Colors default to --chart-1/4/5/3.",
    whenToUse: [
      "Highlighting two or three words in a hero headline",
      "Product or plan names (shiny)",
    ],
    whenNotToUse: [
      "Body text or long passages (contrast varies along the gradient)",
      "A muted loading shimmer on status text (use shimmer-text)",
    ],
    composesWith: ["word-rotate", "shimmer-text"],
    customization: [
      "variant: flow | shiny",
      "colors: CSS colors or var(--chart-n); angle in degrees (default 100)",
      "duration: seconds per drift (default 6) or sweep (default 1.4); repeatDelay for shiny (default 2.4)",
      "shineColor: glint color for the shiny variant (default near-white; keep colors saturated so it shows)",
      "Add pb-[0.08em] if descenders clip at large sizes",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
