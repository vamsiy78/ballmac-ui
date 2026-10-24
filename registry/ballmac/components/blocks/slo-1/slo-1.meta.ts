import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "slo-1",
  type: "registry:block",
  title: "SLO 1: service level objectives",
  description:
    "Service level objectives as cards: the goal, how it is going, error budget left in percent and minutes as a labelled meter, burn rate in words, a chart with the target drawn on it, risky ones listed first, and a filter by service.",
  category: "blocks",
  blockCategory: "slo",
  tags: ["slo", "sli", "reliability", "error budget", "sre", "uptime", "monitoring", "devops"],
  files: [{ path: "components/blocks/slo-1/slo-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view"],
  examples: [
    { name: "slo-1-demo", title: "Default", file: "slo-1-demo.tsx" },
    { name: "slo-1-healthy", title: "Everything on track", file: "slo-1-healthy.tsx" },
    { name: "slo-1-loading", title: "Loading", file: "slo-1-loading.tsx" },
    { name: "slo-1-empty", title: "No objectives yet", file: "slo-1-empty.tsx" },
    { name: "slo-1-error", title: "Could not load", file: "slo-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "slo-1-loading", trigger: "state=\"loading\"", note: "Skeleton cards under the real heading, announced as loading." },
    { id: "empty", title: "No objectives yet", example: "slo-1-empty", trigger: "state=\"empty\"", note: "Says no objectives yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "slo-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "Service level objectives. <Slo1 slos={[{ id, name, service, target: 99.9, current: 99.94, windowDays: 30, burn: 0.6, series: [99.9, 100, ...] }]} />. Error budget left = 1 minus the shortfall divided by the allowed shortfall; it is shown in percent and minutes. Order is target missed, burning fast (burn 2 or more, or under 25% left), watch, healthy. Exports budgetLeft.",
    whenToUse: ["A reliability overview for a team that promises uptime or speed", "Deciding whether it is safe to ship or time to slow down"],
    whenNotToUse: ["A public status page; use status-1", "Live charts of a metric; use charts-1"],
    composesWith: ["incident-1", "queues-1", "status-1", "dashboard-1"],
    a11y: [
      { keys: "Budget", action: "A meter per objective with a spoken value such as '40 percent of the error budget left, about 17 of 43 minutes'" },
      { keys: "Level", action: "Written as words with an icon (Healthy, Burning budget fast, Target missed); colour only reinforces it" },
      { keys: "Order", action: "Objectives that need attention are first, and the sentence above the list says how many" },
      { keys: "Service filter", action: "A labelled native select" },
    ],
    customization: ["slos with target, current, burn and series", "windowDays per objective", "budgetLeft is exported for your own use"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
