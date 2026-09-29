import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "testimonials-1",
  type: "registry:block",
  title: "Testimonials 1: scrolling wall of quotes",
  description: "A wall of testimonial cards in three columns that scroll at different speeds in opposite directions, pausing on hover, with a plain list on phones.",
  category: "blocks",
  blockCategory: "testimonials",
  tags: ["testimonials", "social proof", "quotes", "marquee"],
  files: [{ path: "components/blocks/testimonials-1/testimonials-1.tsx" }],
  registryDependencies: ["shadcn:utils", "avatar", "marquee"],
  examples: [{ name: "testimonials-1-demo", title: "Default", file: "testimonials-1-demo.tsx" }],
  ai: {
    summary: "Social proof section: pass `testimonials` ({ quote, name, role }[]); they are spread across three vertical marquees. Replace the placeholder quotes with real ones.",
    whenToUse: ["Landing pages after features or pricing", "Showing many short quotes without a carousel"],
    whenNotToUse: ["One or two quotes (use a single large quote in a section)"],
    composesWith: ["features-1", "pricing-1", "cta-1"],
    customization: ["eyebrow, title, description, testimonials props", "Column speed and direction are set per column in the source"],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
