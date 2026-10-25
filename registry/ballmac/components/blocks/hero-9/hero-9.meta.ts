import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "hero-9",
  type: "registry:block",
  title: "Hero 9: a tree of particles",
  description:
    "A calm, memorable hero: a tree of points grows from the bottom of the section and the message sits above it. No photo needed, theme aware, still under reduced motion.",
  category: "blocks",
  blockCategory: "hero",
  tags: ["hero", "particles", "canvas", "ai", "dark", "background", "generative", "landing"],
  files: [{ path: "components/blocks/hero-9/hero-9.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "particle-tree"],
  examples: [
    { name: "hero-9-demo", title: "Default", file: "hero-9-demo.tsx" },
    { name: "hero-9-dark", title: "On a dark page", file: "hero-9-dark.tsx" },
  ],
  statesNone: "Static content: nothing to load, submit or fail.",
  ai: {
    summary:
      "Hero with a generative particle tree behind centered text. <Hero9 eyebrow title description primaryAction={{ label, href }} secondaryAction note seed />. The tree is the ParticleTree component (decoration, aria-hidden, reduced-motion safe); change seed to change its shape. It looks best on a dark surface: add the dark class to the section or the page.",
    whenToUse: ["A launch, waitlist or AI product page that wants one calm, memorable image", "A hero with no screenshot to show yet"],
    whenNotToUse: ["Products that sell on their UI; use hero-1 or hero-7", "Pages where the headline is long"],
    composesWith: ["logo-cloud-1", "features-1", "testimonials-1", "header-1"],
    a11y: [
      { keys: "Heading", action: "One h1, named by the section" },
      { keys: "Actions", action: "Real links with visible focus" },
      { keys: "Tree", action: "Decoration: aria-hidden, no pointer events, and drawn once and still with reduced motion" },
    ],
    customization: ["eyebrow, title, description, note", "primaryAction and secondaryAction", "seed"],
  },
  version: "1.0.0",
  updated: "2026-10-25",
})
