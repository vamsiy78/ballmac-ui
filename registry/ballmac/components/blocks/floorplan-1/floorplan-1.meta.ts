import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "floorplan-1",
  type: "registry:block",
  title: "Floorplan 1: restaurant floor",
  description:
    "A restaurant floor plan: tables where they stand, worded as free, seated, reserved or needs clearing, a waiting list, seat a party at a table that fits, clear or clean a table, all undone with the reason if it fails.",
  category: "blocks",
  blockCategory: "floorplan",
  tags: ["restaurant", "floor plan", "tables", "seating", "host", "reservations", "waitlist", "hospitality"],
  files: [{ path: "components/blocks/floorplan-1/floorplan-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "floorplan-1-demo", title: "Default", file: "floorplan-1-demo.tsx" },
    { name: "floorplan-1-busy", title: "Fully seated", file: "floorplan-1-busy.tsx" },
    { name: "floorplan-1-loading", title: "Loading", file: "floorplan-1-loading.tsx" },
    { name: "floorplan-1-empty", title: "No tables set up", file: "floorplan-1-empty.tsx" },
    { name: "floorplan-1-error", title: "Could not load", file: "floorplan-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "floorplan-1-loading", trigger: "state=\"loading\"", note: "Skeleton plan under the real heading, announced as loading." },
    { id: "empty", title: "No tables set up", example: "floorplan-1-empty", trigger: "state=\"empty\"", note: "Says no tables are set up; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "floorplan-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A seat or clear that fails goes back and says why." },
  ],
  ai: {
    summary:
      "Restaurant floor. <Floorplan1 tables={[{ id, name, seats, x, y, shape?: 'round'|'square'|'wide', status: 'free'|'seated'|'reserved'|'dirty', party?, reservation? }]} waiting={[{ id, name, size, waited }]} onSeat={(tableId, party) => Promise} onStatus={(tableId, status) => Promise} />. x and y are percentages. Only free or reserved tables that fit the party can be chosen. Changes show at once and are undone if the handler rejects.",
    whenToUse: ["A host stand or front-of-house screen", "Any room plan where things have a place and a state (tables, desks, beds)"],
    whenNotToUse: ["Booking by customers; use salon-1", "Seat selection for an event with hundreds of seats"],
    composesWith: ["salon-1", "queues-1", "kitchen-1"],
    a11y: [
      { keys: "Table", action: "Each table is a button named with its name, seats and state in words, not only colour" },
      { keys: "Seat", action: "A labelled list of waiting parties; a party that does not fit is not offered" },
      { keys: "Status", action: "Changes and failures are announced in a polite live region" },
      { keys: "Legend", action: "State is also written on the table, so colour is never the only signal" },
    ],
    customization: ["tables, waiting and title", "onSeat and onStatus", "Table shape and position are data"],
  },
  version: "1.0.1",
  updated: "2026-10-25",
  changelog: [
    { version: "1.0.1", date: "2026-10-25", note: "On a phone the floor plan scrolls sideways in its own focusable region, so tables no longer overlap or leave the screen." },
    { version: "1.0.0", date: "2026-10-24", note: "First release." },
  ],
})
