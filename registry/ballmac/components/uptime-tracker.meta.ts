import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "uptime-tracker",
  type: "registry:ui",
  title: "Uptime Tracker",
  description:
    "A status-page row with one cell per day. It leads with the uptime and the outage count, the cells are one tab stop moved with the arrow keys, and the day you are on is written underneath instead of in a tooltip.",
  category: "data-display",
  tags: ["status", "uptime", "reliability", "monitoring", "incidents", "history", "status page"],
  files: [{ path: "components/uptime-tracker.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "uptime-tracker-demo", title: "Three services over 60 days", file: "uptime-tracker-demo.tsx" },
    { name: "uptime-tracker-perfect", title: "A clean month", file: "uptime-tracker-perfect.tsx" },
  ],
  ai: {
    summary:
      "days is [{ date, status: 'up'|'degraded'|'down'|'none', note? }] oldest first; label names the service. uptime overrides the computed share of days that were up; startLabel and endLabel caption the ends. Cells are buttons with a name that includes the date, the status and the note; hover or focus writes the day underneath.",
    whenToUse: ["A public or internal status page", "A reliability section in a dashboard"],
    whenNotToUse: ["Minute-level charts; use chart-line", "Listing incidents; use incident-1"],
    composesWith: ["gauge", "status-dot", "stat-card", "timeline"],
    a11y: [
      { keys: "Cells", action: "Buttons named for the day, the status in words and the note; one tab stop; Left, Right, Home, End move; Escape clears" },
      { keys: "Detail", action: "The day you are on is text in a live region" },
      { keys: "Status", action: "Never by color alone: every cell's name says it" },
    ],
    customization: ["days and label", "uptime", "startLabel and endLabel"],
  },
  statesNone: "A presentational tracker: the days are passed in, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
