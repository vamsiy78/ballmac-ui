import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "ecommerce-5",
  type: "registry:block",
  title: "Ecommerce 5: order tracking",
  description:
    "An order tracking page that answers where it is and when it arrives: a sentence on top, five stages with the current one marked in words, the carrier's log, a tracking number to copy, and the right next action.",
  category: "blocks",
  blockCategory: "ecommerce",
  tags: ["ecommerce", "order", "tracking", "delivery", "shipping", "timeline", "returns", "status"],
  files: [{ path: "components/blocks/ecommerce-5/ecommerce-5.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view", "product-art"],
  examples: [
    { name: "ecommerce-5-demo", title: "Default", file: "ecommerce-5-demo.tsx" },
    { name: "ecommerce-5-delivered", title: "Delivered", file: "ecommerce-5-delivered.tsx" },
    { name: "ecommerce-5-loading", title: "Loading", file: "ecommerce-5-loading.tsx" },
    { name: "ecommerce-5-empty", title: "Order not found", file: "ecommerce-5-empty.tsx" },
    { name: "ecommerce-5-error", title: "Could not load", file: "ecommerce-5-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "ecommerce-5-loading", trigger: "state=\"loading\"", note: "Skeleton header, progress and panels under the page, announced as loading." },
    { id: "empty", title: "Order not found", example: "ecommerce-5-empty", trigger: "state=\"empty\"", note: "Says the order could not be found; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "ecommerce-5-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). Starting a return or changing delivery that fails says why." },
  ],
  ai: {
    summary:
      "Order tracking. <Ecommerce5 order={{ number, placed, total, stage: 'ordered'|'packed'|'shipped'|'out'|'delivered', eta, carrier, tracking, address, items, events }} onStartReturn={(number) => Promise} onChangeDelivery={(number) => Promise} />. The heading is the ETA sentence, or 'Your order has arrived'. Change delivery shows before the order ships, Start a return once it is delivered. Events are newest first.",
    whenToUse: ["The page a customer opens from the shipping email", "An orders area in an account"],
    whenNotToUse: ["Choosing what to buy; use ecommerce-1", "Paying; use ecommerce-4"],
    composesWith: ["ecommerce-4", "ecommerce-3", "header-1", "footer-1"],
    a11y: [
      { keys: "Progress", action: "An ordered list with aria-current on the current stage; each stage says (done), (now) or (not yet)" },
      { keys: "Log", action: "An ordered list, newest first, with the time and place in text" },
      { keys: "Tracking number", action: "A copy button with a name; the result is announced" },
      { keys: "Actions", action: "Native buttons with busy state; results announced, failures are alerts" },
    ],
    customization: ["order", "onStartReturn and onChangeDelivery"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
