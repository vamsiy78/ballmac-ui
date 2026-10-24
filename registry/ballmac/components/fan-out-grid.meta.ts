import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "fan-out-grid",
  type: "registry:ui",
  title: "Fan-out Grid",
  description:
    "Many things done at once as a grid of tiles, one per file or record, marked by state with an icon and a word, a segmented progress bar, filters, arrow-key movement in every direction, and Retry for the ones that failed.",
  category: "ai",
  tags: ["ai", "agents", "batch", "parallel", "grid", "progress", "retry", "fan-out", "bulk"],
  files: [{ path: "components/fan-out-grid.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "motion-presets"],
  examples: [
    { name: "fan-out-grid-demo", title: "48 invoices in flight", file: "fan-out-grid-demo.tsx" },
    { name: "fan-out-grid-done", title: "Everything finished", file: "fan-out-grid-done.tsx" },
  ],
  ai: {
    summary:
      "items is [{ id, label, status: queued | running | done | failed | skipped, detail?, duration? }] (required); title, selected / defaultSelected / onSelectedChange. onRetry(ids) adds Retry buttons (all failed, and one on a selected failed tile); reject and the card says why. Filters appear for the states that have items. The header counts finished (done, failed and skipped) of the total.",
    whenToUse: ["Showing a batch where one agent task runs over many files, rows or records", "Bulk operations where the question is 'which ones failed?'"],
    whenNotToUse: ["A handful of named steps; use plan-tracker", "Work waiting in order; use agent-queue", "A density of numbers by two dimensions; use heat-grid"],
    composesWith: ["agent-queue", "agent-tree", "agent-12", "run-ledger"],
    a11y: [
      { keys: "Tiles", action: "Buttons named for the item and its state, such as 'invoice-004.pdf, failed'; one tile is in the tab order and the arrow keys move in every direction, with Home and End" },
      { keys: "State", action: "Never only colour: done, running, failed and skipped each have their own icon, and the state is a word in the name and in the detail" },
      { keys: "Bar", action: "The segmented bar is an image with a spoken total; the header says it in words too" },
      { keys: "Filters", action: "Toggle buttons with pressed state and counts" },
      { keys: "Retry", action: "Native buttons; a failure is an alert and nothing is changed" },
    ],
    customization: ["items and title", "selected and onSelectedChange", "onRetry"],
  },
  statesNone: "A presentational grid: the items are passed in with their own status, so it has nothing of its own to load. A filter with no match says so.",
  version: "1.0.0",
  updated: "2026-10-25",
})
