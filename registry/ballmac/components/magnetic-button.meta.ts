import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "magnetic-button",
  type: "registry:ui",
  title: "Magnetic Button",
  description:
    "The Ballmac Button with a magnetic pull: it drifts toward a nearby mouse pointer on a spring, and its label moves a little further for depth. Takes every Button prop.",
  category: "motion",
  tags: ["button", "cta", "hover", "spring", "pointer", "motion"],
  files: [{ path: "components/magnetic-button.tsx" }],
  dependencies: ["motion@^12"],
  registryDependencies: ["shadcn:utils", "button", "motion-presets"],
  examples: [{ name: "magnetic-button-demo", title: "Default", file: "magnetic-button-demo.tsx" }],
  ai: {
    summary:
      "Use like Button (variant, size, shape, loading, onClick…). The pull only reacts to a mouse, stops while disabled or loading, and is off under reduced motion, where it is a plain Button.",
    whenToUse: [
      "The single primary call to action in a hero or pricing section",
      "A playful secondary action on a marketing page",
    ],
    whenNotToUse: [
      "Forms, toolbars and dense UI (use button)",
      "Several buttons side by side; one magnetic button per view keeps it meaningful",
      "Rendering a link (not supported; use an <a> with buttonVariants instead)",
    ],
    composesWith: ["button", "border-beam"],
    a11y: [
      { keys: "Enter / Space", action: "Activates the button" },
      { keys: "Tab", action: "Moves focus to the button" },
    ],
    customization: [
      "strength: fraction of the pointer offset the button follows (default 0.2)",
      "radius: px outside the button where the pull starts, fading to zero at the edge (default 72)",
      "All Button props: variant, size, shape, loading; wrapperClassName styles the layout wrapper",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
