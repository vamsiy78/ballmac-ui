import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "reliability-1",
  type: "registry:block",
  title: "Reliability 1: uptime and incidents",
  description:
    "A reliability page: one sentence on whether things work right now, each service's last 60 days day by day, error budgets as gauges with a target, and the incidents behind the red days.",
  category: "blocks",
  blockCategory: "status",
  tags: ["status", "uptime", "reliability", "slo", "incidents", "monitoring", "gauge", "status page"],
  files: [{ path: "components/blocks/reliability-1/reliability-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view", "gauge", "uptime-tracker"],
  examples: [
    { name: "reliability-1-demo", title: "Default", file: "reliability-1-demo.tsx" },
    { name: "reliability-1-calm", title: "No incidents", file: "reliability-1-calm.tsx" },
    { name: "reliability-1-loading", title: "Loading", file: "reliability-1-loading.tsx" },
    { name: "reliability-1-empty", title: "No services yet", file: "reliability-1-empty.tsx" },
    { name: "reliability-1-error", title: "Could not load", file: "reliability-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "reliability-1-loading", trigger: "state=\"loading\"", note: "Skeleton banner, services and gauges under the real heading, announced as loading." },
    { id: "empty", title: "No services yet", example: "reliability-1-empty", trigger: "state=\"empty\"", note: "Says there are no services yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "reliability-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "Reliability page. <Reliability1 title description services={[{ id, name, days, uptime? }]} budgets={[{ id, label, value, target, description }]} incidents={[{ id, title, when, duration, status, summary }]} />. The headline is worked out from the last day of each service. Each budget is a gauge with At risk, Watch it and Healthy zones around its target.",
    whenToUse: ["A public or internal status page", "The reliability section of a product dashboard"],
    whenNotToUse: ["One incident in detail; use incident-1", "Error budgets only; use slo-1"],
    composesWith: ["analytics-1", "incident-1", "slo-1", "app-shell-1"],
    a11y: [
      { keys: "Headline", action: "A status region that names the services that are down or slow" },
      { keys: "Services", action: "Each row's days are buttons moved with arrow keys; the day is written underneath" },
      { keys: "Gauges", action: "role=meter with the zone in its text" },
      { keys: "Incidents", action: "A list; status is a word with an icon" },
    ],
    customization: ["title and description", "services, budgets, incidents"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
