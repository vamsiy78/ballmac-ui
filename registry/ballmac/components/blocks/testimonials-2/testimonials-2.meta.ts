import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "testimonials-2",
  type: "registry:block",
  title: "Testimonials 2: featured quote with avatar picker",
  description: "One large quote at a time with the person, role and a highlighted result. A row of avatars switches quotes with arrow keys; optional gentle autoplay that pauses on hover and focus.",
  category: "blocks",
  blockCategory: "testimonials",
  tags: ["testimonials", "quote", "carousel", "social proof", "avatars"],
  files: [{ path: "components/blocks/testimonials-2/testimonials-2.tsx" }],
  dependencies: ["lucide-react", "motion@^12", "radix-ui"],
  registryDependencies: ["shadcn:utils", "avatar", "badge", "button"],
  examples: [
    { name: "testimonials-2-demo", title: "Default", file: "testimonials-2-demo.tsx" },
    { name: "testimonials-2-autoplay", title: "Autoplay", file: "testimonials-2-autoplay.tsx" },
  ],
  ai: {
    summary: "A focused testimonial section. Pass items=[{ quote, name, role, company, image?, result? }]; control the index with value/onValueChange or let it manage itself.",
    whenToUse: ["Three to five strong quotes", "Above a pricing or CTA section"],
    whenNotToUse: ["Many short reviews (use testimonials-1)"],
    composesWith: ["stats-1", "pricing-2", "cta-1", "logo-cloud-1"],
    a11y: [
      { keys: "Arrow Left / Right", action: "Moves to the previous or next quote" },
      { keys: "Home / End", action: "Jumps to the first or last quote" },
      { keys: "Tab", action: "Moves from the avatars into the quote" },
    ],
    customization: ["items: { quote, name, role, company, image?, result? }[]", "autoplay: milliseconds between quotes (0 = manual)", "value / defaultValue / onValueChange"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
