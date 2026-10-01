import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "blur-fade",
  type: "registry:ui",
  title: "Blur Fade",
  description:
    "A wrapper that fades content in while it unblurs and slides a few pixels, once it scrolls into view, with a group that staggers its children.",
  category: "motion",
  tags: ["fade", "blur", "reveal", "scroll", "stagger"],
  files: [{ path: "components/blur-fade.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "blur-fade-demo", title: "Staggered page intro", file: "blur-fade-demo.tsx" },
    { name: "blur-fade-directions", title: "Directions and blur", file: "blur-fade-directions.tsx" },
  ],
  ai: {
    summary:
      "Wrap anything in <BlurFade delay direction offset blur inView once>. <BlurFadeGroup stagger> wraps each child and staggers them. Shows content instantly under reduced motion.",
    whenToUse: ["Hero and section intros", "Lists and cards that should arrive in sequence"],
    whenNotToUse: ["Text that should animate letter by letter (text-animate)", "Content that must be visible without JavaScript before hydration"],
    composesWith: ["text-animate", "bento-grid", "card"],
    a11y: [
      { keys: "Reduced motion", action: "Content appears at once with no blur or travel" },
      { keys: "Screen readers", action: "Content is in the DOM from the start; only opacity, blur and position change" },
    ],
    customization: ["direction: up | down | left | right | none", "offset and blur amounts", "inView, once, delay, duration", "BlurFadeGroup stagger and item settings"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
