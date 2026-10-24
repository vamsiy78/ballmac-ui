import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "rentals-1",
  type: "registry:block",
  title: "Rentals 1: rental booking",
  description:
    "A rental booking page: choose an item, the days and extras, see price, refundable deposit and pay-today, a clash with days already out named by date, and a reservation that says exactly what was booked.",
  category: "blocks",
  blockCategory: "rentals",
  tags: ["rental", "booking", "reservation", "dates", "equipment", "deposit", "hire", "marketplace"],
  files: [{ path: "components/blocks/rentals-1/rentals-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "rentals-1-demo", title: "Default", file: "rentals-1-demo.tsx" },
    { name: "rentals-1-long", title: "Short rentals only", file: "rentals-1-long.tsx" },
    { name: "rentals-1-loading", title: "Loading", file: "rentals-1-loading.tsx" },
    { name: "rentals-1-empty", title: "Nothing to rent", file: "rentals-1-empty.tsx" },
    { name: "rentals-1-error", title: "Could not load", file: "rentals-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "rentals-1-loading", trigger: "state=\"loading\"", note: "Skeleton list and summary under the real heading, announced as loading." },
    { id: "empty", title: "Nothing to rent", example: "rentals-1-empty", trigger: "state=\"empty\"", note: "Says there is nothing to rent; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "rentals-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was reserved, with Try again (onRetry). A reservation that fails keeps the choices and says why." },
  ],
  ai: {
    summary:
      "Rental booking. <Rentals1 items={[{ id, name, detail, perDay, deposit, booked?: ['YYYY-MM-DD'] }]} extras={[{ id, name, perDay }]} maxDays={14} today='YYYY-MM-DD' currency='USD' onReserve={({ item, from, to, extras }) => Promise} />. Both ends of the range count as days. A range that includes a booked day is refused and names it.",
    whenToUse: ["Equipment, vehicle or space hire", "Any date-range booking with a deposit"],
    whenNotToUse: ["A single appointment slot; use salon-1", "A hotel with rooms and guests; use booking-1"],
    composesWith: ["salon-1", "booking-1", "calendar-1"],
    a11y: [
      { keys: "Item", action: "A radio group; each option has its name, detail and daily price" },
      { keys: "Dates", action: "Native date fields with labels; problems are written and announced" },
      { keys: "Summary", action: "A description list; Pay today is only shown when the dates work" },
      { keys: "Result", action: "Confirmation and errors are announced" },
    ],
    customization: ["items, extras, maxDays, today, currency", "onReserve"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
