import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "calculator-1",
  type: "registry:block",
  title: "Calculator 1: pricing estimator",
  description:
    "A pricing estimator: sliders for seats, requests and storage, monthly or yearly, add-ons, and a dark summary that picks the cheapest plan that fits, rolls the total as you move, itemizes the sum and offers Talk to us beyond the plans.",
  category: "blocks",
  blockCategory: "calculator",
  tags: ["calculator", "pricing", "estimator", "usage", "sliders", "cost", "plans", "quote", "seats", "pay as you go"],
  files: [{ path: "components/blocks/calculator-1/calculator-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "animated-number-flow", "button", "checkbox", "segmented-control", "slider"],
  examples: [
    { name: "calculator-1-demo", title: "Yearly, twelve people", file: "calculator-1-demo.tsx" },
    { name: "calculator-1-enterprise", title: "Beyond the plans", file: "calculator-1-enterprise.tsx" },
  ],
  statesNone: "Static content: nothing to load, submit or fail.",
  ai: {
    summary:
      "A usage-based pricing calculator. <Calculator1 plans={[{ id, name, base, perSeat, maxSeats, includedRequests, perThousand, includedStorage, perGb }]} addons={[{ id, name, description, price, per: 'seat' | 'account' }]} yearlyDiscount={0.2} currency='USD' locale onContinue={(estimate) => ...} onTalk />. It picks the cheapest plan whose maxSeats fits, shows each line of the sum and the cost on the other plans, and shows Talk to us when no plan fits. Prices are numbers per month.",
    whenToUse: ["A pricing page for per-seat or usage-based products", "Helping a buyer size a plan before they talk to sales"],
    whenNotToUse: ["Fixed tiers with a feature list (use pricing-1 to pricing-4)", "A checkout form"],
    composesWith: ["pricing-1", "faq-1", "cta-1", "comparison-1"],
    a11y: [
      { keys: "Tab, then arrow keys", action: "Each slider is a labelled slider; arrows move one step, Home and End jump to the ends, and the value is read aloud with its unit" },
      { keys: "Result", action: "The suggested plan and monthly price are announced politely as the sliders move" },
      { keys: "Add-ons", action: "Checkboxes inside a labelled group, each with its price in text" },
    ],
    customization: ["Plans and add-ons are plain data, so any pricing model that is a base plus seats plus overage fits", "Requests and storage move along fixed steps, so the slider is never at an awkward number", "The total's digits roll; with reduced motion it changes at once"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
