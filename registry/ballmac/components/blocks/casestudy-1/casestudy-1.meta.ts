import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "casestudy-1",
  type: "registry:block",
  title: "Case study 1: customer stories",
  description:
    "Customer stories for a marketing page: one featured story with its quote and results counting up, a grid of the others with a headline number each, an industry filter, and pictures drawn from each company's name.",
  category: "blocks",
  blockCategory: "casestudy",
  tags: ["case study", "customer stories", "social proof", "results", "metrics", "testimonials", "marketing", "success stories"],
  files: [{ path: "components/blocks/casestudy-1/casestudy-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "blur-fade", "cover-art", "number-ticker"],
  examples: [
    { name: "casestudy-1-demo", title: "Featured story and grid", file: "casestudy-1-demo.tsx" },
    { name: "casestudy-1-rings", title: "Rings artwork, one story", file: "casestudy-1-rings.tsx" },
  ],
  statesNone: "Static content: nothing to load, submit or fail.",
  ai: {
    summary:
      "Customer stories. <CaseStudy1 stories={[{ id, company, industry, headline, summary, quote, person: { name, role }, metrics: [{ value: 81, suffix: '%', label }], href }]} art='mesh' | 'rings' | 'waves' | 'bars' | 'dots' />. The first story is featured large with its quote; the rest form a grid. An industry filter shows when there are two or more industries. Numbers count up once on scroll and show their final value with reduced motion.",
    whenToUse: ["The social proof section of a marketing site", "A customers page linking to full stories"],
    whenNotToUse: ["Short quotes only (use testimonials-1 or testimonials-2)", "A row of customer logos (use logo-cloud-1)"],
    composesWith: ["hero-1", "testimonials-1", "cta-1", "logo-cloud-1", "footer-1"],
    a11y: [
      { keys: "Tab", action: "Industry buttons (pressed state announced), then one link per story; the whole card is clickable through its headline link" },
      { keys: "Results", action: "Each result is a term and its number in a description list, so a screen reader hears the label with the value" },
      { keys: "Artwork", action: "Decorative and hidden from assistive technology" },
    ],
    customization: ["art picks the picture style of the featured story; the cards vary on their own", "Pictures come from the company name, so identical on server and client", "Arrows and the card layout mirror in right-to-left"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
