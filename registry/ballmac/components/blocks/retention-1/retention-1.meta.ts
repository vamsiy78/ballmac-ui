import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "retention-1",
  type: "registry:block",
  title: "Retention 1: cohort heatmap",
  description:
    "A cohort retention table as a heatmap: rows of people who started together, columns of later periods, each cell tinted by the share still active, with headline numbers, percent or people, a keyboard grid and a size-weighted average row.",
  category: "blocks",
  blockCategory: "retention",
  tags: ["retention", "cohorts", "heatmap", "churn", "analytics", "engagement", "growth", "dashboard", "cohort analysis"],
  files: [{ path: "components/blocks/retention-1/retention-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "segmented-control", "skeleton", "state-view"],
  examples: [
    { name: "retention-1-demo", title: "Weekly cohorts", file: "retention-1-demo.tsx" },
    { name: "retention-1-monthly", title: "Monthly, people", file: "retention-1-monthly.tsx" },
    { name: "retention-1-loading", title: "Loading", file: "retention-1-loading.tsx" },
    { name: "retention-1-empty", title: "No cohorts yet", file: "retention-1-empty.tsx" },
    { name: "retention-1-error", title: "Could not load", file: "retention-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "retention-1-loading", trigger: "state=\"loading\"", note: "Skeleton stat cards and table under the real heading, announced as loading." },
    { id: "empty", title: "No cohorts yet", example: "retention-1-empty", trigger: "state=\"empty\" (or cohorts={[]})", note: "Says retention appears once people have started and a full period has passed; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "retention-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A cohort retention heatmap. <Retention1 cohorts={[{ id, label: 'Week of 3 August', size: 1420, retention: [100, 64, 51, ...] }]} period='Week' locale />. retention is the percent still active in each period starting at period 0; newer cohorts have fewer entries. The average row weights each period by cohort size and only counts cohorts old enough to reach it. Headline numbers (period 1, period 4, trend) are worked out from the table.",
    whenToUse: ["Product analytics: do people come back?", "Comparing the quality of signups week by week"],
    whenNotToUse: ["A step-by-step conversion path (use funnel-1)", "A trend line of one metric (use a chart)"],
    composesWith: ["funnel-1", "experiments-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, then arrow keys, Home and End", action: "The table is a grid with one tab stop; each cell is read as the cohort, the period, the percent and the number of people" },
      { keys: "Selection", action: "A sentence under the table says how the chosen cell compares with the average, announced politely" },
      { keys: "Color", action: "Every cell shows its number; the tint is only an extra cue" },
    ],
    customization: ["period: Week, Month or Day names the columns", "Percent or People switch shows counts instead of shares", "The table scrolls sideways on a phone and keeps its left-to-right order in every language, like a chart"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
