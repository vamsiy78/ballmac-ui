import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "ecommerce-3",
  type: "registry:block",
  title: "Ecommerce 3: shopping bag",
  description:
    "A shopping bag that is hard to get wrong: quantities change at once and go back with the reason, removing leaves an Undo, a promo code says why it failed, and a bar shows how far you are from free shipping.",
  category: "blocks",
  blockCategory: "ecommerce",
  tags: ["ecommerce", "cart", "bag", "checkout", "promo code", "shipping", "undo", "order summary"],
  files: [{ path: "components/blocks/ecommerce-3/ecommerce-3.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view", "product-art"],
  examples: [
    { name: "ecommerce-3-demo", title: "Default", file: "ecommerce-3-demo.tsx" },
    { name: "ecommerce-3-free", title: "Free shipping reached", file: "ecommerce-3-free.tsx" },
    { name: "ecommerce-3-loading", title: "Loading", file: "ecommerce-3-loading.tsx" },
    { name: "ecommerce-3-empty", title: "Your bag is empty", file: "ecommerce-3-empty.tsx" },
    { name: "ecommerce-3-error", title: "Could not load", file: "ecommerce-3-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "ecommerce-3-loading", trigger: "state=\"loading\"", note: "Skeleton lines and summary under the real heading, announced as loading." },
    { id: "empty", title: "Your bag is empty", example: "ecommerce-3-empty", trigger: "state=\"empty\"", note: "Says the bag is empty; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "ecommerce-3-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A quantity, remove or promo code that fails says why and changes nothing." },
  ],
  ai: {
    summary:
      "Shopping bag. <Ecommerce3 title lines={[{ id, name, variant, price, quantity, kind, tone, max? }]} currency freeShippingFrom shippingCost onChangeQuantity={(id, q) => Promise} onRemove={(id) => Promise} onApplyPromo={(code) => Promise<{ code, label, amount }>} onCheckout undoMs />. Quantity changes are optimistic and revert with the reason if they reject; Remove waits undoMs (default 5000) so Undo works; a rejected promo shows its message next to the field. Without onApplyPromo the demo code WELCOME10 works.",
    whenToUse: ["The page between a product and a checkout", "A mini-cart screen in an app"],
    whenNotToUse: ["Paying; use ecommerce-4", "Listing items for sale; use ecommerce-1"],
    composesWith: ["ecommerce-4", "ecommerce-1", "ecommerce-2", "header-1"],
    a11y: [
      { keys: "Lines", action: "A list; every control names its item ('One more Aria speaker', 'Remove …')" },
      { keys: "Shipping bar", action: "role=meter with a text value and a sentence above it" },
      { keys: "Promo", action: "A labelled field; errors are alerts linked to the field with aria-invalid" },
      { keys: "Undo", action: "A button that appears in place of the removed line" },
      { keys: "Results", action: "Announced politely; failures are alerts" },
    ],
    customization: ["title and lines", "currency, freeShippingFrom, shippingCost", "onChangeQuantity, onRemove, onApplyPromo, onCheckout", "undoMs"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
