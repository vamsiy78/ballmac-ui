import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "status-1",
  type: "registry:block",
  title: "Status 1: system status page",
  description:
    "A public status page: an overall banner worked out from the data, each service with a 90-day history you scrub by pointer or arrow keys, live incidents as a timeline of updates, two weeks of past incidents and a subscribe box.",
  category: "blocks",
  blockCategory: "status",
  tags: ["status", "uptime", "incidents", "system status", "outage", "maintenance", "reliability", "operational", "status page"],
  files: [{ path: "components/blocks/status-1/status-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "input", "skeleton", "state-view"],
  examples: [
    { name: "status-1-demo", title: "A slowdown and maintenance", file: "status-1-demo.tsx" },
    { name: "status-1-operational", title: "All systems operational", file: "status-1-operational.tsx" },
    { name: "status-1-outage", title: "An outage", file: "status-1-outage.tsx" },
    { name: "status-1-loading", title: "Loading", file: "status-1-loading.tsx" },
    { name: "status-1-empty", title: "No services listed", file: "status-1-empty.tsx" },
    { name: "status-1-error", title: "Could not load", file: "status-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "status-1-loading", trigger: "state=\"loading\"", note: "A skeleton banner and service rows under the real heading, announced as loading." },
    { id: "empty", title: "No services listed", example: "status-1-empty", trigger: "state=\"empty\" (or components={[]})", note: "Says services appear once added; emptyState sets the copy and can add a button." },
    { id: "error", title: "Could not load", example: "status-1-error", trigger: "state=\"error\"", note: "An alert that says this does not mean something is down, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A status page. <Status1 components={[{ id, name, description, status: 'operational' | 'degraded' | 'outage' | 'maintenance', days: ('ok' | 'degraded' | 'outage' | 'none')[] /* 90, oldest first */ }]} incidents={[{ id, title, impact: 'minor' | 'major' | 'maintenance', day: '2026-10-18', affects: ['API'], updates: [{ status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'scheduled', time: '09:42', body }] /* newest first */ }]} today='2026-10-18' updatedAt='10:42 UTC' onSubscribe />. The banner is the worst current status; an incident is live until its newest update is resolved. Pass today yourself; the block never reads the clock.",
    whenToUse: ["A public status page for a service", "An internal reliability page showing uptime and incidents"],
    whenNotToUse: ["A single status dot or badge row (use status-dot or status-badge-row)", "Raw server logs (use log-stream)"],
    composesWith: ["header-1", "footer-1", "settings-5"],
    a11y: [
      { keys: "Tab, then Left / Right / Home / End", action: "Each history bar is a slider through its days; the value text reads the date and what happened, and a tooltip shows the same for pointer users" },
      { keys: "Summary", action: "Every history also has a sentence in text: the uptime and how many days had an outage or were degraded" },
      { keys: "Status", action: "Shown with an icon and a word (Operational, Degraded, Outage, Maintenance), never by color alone; the banner is a live region" },
    ],
    customization: ["Uptime counts an outage day as down and a degraded day as half", "The bar and its day order run left to right in every language, like a chart", "Dates use the locale you pass"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
