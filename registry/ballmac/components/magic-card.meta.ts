import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "magic-card",
  type: "registry:ui",
  title: "Magic Card",
  description:
    "A card with a two-color light that follows the pointer along its border, with an optional soft glow inside, driven by CSS variables so moving never re-renders, and a steady light on keyboard focus.",
  category: "motion",
  tags: ["card", "hover", "gradient", "border", "pointer"],
  files: [{ path: "components/magic-card.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils"],
  examples: [
    { name: "magic-card-demo", title: "Feature grid", file: "magic-card-demo.tsx" },
    { name: "magic-card-colors", title: "Color pairs", file: "magic-card-colors.tsx" },
  ],
  ai: {
    summary:
      "<MagicCard from to size glow contentClassName>content</MagicCard>. from and to are chart tokens. Use spotlight-card for a single soft glow and this for a colored border light.",
    whenToUse: ["Feature and pricing cards on dark or light pages", "Any card grid that should feel responsive to the pointer"],
    whenNotToUse: ["Dense data UI", "Cards that are not interactive"],
    composesWith: ["spotlight-card", "tilt-card", "bento-grid"],
    a11y: [
      { keys: "Focus", action: "A centered light shows when anything inside has focus" },
      { keys: "Reduced motion", action: "No pointer tracking; a plain border remains" },
    ],
    customization: ["from and to tones", "size", "glow", "contentClassName"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
