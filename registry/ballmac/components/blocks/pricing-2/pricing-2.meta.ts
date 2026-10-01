import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "pricing-2",
  type: "registry:block",
  title: "Pricing 2: three tiers with billing toggle",
  description: "Three plan cards with a monthly/yearly switch. Prices roll to the new value, a savings badge and billed-total line update, and the middle plan is lifted with a border beam.",
  category: "blocks",
  blockCategory: "pricing",
  tags: ["pricing", "plans", "toggle", "yearly", "saas", "tiers"],
  files: [{ path: "components/blocks/pricing-2/pricing-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "animated-number-flow", "badge", "border-beam", "button", "segmented-control"],
  examples: [
    { name: "pricing-2-demo", title: "Default", file: "pricing-2-demo.tsx" },
    { name: "pricing-2-custom", title: "Custom plans", file: "pricing-2-custom.tsx" },
  ],
  ai: {
    summary: "Standard SaaS pricing with a billing toggle. Pass plans=[{ name, description, price: { monthly, yearly } | string, unit?, lead?, features, cta, featured? }].",
    whenToUse: ["SaaS products with three plans", "Products that discount annual billing"],
    whenNotToUse: ["Two plans only (use pricing-1)", "Usage-based pricing (use plan-selector or a calculator)"],
    composesWith: ["faq-2", "logo-cloud-1", "cta-1", "pricing-3"],
    a11y: [
      { keys: "Arrow Left / Right", action: "Switches billing interval" },
      { keys: "Status message", action: "Announces the interval being shown" },
    ],
    customization: ["plans: price is { monthly, yearly } per month or a string like 'Custom'", "defaultInterval / interval / onIntervalChange", "discountLabel, currency, note, enterprise (null to hide)"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
