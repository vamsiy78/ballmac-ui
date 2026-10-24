import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "kitchen-1",
  type: "registry:block",
  title: "Kitchen 1: kitchen display",
  description:
    "A kitchen display: a column per station with the oldest ticket first, items with their changes, allergies always spelled out, late and due-soon tickets written in words, a Bump button and a one-step Recall.",
  category: "blocks",
  blockCategory: "kitchen",
  tags: ["kitchen display", "restaurant", "orders", "pos", "tickets", "hospitality", "food service", "kds"],
  files: [{ path: "components/blocks/kitchen-1/kitchen-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "kitchen-1-demo", title: "Default", file: "kitchen-1-demo.tsx" },
    { name: "kitchen-1-loading", title: "Loading", file: "kitchen-1-loading.tsx" },
    { name: "kitchen-1-empty", title: "No tickets", file: "kitchen-1-empty.tsx" },
    { name: "kitchen-1-error", title: "Could not load", file: "kitchen-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "kitchen-1-loading", trigger: "state=\"loading\"", note: "Skeleton columns under the real heading, announced as loading." },
    { id: "empty", title: "No tickets", example: "kitchen-1-empty", trigger: "state=\"empty\"", note: "Says no tickets; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "kitchen-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was bumped, with Try again (onRetry). A bump that fails puts the ticket back and says why." },
  ],
  ai: {
    summary:
      "A kitchen display system. <Kitchen1 stations={['Grill','Fry','Cold']} tickets={[{ id, number: '128', channel: 'Table 12', station: 'Grill', items: [{ qty, name, mods?: string[], allergy?: string }], elapsed: 95 /* seconds, kept up to date by you */, target: 720 }]} onBump={(ticket) => Promise} onRecall={(ticket) => Promise} />. A ticket is Due soon at 80% of its target and Late past it. It keeps no clock: update elapsed from your own timer or server.",
    whenToUse: ["A screen over the pass in a restaurant or ghost kitchen", "Any station-by-station queue where each job has a target time"],
    whenNotToUse: ["Taking orders at a till; use an ecommerce checkout block", "Pick lists in a warehouse; use dispatch-1 or inventory-1"],
    composesWith: ["dispatch-1", "inventory-1", "app-shell-1", "status-1"],
    a11y: [
      { keys: "Stations", action: "Each column is a labelled region with a heading and a count" },
      { keys: "Late and due soon", action: "Written as words with an icon beside the time; the red border only reinforces it" },
      { keys: "Allergies", action: "Always spelled out as 'Allergy: Peanuts' in a bordered tag" },
      { keys: "Bump and Recall", action: "Large buttons named for the order and station ('Bump order 129 at Fry'); a failed bump is an alert and the ticket stays" },
    ],
    customization: ["stations and tickets", "elapsed and target in seconds", "onBump and onRecall"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
