import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "salon-1",
  type: "registry:block",
  title: "Salon 1: appointment booking",
  description:
    "A booking page for a salon or clinic: choose services (time and price add up), a stylist or anyone, then a day and a time that stylist is free, a live summary, and a confirmation that says exactly what was booked.",
  category: "blocks",
  blockCategory: "salon",
  tags: ["booking", "appointments", "salon", "scheduling", "services", "clinic", "beauty", "customer"],
  files: [{ path: "components/blocks/salon-1/salon-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "salon-1-demo", title: "Default", file: "salon-1-demo.tsx" },
    { name: "salon-1-quiet", title: "Fully booked", file: "salon-1-quiet.tsx" },
    { name: "salon-1-loading", title: "Loading", file: "salon-1-loading.tsx" },
    { name: "salon-1-empty", title: "Booking is closed", file: "salon-1-empty.tsx" },
    { name: "salon-1-error", title: "Could not load", file: "salon-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "salon-1-loading", trigger: "state=\"loading\"", note: "Skeleton form and summary under the real heading, announced as loading." },
    { id: "empty", title: "Booking is closed", example: "salon-1-empty", trigger: "state=\"empty\"", note: "Says booking is closed; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "salon-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was booked, with Try again (onRetry). A booking that fails keeps every choice and says why." },
  ],
  ai: {
    summary:
      "Appointment booking. <Salon1 services={[{ id, name, minutes, price }]} stylists={[{ id, name, specialty? }]} days={[{ id, label, slots: [{ time, stylists: ['id'] }] }]} currency='USD' onBook={({ services, stylist, day, time }) => Promise} />. Times show only when the chosen stylist is free; changing stylist or day clears the time. A failed booking keeps the choices.",
    whenToUse: ["A customer-facing booking page", "Any choose-what, choose-who, choose-when flow"],
    whenNotToUse: ["A staff calendar; use calendar-1", "Class or event tickets; use billing-1"],
    composesWith: ["floorplan-1", "rentals-1", "booking-1"],
    a11y: [
      { keys: "Services", action: "Checkboxes in a fieldset, each with time and price in its label" },
      { keys: "Stylist", action: "A radio group; Anyone free is the default" },
      { keys: "Times", action: "Pressed-state buttons in a labelled group; an empty day says why" },
      { keys: "Result", action: "Confirmation and errors are announced; missing choices are alerts" },
    ],
    customization: ["services, stylists, days, currency", "onBook"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
