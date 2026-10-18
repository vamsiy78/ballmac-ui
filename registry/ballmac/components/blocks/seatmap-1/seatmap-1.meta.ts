import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "seatmap-1",
  type: "registry:block",
  title: "Seat map 1: choose seats",
  description:
    "A seat map for a cinema or venue: rows with walkways, price tiers, taken and wheelchair seats marked in words, a limit and running total, a best-seats-together helper, keyboard arrows, and a hold that survives a lost seat.",
  category: "blocks",
  blockCategory: "seatmap",
  tags: ["seat map", "seat picker", "cinema", "theatre", "tickets", "booking", "venue", "seating chart", "event", "reservation"],
  files: [{ path: "components/blocks/seatmap-1/seatmap-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "seatmap-1-demo", title: "Choosing seats", file: "seatmap-1-demo.tsx" },
    { name: "seatmap-1-chosen", title: "Seats chosen", file: "seatmap-1-chosen.tsx" },
    { name: "seatmap-1-conflict", title: "A seat is lost", file: "seatmap-1-conflict.tsx" },
    { name: "seatmap-1-loading", title: "Loading", file: "seatmap-1-loading.tsx" },
    { name: "seatmap-1-empty", title: "No showing chosen", file: "seatmap-1-empty.tsx" },
    { name: "seatmap-1-error", title: "Could not load", file: "seatmap-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "seatmap-1-loading", trigger: "state=\"loading\"", note: "A skeleton hall and summary under the real heading, announced as loading." },
    { id: "empty", title: "No showing chosen", example: "seatmap-1-empty", trigger: "state=\"empty\"", note: "Says to choose a date and time first; emptyState sets the copy and can add a button." },
    { id: "error", title: "Could not load", example: "seatmap-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was held, with Try again (onRetry). A hold that fails says nothing was charged; a lost seat is marked taken and the others stay chosen." },
  ],
  ai: {
    summary:
      "A seat picker. <Seatmap1 show tiers={[{ id, label, price }]} rows={[{ row: 'A', tier: 'std', seats: 12, gaps: [6] }]} taken={['B4']} accessible={['A1']} maxSeats={6} currency locale defaultSelected={['C5']} onContinue={(seats, total) => Promise} />. Seat ids are the row letter plus the number ('C7'); gaps are numbers left empty for walkways. Pick for me chooses the best block of neighbouring seats for the party size. Reject onContinue with an error that has taken: ['C7'] and those seats become taken while the rest stay chosen; any other rejection shows its message.",
    whenToUse: ["Cinema, theatre, concert and event seat selection", "Any fixed-seat booking such as trains or classrooms"],
    whenNotToUse: ["General admission tickets (use event-1)", "A table or room booking by time (use a calendar)"],
    composesWith: ["event-1", "invoice-1", "locations-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, then arrows, Home and End", action: "The hall is a grid with one tab stop; Left and Right move along a row, Up and Down to the nearest seat in the next row; Enter or Space chooses" },
      { keys: "Each seat", action: "Reads 'Row C, seat 7, Premium, $16.00, available' (or selected, taken, wheelchair space); taken seats are marked with an X and the word, not only grey" },
      { keys: "Choices", action: "Adding, removing and picking seats for you are announced politely; reaching the limit says so in an alert" },
    ],
    customization: ["rows and tiers are plain data, so any hall shape works", "The hall keeps seat 1 on the left in every language, like a floor plan", "A hold that fails never clears seats that are still free"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
