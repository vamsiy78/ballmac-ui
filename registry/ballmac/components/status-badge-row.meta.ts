import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "status-badge-row",
  type: "registry:ui",
  title: "Status Badge Row",
  description:
    "A status page block: an overall banner and one row per service with a status chip, uptime and a 90-day bar history you can explore with the pointer or arrow keys.",
  category: "developer",
  tags: ["status", "uptime", "incident", "monitoring", "health"],
  files: [{ path: "components/status-badge-row.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "direction"],
  examples: [
    { name: "status-badge-row-demo", title: "Services with 90-day history", file: "status-badge-row-demo.tsx" },
    { name: "status-badge-row-incident", title: "During an incident", file: "status-badge-row-incident.tsx" },
  ],
  ai: {
    summary:
      "services is [{ name, status, description?, uptime?, days? }]; days holds one status (or { status, note }) per day, oldest first. endDate labels the bars. The banner shows the worst status. Bar height as well as color encodes status.",
    whenToUse: ["Public or internal status pages", "Admin dashboards listing service health"],
    whenNotToUse: ["A single presence dot (status-dot)", "Charting numeric metrics (chart)"],
    composesWith: ["status-dot", "badge", "chart"],
    a11y: [
      { keys: "ArrowLeft / ArrowRight", action: "Moves through days; Shift moves by a week; Home and End jump to the ends" },
      { keys: "Screen readers", action: "Each history is a slider whose value text reads 'Sep 21: Outage'" },
      { keys: "Color", action: "Status is also shown by icon, word and bar height" },
    ],
    customization: ["endDate", "updated", "summary", "per-day notes"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
