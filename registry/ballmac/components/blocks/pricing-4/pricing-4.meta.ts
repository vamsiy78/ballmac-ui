import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "pricing-4",
  type: "registry:block",
  title: "Pricing 4: one-time license vs subscription",
  description: "A pricing section for Mac apps that sell both ways: a Buy once / Subscribe switch, license size cards and a cumulative-cost chart that computes the break-even year.",
  category: "blocks",
  blockCategory: "pricing",
  tags: ["pricing", "license", "subscription", "one-time", "mac", "chart", "break-even"],
  files: [{ path: "components/blocks/pricing-4/pricing-4.tsx" }],
  dependencies: ["lucide-react", "recharts@^3"],
  registryDependencies: ["shadcn:utils", "button", "chart", "label", "radio-group", "segmented-control", "switch"],
  examples: [
    { name: "pricing-4-demo", title: "Default", file: "pricing-4-demo.tsx" },
    { name: "pricing-4-custom", title: "Two tiers in euros", file: "pricing-4-custom.tsx" },
  ],
  ai: {
    summary: "Pricing for apps with a one-time license and a subscription. Pass tiers=[{ id, name, description?, once, yearly }], optional renewal (price of paid updates after year 1), years, currency and href(tierId, mode). The chart and the 'pays for itself in year N' message are computed from the numbers.",
    whenToUse: ["Mac and desktop apps that offer a perpetual license next to a subscription", "When you want to show buyers the long-run cost honestly"],
    whenNotToUse: ["Monthly SaaS plans with feature tiers (pricing-1 or pricing-3)"],
    composesWith: ["download-1", "faq-2", "cta-1", "showcase-1"],
    a11y: [
      { keys: "Arrow Left / Right on the way-to-pay switch", action: "Switches between Buy once and Subscribe" },
      { keys: "Arrow Up / Down on license size", action: "Selects another size and updates the price and chart" },
      { keys: "Space on the updates switch", action: "Includes optional update renewals in the one-time cost" },
    ],
    customization: ["renewal: a number, or { [tierId]: number }; 0 hides the updates switch", "href: build the checkout link from the tier and mode", "onceIncludes / subscribeIncludes: the checklist for each way to pay"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
