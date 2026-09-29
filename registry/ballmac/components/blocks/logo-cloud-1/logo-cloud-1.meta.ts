import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "logo-cloud-1",
  type: "registry:block",
  title: "Logo Cloud 1: marquee or grid",
  description: "Customer logos as an endlessly scrolling row with faded edges, or a static grid with hairline dividers. Wordmarks brighten on hover.",
  category: "blocks",
  blockCategory: "logo-cloud",
  tags: ["logos", "social proof", "customers", "marquee"],
  files: [{ path: "components/blocks/logo-cloud-1/logo-cloud-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "marquee"],
  examples: [
    { name: "logo-cloud-1-demo", title: "Marquee", file: "logo-cloud-1-demo.tsx" },
    { name: "logo-cloud-1-grid", title: "Grid", file: "logo-cloud-1-grid.tsx" },
  ],
  ai: {
    summary: "Social proof strip under a hero. Pass `logos` ({ name, icon? | logo? }[]) with your customers' SVG logos via `logo`; choose variant \"marquee\" or \"grid\".",
    whenToUse: ["Directly under a hero", "Near pricing to reassure buyers"],
    whenNotToUse: ["Fewer than four logos (use a single line of text)"],
    composesWith: ["hero-1", "hero-2", "testimonials-1"],
    customization: ["title, logos, variant props", "Marquee speed and gap in the source"],
  },
  version: "1.0.0",
  updated: "2026-09-29",
})
