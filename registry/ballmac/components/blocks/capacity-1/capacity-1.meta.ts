import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "capacity-1",
  type: "registry:block",
  title: "Capacity 1: runway",
  description:
    "How long until each resource runs out: usage against the limit as a meter, growth per day, the days of runway written as words, the soonest first, a button to ask for more, and a plain 'Not growing' for resources that are not.",
  category: "blocks",
  blockCategory: "capacity",
  tags: ["capacity", "runway", "forecast", "storage", "limits", "infrastructure", "planning", "sre"],
  files: [{ path: "components/blocks/capacity-1/capacity-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "capacity-1-demo", title: "Default", file: "capacity-1-demo.tsx" },
    { name: "capacity-1-calm", title: "Plenty of room", file: "capacity-1-calm.tsx" },
    { name: "capacity-1-loading", title: "Loading", file: "capacity-1-loading.tsx" },
    { name: "capacity-1-empty", title: "No resources tracked", file: "capacity-1-empty.tsx" },
    { name: "capacity-1-error", title: "Could not load", file: "capacity-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "capacity-1-loading", trigger: "state=\"loading\"", note: "Skeleton rows under the real heading, announced as loading." },
    { id: "empty", title: "No resources tracked", example: "capacity-1-empty", trigger: "state=\"empty\"", note: "Says no resources tracked; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "capacity-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A request that fails says why." },
  ],
  ai: {
    summary:
      "Capacity runway. <Capacity1 resources={[{ id, name, unit, used, limit, perDay, where? }]} urgentDays={14} planDays={60} onRequest={(resource) => Promise} />. Runway = (limit - used) / perDay, shown as 'Full in about 14 days'; perDay of zero or less says 'Not growing'. Urgent and plan-soon resources come first and offer Ask for more. Exports runway.",
    whenToUse: ["Planning storage, connections or throughput before they run out", "An infrastructure review with a clear next action"],
    whenNotToUse: ["Spend; use cost-1", "Reliability targets; use slo-1"],
    composesWith: ["cost-1", "slo-1", "queues-1", "incident-1"],
    a11y: [
      { keys: "Meter", action: "Each resource is a meter reading '842 of 1,000 GB, 84 percent. Full in about 14 days.'" },
      { keys: "Runway", action: "Written as words with an icon; the bar colour only reinforces it" },
      { keys: "Order", action: "The ones that fill soonest are first and the sentence above the list says how many are urgent" },
      { keys: "Ask for more", action: "A button named for the resource; the result is a polite announcement and a failure is an alert" },
    ],
    customization: ["resources and units", "urgentDays and planDays", "onRequest", "runway is exported"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
