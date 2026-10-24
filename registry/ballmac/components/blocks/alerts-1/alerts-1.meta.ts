import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "alerts-1",
  type: "registry:block",
  title: "Alerts 1: alert rules",
  description:
    "The alert rules of a monitoring setup: what each watches, severity, where it notifies, and firing, muted or fine in words, firing first, switch off, mute for an hour, four hours or a day, send a test, all undone with the reason if it fails.",
  category: "blocks",
  blockCategory: "alerts",
  tags: ["alerts", "monitoring", "rules", "pager", "on-call", "notifications", "observability", "sre"],
  files: [{ path: "components/blocks/alerts-1/alerts-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view", "switch"],
  examples: [
    { name: "alerts-1-demo", title: "Default", file: "alerts-1-demo.tsx" },
    { name: "alerts-1-quiet", title: "Nothing firing", file: "alerts-1-quiet.tsx" },
    { name: "alerts-1-loading", title: "Loading", file: "alerts-1-loading.tsx" },
    { name: "alerts-1-empty", title: "No alert rules yet", file: "alerts-1-empty.tsx" },
    { name: "alerts-1-error", title: "Could not load", file: "alerts-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "alerts-1-loading", trigger: "state=\"loading\"", note: "Skeleton rows under the real heading, announced as loading." },
    { id: "empty", title: "No alert rules yet", example: "alerts-1-empty", trigger: "state=\"empty\"", note: "Says no alert rules yet; emptyState sets the copy. A filter with no match says so." },
    { id: "error", title: "Could not load", example: "alerts-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed or muted, with Try again (onRetry). A change that fails goes back and says why." },
  ],
  ai: {
    summary:
      "Alert rules. <Alerts1 rules={[{ id, name, condition, severity: 'critical' | 'warning' | 'info', channel, status: 'firing' | 'ok' | 'muted', enabled, since?, until? }]} onToggle={(rule, enabled) => Promise} onMute={(rule, hours) => Promise /* hours 0 means unmute */} onTest={(rule) => Promise} />. Firing rules are listed first. Each action updates the screen at once and is undone if the handler rejects.",
    whenToUse: ["The settings page of a monitoring or alerting tool", "An on-call overview of what is firing and what is muted"],
    whenNotToUse: ["Notification preferences for end users; use settings-1", "A feed of past alerts; use audit-1 or log-stream"],
    composesWith: ["oncall-1", "incident-1", "runbook-1", "slo-1"],
    a11y: [
      { keys: "Status", action: "Firing, Muted until… and Switched off are written as words with icons; severity is written too" },
      { keys: "Switch", action: "Named '<rule> is on'; a failure is an alert and the switch goes back" },
      { keys: "Mute", action: "A labelled select for how long and a button named for the rule" },
      { keys: "Condition", action: "Shown as code that stays left to right" },
      { keys: "Summary", action: "The count of firing rules is a polite live region" },
    ],
    customization: ["rules and channels", "onToggle, onMute and onTest", "Mute durations are 1 hour, 4 hours and 1 day"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
