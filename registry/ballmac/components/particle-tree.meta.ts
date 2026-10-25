import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "particle-tree",
  type: "registry:ui",
  title: "Particle Tree",
  description:
    "A tree made of thousands of small points, standing on rings that spread across the ground. It sways, parts around the pointer and settles back, pauses off screen, and holds still under reduced motion.",
  category: "backgrounds",
  tags: ["background", "particles", "canvas", "tree", "hero", "ai", "interactive", "generative"],
  files: [{ path: "components/particle-tree.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "color"],
  examples: [
    { name: "particle-tree-demo", title: "The tree and the pointer", file: "particle-tree-demo.tsx" },
    { name: "particle-tree-quiet", title: "Fewer points, one color", file: "particle-tree-quiet.tsx" },
  ],
  ai: {
    summary:
      "Place <ParticleTree /> as the first child of a relative, overflow-hidden container; it fills it (absolute inset-0, aria-hidden, pointer-events-none) and tracks the pointer at window level, so content above it stays clickable. color is the trunk and branches, accent the leaves and ground rings (CSS variable names or any color). density 0.3 to 2, seed changes the shape (the same seed always grows the same tree), radius is how far the pointer pushes points (0 turns it off), rings toggles the ground rings.",
    whenToUse: ["The background of a dark AI, data or developer hero", "A quiet, memorable image for a launch or waitlist page"],
    whenNotToUse: ["Behind long text", "Many instances on one page (each runs its own canvas loop)"],
    composesWith: ["particles", "hero-9", "text-reveal", "shimmer-text"],
    a11y: [
      { keys: "Decoration", action: "aria-hidden and pointer-events-none; content above it stays usable" },
      { keys: "Motion", action: "With reduced motion it is drawn once and does not sway, twinkle or react to the pointer" },
      { keys: "Performance", action: "Stops drawing when off screen or when the tab is hidden" },
    ],
    customization: ["color and accent", "density and seed", "radius", "rings"],
  },
  statesNone: "A decorative canvas: nothing to load or fail.",
  version: "1.0.0",
  updated: "2026-10-25",
})
