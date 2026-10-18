import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "trip-1",
  type: "registry:block",
  title: "Trip 1: day-by-day itinerary",
  description:
    "A trip itinerary: destination, dates and a countdown, then day by day what is booked and when with copyable booking codes and unbooked items marked in words, a cost breakdown, per-person total, type filters and a packing list with progress.",
  category: "blocks",
  blockCategory: "trip",
  tags: ["trip", "itinerary", "travel", "vacation", "holiday", "plan", "flights", "hotel", "packing", "booking"],
  files: [{ path: "components/blocks/trip-1/trip-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "copy-button", "cover-art"],
  examples: [
    { name: "trip-1-demo", title: "A long weekend", file: "trip-1-demo.tsx" },
    { name: "trip-1-underway", title: "Under way, all booked", file: "trip-1-underway.tsx" },
  ],
  statesNone: "Static content with its own filters and checklist: nothing to load, submit or fail.",
  ai: {
    summary:
      "A trip itinerary. <Trip1 title destination dates={['2026-11-06', '2026-11-09']} travelers={['Mara', 'Theo']} items={[{ id, kind: 'flight' | 'stay' | 'food' | 'activity' | 'transport', date, time: '08:15', title, detail, ref: 'TP1351', cost, pending }]} packing={[{ id, label, done }]} currency locale today='2026-10-18' />. Nights, days to go, the total, the per-person cost and the cost by type are worked out from the items; a pending item says Not booked yet and is listed in a notice. Pass today yourself; the block never reads the clock.",
    whenToUse: ["A shared trip plan or a confirmation page for a booked trip", "Travel apps and agency itineraries"],
    whenNotToUse: ["Booking flights or hotels (use a booking flow)", "A single event agenda (use event-1)"],
    composesWith: ["event-1", "locations-1", "invoice-1", "header-1"],
    a11y: [
      { keys: "Tab, Space", action: "Filters say whether they are on; each packing item is a checkbox and the count (2 of 6) and a progress bar update politely; each booking code has a Copy button naming it" },
      { keys: "Days", action: "Each day is a heading ('Day 2 Saturday 7 November') in an ordered list, with items in time order" },
      { keys: "Booked or not", action: "'Not booked yet' is written on the item and summarised in a status notice, not only colored" },
    ],
    customization: ["kind picks the icon and tint", "Booking codes and times are shown left to right in right-to-left layouts, like codes", "Dates, weekdays and money follow the locale and currency"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
