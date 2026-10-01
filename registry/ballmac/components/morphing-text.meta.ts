import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "morphing-text",
  type: "registry:ui",
  title: "Morphing Text",
  description:
    "Words melt into each other with a blur and threshold effect, cycling through a list, pausing when off screen, with a box that never jumps in width.",
  category: "text",
  tags: ["text", "morph", "gooey", "transition", "hero"],
  files: [{ path: "components/morphing-text.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "morphing-text-demo", title: "Big word cycle", file: "morphing-text-demo.tsx" },
    { name: "morphing-text-inline", title: "Inline in a sentence", file: "morphing-text-inline.tsx" },
  ],
  ai: {
    summary:
      "<MorphingText texts={['Build','Ship','Scale']} hold morph className='text-6xl' />. The size comes from className. Uses an SVG threshold filter; the loop stops when off screen or when reduced motion is on.",
    whenToUse: ["A hero word that changes between a few options", "Brand or product-name reveals"],
    whenNotToUse: ["Small body text (the effect needs large type)", "Many words per frame"],
    composesWith: ["word-rotate", "hyper-text", "text-animate"],
    a11y: [
      { keys: "Screen readers", action: "All texts are read once as a list; the morph is hidden" },
      { keys: "Reduced motion", action: "The first text is shown still" },
    ],
    customization: ["texts", "hold and morph in milliseconds", "font size and weight via className"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
