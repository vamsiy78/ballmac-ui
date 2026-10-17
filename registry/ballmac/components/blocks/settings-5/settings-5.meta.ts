import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "settings-5",
  type: "registry:block",
  title: "Settings 5: audit log",
  description:
    "An audit log of who changed what, by people, AI agents, API keys and the system: grouped by day, filtered by who, area and time, searched, each event opening to its IP, a before-and-after diff and raw details, exported as CSV.",
  category: "blocks",
  blockCategory: "settings",
  tags: ["settings", "audit log", "activity", "security", "compliance", "history", "admin", "export", "csv"],
  files: [{ path: "components/blocks/settings-5/settings-5.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "diff-viewer", "json-viewer", "segmented-control", "select", "skeleton", "state-view"],
  examples: [
    { name: "settings-5-demo", title: "Default", file: "settings-5-demo.tsx" },
    { name: "settings-5-loading", title: "Loading", file: "settings-5-loading.tsx" },
    { name: "settings-5-empty", title: "Nothing recorded", file: "settings-5-empty.tsx" },
    { name: "settings-5-error", title: "Could not load", file: "settings-5-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "settings-5-loading", trigger: "state=\"loading\"", note: "Skeleton rows; the filters and Export are disabled." },
    { id: "empty", title: "Nothing recorded", example: "settings-5-empty", trigger: "state=\"empty\" (or events={[]})", note: "Says nothing changed in the chosen time range. Filters with no matches say so in place." },
    { id: "error", title: "Could not load", example: "settings-5-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "An audit log page. <Settings5 events={[{ id, actor: { name, email, kind: 'user' | 'agent' | 'api' | 'system' }, action: 'member.role_changed', summary, day: 'Today', time: '09:42', target, ip, location, severity: 'info' | 'warning' | 'critical', changes: { before, after }, metadata }]} range onRangeChange hasMore onLoadMore onExport />. The area filter comes from the part of action before the dot.",
    whenToUse: ["Security and compliance pages of a B2B product (SOC 2, enterprise plans)", "Showing what AI agents changed, next to what people changed"],
    whenNotToUse: ["A friendly activity feed for a team (use activity-feed)", "Raw server logs (use log-stream)", "Agent traces (use agent-3)"],
    composesWith: ["settings-3", "settings-4", "agent-3", "app-shell-1"],
    a11y: [
      { keys: "Enter / Space on an event", action: "Expands or collapses its details (aria-expanded); events with no details are plain rows" },
      { keys: "Tab", action: "Search, the who filter (a radio group), area and time range selects, Export" },
      { keys: "Severity", action: "Warnings and critical events carry a labelled icon, not colour alone" },
    ],
    customization: ["title, description", "range + onRangeChange to fetch from your API; hasMore + onLoadMore for paging", "onExport replaces the built-in CSV download"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
