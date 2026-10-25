import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "ecommerce-2",
  type: "registry:block",
  title: "Ecommerce 2: product page",
  description:
    "A product page that closes the sale: a gallery you step through with arrow keys, price and rating, named color and option choices, a quantity stepper, an add-to-bag button that reports back, fine print one tap away, and reviews.",
  category: "blocks",
  blockCategory: "ecommerce",
  tags: ["ecommerce", "shop", "product page", "gallery", "variants", "reviews", "add to cart", "pdp"],
  files: [{ path: "components/blocks/ecommerce-2/ecommerce-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view", "product-art", "rating-distribution"],
  examples: [
    { name: "ecommerce-2-demo", title: "Default", file: "ecommerce-2-demo.tsx" },
    { name: "ecommerce-2-simple", title: "No second option", file: "ecommerce-2-simple.tsx" },
    { name: "ecommerce-2-loading", title: "Loading", file: "ecommerce-2-loading.tsx" },
    { name: "ecommerce-2-empty", title: "No longer available", file: "ecommerce-2-empty.tsx" },
    { name: "ecommerce-2-error", title: "Could not load", file: "ecommerce-2-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "ecommerce-2-loading", trigger: "state=\"loading\"", note: "Skeleton gallery and details under the page, announced as loading." },
    { id: "empty", title: "No longer available", example: "ecommerce-2-empty", trigger: "state=\"empty\"", note: "Says the product is no longer available; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "ecommerce-2-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). Adding to the bag that fails says why under the button." },
  ],
  ai: {
    summary:
      "Product page. <Ecommerce2 product={{ name, price, compareAt?, summary, kind, colors, option?: { label, values: [{ id, label, available? }] }, details: [{ title, body }], highlights, counts, reviews }} currency onAddToBag={({ color, option, quantity }) => Promise} />. Choosing a color changes the picture; unavailable options are disabled and marked sold out; the total on the button follows the quantity. Details are native disclosure elements.",
    whenToUse: ["The page a buyer reads before they buy", "Any single product with options"],
    whenNotToUse: ["Listing many products; use ecommerce-1", "A pricing table for software; use pricing-2"],
    composesWith: ["ecommerce-1", "ecommerce-3", "reviews-2", "header-1"],
    a11y: [
      { keys: "Gallery", action: "A radio group of pictures; Left and Right move and select; each is named 'Picture n of m: color'" },
      { keys: "Choices", action: "Fieldsets with legends; the selected color is written next to its legend; unavailable options say 'sold out'" },
      { keys: "Quantity", action: "A group with named buttons and a live count" },
      { keys: "Bag", action: "Native button with busy state; success and errors are announced" },
      { keys: "Details", action: "Native details and summary" },
    ],
    customization: ["product", "currency", "onAddToBag"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
