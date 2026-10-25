import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "ecommerce-1",
  type: "registry:block",
  title: "Ecommerce 1: product listing with filters",
  description:
    "A product grid that sells: price, sale and rating on each card, color choices, a bag button that says what it did, filters with counts and removable chips, sorting, and results counted aloud.",
  category: "blocks",
  blockCategory: "ecommerce",
  tags: ["ecommerce", "shop", "products", "listing", "filters", "sort", "cart", "grid"],
  files: [{ path: "components/blocks/ecommerce-1/ecommerce-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view", "checkbox", "product-art"],
  examples: [
    { name: "ecommerce-1-demo", title: "Default", file: "ecommerce-1-demo.tsx" },
    { name: "ecommerce-1-sale", title: "Only a few products", file: "ecommerce-1-sale.tsx" },
    { name: "ecommerce-1-loading", title: "Loading", file: "ecommerce-1-loading.tsx" },
    { name: "ecommerce-1-empty", title: "Nothing here yet", file: "ecommerce-1-empty.tsx" },
    { name: "ecommerce-1-error", title: "Could not load", file: "ecommerce-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "ecommerce-1-loading", trigger: "state=\"loading\"", note: "Skeleton filters and product grid under the real heading, announced as loading." },
    { id: "empty", title: "Nothing here yet", example: "ecommerce-1-empty", trigger: "state=\"empty\"", note: "Says there is nothing here yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "ecommerce-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). Adding a product that fails says why on its card." },
  ],
  ai: {
    summary:
      "Product listing. <Ecommerce1 title description products={[{ id, name, price, compareAt?, rating, reviews, category, colors: [{ id, label, tone }], kind, badge? }]} currency onAddToCart={(id, colorId) => Promise} onToggleSaved={(id, saved) => Promise} />. Filters (category, price band, on sale) and sort work on the page; active filters show as removable chips and the result count is announced. On touch screens the bag button is always visible; with a mouse it appears on hover or focus.",
    whenToUse: ["A shop, a collection page or a marketplace category", "Any catalog that needs filters and quick add"],
    whenNotToUse: ["One product in detail; use ecommerce-2", "Ranking data; use bar-list"],
    composesWith: ["ecommerce-2", "ecommerce-3", "header-1", "footer-1"],
    a11y: [
      { keys: "Filters", action: "Native checkboxes and radios in labelled fieldsets; on small screens behind a button with aria-expanded" },
      { keys: "Cards", action: "Color choices are radios named for the color; the heart is a toggle with a name; prices say 'was' for the old price" },
      { keys: "Bag", action: "Native button; the result is shown and spoken, failures are alerts" },
      { keys: "Results", action: "The count is announced politely; chips can be removed with the keyboard" },
    ],
    customization: ["title, description, currency", "products", "onAddToCart and onToggleSaved"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
