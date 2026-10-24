import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "incident-1",
  type: "registry:block",
  title: "Incident 1: incident command",
  description:
    "The page for people fixing an incident: severity and status in words, the impact, who holds commander, comms and ops, a form that posts an update with its new status, updates newest first, and a Resolve button that asks first.",
  category: "blocks",
  blockCategory: "incident",
  tags: ["incident", "outage", "sre", "status", "severity", "postmortem", "on-call", "devops"],
  files: [{ path: "components/blocks/incident-1/incident-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "button", "skeleton", "state-view", "return-focus"],
  examples: [
    { name: "incident-1-demo", title: "Default", file: "incident-1-demo.tsx" },
    { name: "incident-1-resolved", title: "A resolved incident", file: "incident-1-resolved.tsx" },
    { name: "incident-1-loading", title: "Loading", file: "incident-1-loading.tsx" },
    { name: "incident-1-empty", title: "No incident right now", file: "incident-1-empty.tsx" },
    { name: "incident-1-error", title: "Could not load", file: "incident-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "incident-1-loading", trigger: "state=\"loading\"", note: "Skeleton for the header, roles and timeline under the page, announced as loading." },
    { id: "empty", title: "No incident right now", example: "incident-1-empty", trigger: "state=\"empty\"", note: "Says there is no incident right now; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "incident-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was posted, with Try again (onRetry). A failed update keeps your text and says why." },
  ],
  ai: {
    summary:
      "An incident command page. <Incident1 incident={{ id, title, severity: 'SEV1' | 'SEV2' | 'SEV3', status: 'investigating' | 'identified' | 'monitoring' | 'resolved', startedAt, duration, impact, roles: { commander?, comms?, ops? }, updates: [{ id, time, author, status, body }] }} people={[...]} me='Priya Shah' onPostUpdate={({ status, body }) => Promise} onResolve={() => Promise} onAssign={(role, person) => void} />. Pass incident={null} for no incident. Resolve asks first, posts a final update and closes the form.",
    whenToUse: ["The shared page during an outage", "A status workflow where updates and roles are tracked in one place"],
    whenNotToUse: ["A public status page for customers; use status-1", "A list of past incidents; use a table or tickets-1"],
    composesWith: ["status-1", "oncall-1", "audit-1", "app-shell-1"],
    a11y: [
      { keys: "Severity and status", action: "Written as words with icons (SEV2, Identified), never colour alone; the severity is prefixed 'Severity' for screen readers" },
      { keys: "Roles", action: "Three labelled native selects" },
      { keys: "Post an update", action: "A labelled textarea and select; Post update is off until there is text; an error is an alert and the text stays" },
      { keys: "Resolve", action: "An alert dialog that returns focus to the button when closed" },
      { keys: "Updates", action: "An ordered list named 'Updates, newest first'; times stay left to right" },
    ],
    customization: ["people and me", "onPostUpdate, onResolve and onAssign", "incident={null} shows the empty state"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
