import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "plan-selector",
  type: "registry:ui",
  title: "Plan Selector",
  description:
    "Pricing plan cards that work as a radio group, with a Monthly/Yearly switch that re-prices every plan, a highlighted plan, feature lists and form submission.",
  category: "saas",
  tags: ["pricing", "plans", "radio", "billing toggle"],
  files: [{ path: "components/plan-selector.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "motion-presets", "i18n"],
  examples: [
    { name: "plan-selector-demo", title: "Three plans", file: "plan-selector-demo.tsx" },
    { name: "plan-selector-states", title: "Controlled, one unavailable", file: "plan-selector-states.tsx" },
  ],
  ai: {
    summary:
      "plans: {id,name,price:{monthly,yearly},features,highlight,disabled}. value/onValueChange pick a plan; billing/onBillingChange switch period; name submits with a form.",
    whenToUse: ["Upgrade and signup flows", "Pricing sections where visitors choose a plan"],
    whenNotToUse: ["A feature comparison grid; use comparison-table", "Displaying the current plan; use billing-card"],
    composesWith: ["billing-card", "comparison-table", "radio-group"],
    a11y: [
      { keys: "Arrow keys / Space", action: "Native radio behavior between plans and the billing switch" },
      { keys: "Screen readers", action: "Announced as a radio group with position, name and price" },
      { keys: "Reduced motion", action: "Price changes swap instantly" },
    ],
    customization: ["highlight ribbon", "priceNote", "currency and locale", "disabled plans"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
