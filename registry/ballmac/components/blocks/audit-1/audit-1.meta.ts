import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "audit-1",
  type: "registry:block",
  title: "Audit 1: audit log",
  description:
    "An audit log you can search: who did what to what, when and from where, filters with counts, failed attempts written out, rows that open to show exactly which values changed, show-more paging and an export of what the filter shows.",
  category: "blocks",
  blockCategory: "audit",
  tags: ["audit log", "security", "compliance", "activity", "admin", "export", "history"],
  files: [{ path: "components/blocks/audit-1/audit-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "match-highlight", "skeleton", "state-view"],
  examples: [
    { name: "audit-1-demo", title: "Default", file: "audit-1-demo.tsx" },
    { name: "audit-1-failed", title: "Search with no match", file: "audit-1-failed.tsx" },
    { name: "audit-1-loading", title: "Loading", file: "audit-1-loading.tsx" },
    { name: "audit-1-empty", title: "No activity yet", file: "audit-1-empty.tsx" },
    { name: "audit-1-error", title: "Could not load", file: "audit-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "audit-1-loading", trigger: "state=\"loading\"", note: "Skeleton rows under the real heading, announced as loading." },
    { id: "empty", title: "No activity yet", example: "audit-1-empty", trigger: "state=\"empty\"", note: "Says what will appear and when; emptyState sets the copy. A search or filter with no match says so with Clear filters." },
    { id: "error", title: "Could not load", example: "audit-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "An audit log. <Audit1 events={[{ id, time, actor: { name, email? }, action, category: 'signin' | 'permissions' | 'data' | 'billing', target, ip?, place?, result?: 'failed', changes?: [{ field, from, to }] }]} onExport={(events) => Promise} />. Search and the kind filter narrow the list and the count; Export sends what is currently shown. Rows with changes open to show from and to.",
    whenToUse: ["An admin area where owners review security and data activity", "A compliance screen that needs an exportable trail"],
    whenNotToUse: ["A user's own activity feed; use activity-feed", "The live output of a process; use log-stream", "Agent guardrail checks; use guardrail-feed"],
    composesWith: ["access-1", "settings-1", "webhooks-1", "app-shell-1"],
    a11y: [
      { keys: "Table", action: "A real table with a caption and column headings; times and addresses stay left to right in right-to-left layouts" },
      { keys: "Enter / Space on an action", action: "Opens the details of what changed (aria-expanded); rows with nothing to show are not buttons" },
      { keys: "Failed attempts", action: "Written as the word Failed with an icon, never colour alone" },
      { keys: "Filters", action: "Toggle buttons with counts; the event count and the export result are polite announcements" },
    ],
    customization: ["Page size and the event you open at first", "onExport receives the filtered events; reject it and the message says the export failed", "Search matches person, action, target and address"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
