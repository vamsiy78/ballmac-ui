import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "oncall-1",
  type: "registry:block",
  title: "On-call 1: weekly rota",
  description:
    "An on-call rota for the week: who is on call now per layer, a grid of days by primary and secondary, days nobody covers called out in words, and a selected shift you can take or ask the person on it to swap.",
  category: "blocks",
  blockCategory: "oncall",
  tags: ["on-call", "rota", "schedule", "incident", "pager", "sre", "devops", "shifts"],
  files: [{ path: "components/blocks/oncall-1/oncall-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "oncall-1-demo", title: "Default", file: "oncall-1-demo.tsx" },
    { name: "oncall-1-covered", title: "Every shift covered", file: "oncall-1-covered.tsx" },
    { name: "oncall-1-loading", title: "Loading", file: "oncall-1-loading.tsx" },
    { name: "oncall-1-empty", title: "No rota yet", file: "oncall-1-empty.tsx" },
    { name: "oncall-1-error", title: "Could not load", file: "oncall-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "oncall-1-loading", trigger: "state=\"loading\"", note: "Skeleton for the banner and the grid under the real heading, announced as loading." },
    { id: "empty", title: "No rota yet", example: "oncall-1-empty", trigger: "state=\"empty\"", note: "Says no rota exists yet; emptyState sets the copy and can add a button." },
    { id: "error", title: "Could not load", example: "oncall-1-error", trigger: "state=\"error\"", note: "An alert saying nobody was changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A weekly on-call rota. <Oncall1 days={[{ label: 'Mon 20', full: 'Monday 20 October' }]} layers={[{ id, name: 'Primary', people: ['Priya Shah', null, ...] }]} todayIndex={4} handover='09:00' me='Priya Shah' onTake={(shift) => Promise} onRequestSwap={(shift) => Promise} />. null in people means nobody; uncovered shifts are listed in words. Select a shift to take it or ask for a swap.",
    whenToUse: ["An operations page showing who gets paged this week", "A team calendar for support or engineering cover"],
    whenNotToUse: ["A shift roster for hourly staff; use roster-1", "A calendar of events; use calendar-1"],
    composesWith: ["incident-1", "status-1", "access-1", "app-shell-1"],
    a11y: [
      { keys: "Table", action: "Layers are row headers and days are column headers named in full ('Friday 24 October'); each shift button reads 'Primary, Friday 24 October: Theo Nakamura'" },
      { keys: "Select a shift", action: "A toggle button (aria-pressed); the details and the result of taking or swapping are a polite live region" },
      { keys: "Gaps", action: "Written as a sentence listing each uncovered shift, and 'Nobody' in the cell; red only reinforces it" },
      { keys: "Colour", action: "A person's tint helps a run of days read as one shift; names are always written" },
    ],
    customization: ["days, layers and todayIndex", "handover text", "me: the person using the page", "onTake and onRequestSwap; reject and the message says it did not go through"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
