import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "ecommerce-4",
  type: "registry:block",
  title: "Ecommerce 4: checkout",
  description:
    "A three-step checkout on one page: contact, delivery, payment. Finished steps fold into a summary with Edit, mistakes are named beside their field with focus on the first, and a declined card says so and charges nothing.",
  category: "blocks",
  blockCategory: "ecommerce",
  tags: ["ecommerce", "checkout", "payment", "form", "validation", "delivery", "order", "card"],
  files: [{ path: "components/blocks/ecommerce-4/ecommerce-4.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "checkbox", "skeleton", "state-view", "product-art"],
  examples: [
    { name: "ecommerce-4-demo", title: "Default", file: "ecommerce-4-demo.tsx" },
    { name: "ecommerce-4-one", title: "One delivery option", file: "ecommerce-4-one.tsx" },
    { name: "ecommerce-4-loading", title: "Loading", file: "ecommerce-4-loading.tsx" },
    { name: "ecommerce-4-empty", title: "Your bag is empty", file: "ecommerce-4-empty.tsx" },
    { name: "ecommerce-4-error", title: "Could not load", file: "ecommerce-4-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "ecommerce-4-loading", trigger: "state=\"loading\"", note: "Skeleton steps and summary under the real heading, announced as loading." },
    { id: "empty", title: "Your bag is empty", example: "ecommerce-4-empty", trigger: "state=\"empty\"", note: "Says the bag is empty; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "ecommerce-4-error", trigger: "state=\"error\"", note: "An alert saying nothing was charged, with Try again (onRetry). A payment that fails shows the reason above the card fields and charges nothing." },
  ],
  ai: {
    summary:
      "Checkout. <Ecommerce4 title lines methods={[{ id, label, detail, price }]} currency onPlaceOrder={(order) => Promise<string | void>} />. Steps open one at a time and validate on Continue; errors appear next to the field (aria-invalid, aria-describedby) and focus moves to the first. The card number uses a checksum; expiry is checked against today. onPlaceOrder resolves with an order number or rejects with the reason, which is shown as an alert. The sample accepts 4242 4242 4242 4242.",
    whenToUse: ["The last screen before payment in a shop", "A checkout you want to feel calm and honest"],
    whenNotToUse: ["Subscriptions and plan changes; use billing-1", "A shopping bag; use ecommerce-3"],
    composesWith: ["ecommerce-3", "ecommerce-2", "billing-1", "header-1"],
    a11y: [
      { keys: "Steps", action: "An ordered list; each step has a heading; finished steps say 'done' and have an Edit button naming the step" },
      { keys: "Fields", action: "Labelled inputs with the right autocomplete and inputMode; errors are alerts linked to the field" },
      { keys: "Focus", action: "On a failed Continue, focus goes to the first invalid field" },
      { keys: "Payment", action: "Failures are alerts above the card fields; the button shows a busy state" },
      { keys: "Confirmation", action: "A status region with the order number" },
    ],
    customization: ["title, lines, methods, currency", "onPlaceOrder"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
