import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "inventory-1",
  type: "registry:block",
  title: "Inventory 1: stock levels and reordering",
  description:
    "A stock overview: stock value, lines low or out, units on the way, and every item with a bar against its reorder point, days of cover at today's pace, status in words, and an order form that suggests how many to buy.",
  category: "blocks",
  blockCategory: "inventory",
  tags: ["inventory", "stock", "warehouse", "reorder", "products", "sku", "supply", "ecommerce", "low stock", "levels"],
  files: [{ path: "components/blocks/inventory-1/inventory-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "input", "match-highlight", "skeleton", "state-view"],
  examples: [
    { name: "inventory-1-demo", title: "Mixed stock", file: "inventory-1-demo.tsx" },
    { name: "inventory-1-ordering", title: "Ordering open", file: "inventory-1-ordering.tsx" },
    { name: "inventory-1-loading", title: "Loading", file: "inventory-1-loading.tsx" },
    { name: "inventory-1-empty", title: "No stock recorded", file: "inventory-1-empty.tsx" },
    { name: "inventory-1-error", title: "Could not load", file: "inventory-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "inventory-1-loading", trigger: "state=\"loading\"", note: "Skeleton cards and table under the real heading, announced as loading." },
    { id: "empty", title: "No stock recorded", example: "inventory-1-empty", trigger: "state=\"empty\" (or items={[]})", note: "Says to add products or connect a store; emptyState sets the copy. A search with no match says so with Clear filters." },
    { id: "error", title: "Could not load", example: "inventory-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). An order that fails says nothing was charged, in place." },
  ],
  ai: {
    summary:
      "A stock overview. <Inventory1 items={[{ id, sku, name, category, onHand, reorderAt, perDay, cost, incoming: { qty, eta } }]} currency locale onReorder={(item, qty) => Promise} />. Status is Out of stock (0), Low (at or under reorderAt), Plenty (over four times reorderAt) or In stock; days left is onHand divided by perDay; stock value is onHand times cost. The suggested order is two reorder points plus fourteen days of sales, minus what is on hand and on the way. Reject onReorder to show the reason; nothing is marked as ordered.",
    whenToUse: ["An ecommerce or warehouse admin: what to reorder first", "A restaurant or retail back office"],
    whenNotToUse: ["A customer-facing product page", "Order history (use a data table)"],
    composesWith: ["tickets-1", "invoice-1", "funnel-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, Enter", action: "Each Reorder button names its product; the order form field is labelled and focused when it opens, and a placed order is announced" },
      { keys: "Status", action: "Out of stock, Low, In stock and Plenty are written beside an icon, and 'N days left' is text; the bar has a text equivalent giving on hand and the reorder point" },
      { keys: "Filters", action: "Buttons say whether they are on and show counts; the number of products shown is announced politely" },
    ],
    customization: ["SKUs are shown left to right in right-to-left layouts, like codes", "The mark on each bar is the reorder point", "Sorting by days left puts what will run out first at the top"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
