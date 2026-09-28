import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "pricing-1",
  type: "registry:block",
  title: "Pricing 1: two tiers",
  description:
    "Two pricing cards side by side with included and excluded features, a highlighted plan with a border beam and badge, and small print.",
  category: "blocks",
  blockCategory: "pricing",
  tags: ["pricing", "plans", "saas", "tiers"],
  files: [{ path: "components/blocks/pricing-1/pricing-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "badge", "border-beam", "button"],
  examples: [{ name: "pricing-1-demo", title: "Default", file: "pricing-1-demo.tsx" }],
  ai: {
    summary: "Pricing for a free-plus-paid or two-plan product. Pass plans=[{ name, price, period, description, features, cta, featured }].",
    whenToUse: ["Freemium products", "Two-plan pricing pages"],
    whenNotToUse: ["Three or more plans side by side"],
    composesWith: ["faq-1", "cta-1"],
    customization: ["plans: { name, price, period?, description, features: { label, included }[], cta, featured? }[]", "title, description, note props"],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
