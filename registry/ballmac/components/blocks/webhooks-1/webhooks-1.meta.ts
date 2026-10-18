import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "webhooks-1",
  type: "registry:block",
  title: "Webhooks 1: endpoints and deliveries",
  description:
    "A webhooks manager: endpoints with health from recent deliveries, signing secret and events, a delivery log with status codes and timing, payload and response per delivery with Send again, and an add dialog that validates.",
  category: "blocks",
  blockCategory: "webhooks",
  tags: ["webhooks", "events", "endpoints", "deliveries", "developer", "integrations", "api", "retry", "signing secret", "logs"],
  files: [{ path: "components/blocks/webhooks-1/webhooks-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "checkbox", "copy-button", "dialog", "input", "json-viewer", "skeleton", "state-view", "switch", "return-focus"],
  examples: [
    { name: "webhooks-1-demo", title: "A healthy endpoint", file: "webhooks-1-demo.tsx" },
    { name: "webhooks-1-failing", title: "A failing delivery open", file: "webhooks-1-failing.tsx" },
    { name: "webhooks-1-loading", title: "Loading", file: "webhooks-1-loading.tsx" },
    { name: "webhooks-1-empty", title: "No endpoints", file: "webhooks-1-empty.tsx" },
    { name: "webhooks-1-error", title: "Could not load", file: "webhooks-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "webhooks-1-loading", trigger: "state=\"loading\"", note: "A skeleton list and panel under the real heading, announced as loading." },
    { id: "empty", title: "No endpoints", example: "webhooks-1-empty", trigger: "state=\"empty\" (or endpoints={[]})", note: "Explains what an endpoint is and offers Add an endpoint; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "webhooks-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A failed Send again and a failed add show their message in place." },
  ],
  ai: {
    summary:
      "A webhooks manager. <Webhooks1 endpoints={[{ id, url, enabled, events: ['order.paid'], secret, deliveries: [{ id, event, status: 200 | 500 | 0 /* no reply */, ms, time, attempt, payload, response }] }]} availableEvents onCreate={({ url, events }) => Promise} onToggle onResend={(endpoint, delivery) => Promise} defaultSelectedId defaultOpenDeliveryId />. Health (Healthy 90% or more, Some failing 50% or more, Failing, Disabled) is worked out from each endpoint's last ten deliveries. Adding requires an https URL and at least one event. Reject onCreate or onResend to show the message in place.",
    whenToUse: ["The developer settings of an API or SaaS product", "Debugging why events did not arrive"],
    whenNotToUse: ["A single webhook status tile (use webhook-card)", "Raw logs of everything (use log-stream)"],
    composesWith: ["dev-1", "settings-4", "settings-5", "app-shell-1"],
    a11y: [
      { keys: "Tab, Enter / Space", action: "Each endpoint is one button (pressed when chosen); each delivery row is a button that says whether it is expanded" },
      { keys: "Status", action: "Health and every delivery status are written (Healthy, Failing, 500, No reply) beside an icon, never by color alone" },
      { keys: "Secret", action: "Hidden by default with a Show button that says its state; Copy confirms in text. The add dialog returns focus to its button" },
    ],
    customization: ["Addresses, secrets and event names are shown left to right in right-to-left layouts, like any code", "Health looks at the last ten deliveries, newest first", "Send again reports success or failure under the delivery that was resent"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
