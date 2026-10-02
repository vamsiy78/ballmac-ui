import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "webhook-card",
  type: "registry:ui",
  title: "Webhook Card",
  description:
    "A webhook endpoint card with URL and enable switch, health from recent deliveries, a masked signing secret, subscribed events and expandable deliveries with payloads and redeliver.",
  category: "developer",
  tags: ["webhook", "endpoint", "events", "deliveries", "integration"],
  files: [{ path: "components/webhook-card.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "copy-button", "switch", "highlight", "i18n"],
  examples: [
    { name: "webhook-card-demo", title: "Healthy endpoint", file: "webhook-card-demo.tsx" },
    { name: "webhook-card-failing", title: "Failing endpoint", file: "webhook-card-failing.tsx" },
  ],
  ai: {
    summary:
      "url, enabled/onEnabledChange, secret, events, deliveries [{ id, event, status, duration, time, payload, response }], onRedeliver, onTest. Health is Active, Failing (half or more of the last five failed) or Disabled, shown with icon and word.",
    whenToUse: ["Developer dashboards that manage outgoing webhooks", "Debugging failed deliveries"],
    whenNotToUse: ["Incoming webhook documentation (api-endpoint)"],
    composesWith: ["api-key-field", "log-stream", "status-badge-row"],
    a11y: [
      { keys: "Space", action: "Toggles the endpoint" },
      { keys: "Enter / Space", action: "Expands a delivery" },
      { keys: "Screen readers", action: "Each status code reads with its meaning ('500, Server error'); payloads are labelled regions" },
    ],
    customization: ["visibleEvents", "onRedeliver", "onTest", "deliveries"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
