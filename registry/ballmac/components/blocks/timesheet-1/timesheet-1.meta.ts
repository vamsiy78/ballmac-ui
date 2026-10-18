import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "timesheet-1",
  type: "registry:block",
  title: "Timesheet 1: weekly hours",
  description:
    "A weekly timesheet: a row per project and a box per day, time typed the way people say it (1.5, 1:30, 90m), totals worked out as you type, daily bars that say when a day runs over, weeks to page through, and submit that locks the week.",
  category: "blocks",
  blockCategory: "timesheet",
  tags: ["timesheet", "time tracking", "hours", "weekly", "projects", "billable", "payroll", "work log", "submit"],
  files: [{ path: "components/blocks/timesheet-1/timesheet-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "select", "skeleton", "state-view"],
  examples: [
    { name: "timesheet-1-demo", title: "A draft week", file: "timesheet-1-demo.tsx" },
    { name: "timesheet-1-submitted", title: "A submitted week", file: "timesheet-1-submitted.tsx" },
    { name: "timesheet-1-loading", title: "Loading", file: "timesheet-1-loading.tsx" },
    { name: "timesheet-1-empty", title: "No projects", file: "timesheet-1-empty.tsx" },
    { name: "timesheet-1-error", title: "Could not load", file: "timesheet-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "timesheet-1-loading", trigger: "state=\"loading\"", note: "A skeleton grid under the real heading, announced as loading." },
    { id: "empty", title: "No projects", example: "timesheet-1-empty", trigger: "state=\"empty\" (or projects={[]})", note: "Says to add a project; emptyState sets the copy and can add a button." },
    { id: "error", title: "Could not load", example: "timesheet-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A failed submit says nothing was lost, in place under the table." },
  ],
  ai: {
    summary:
      "A weekly timesheet. <Timesheet1 projects={[{ id, name, client, entries: { '2026-10-12': 240 } /* minutes by ISO date */ }]} available={[{ id, name, client }]} weekStart='2026-10-12' /* a Monday */ dayTarget={8} submittedWeeks={['2026-10-05']} locale onChange={(projectId, date, minutes) => ...} onSubmit={({ weekStart, minutes, entries }) => Promise} />. Typed time accepts 1.5, 1,5, 1:30, 90m and 2h; entries are stored as minutes. A day over 24 hours is refused with the reason; a weekday over dayTarget shows how much over. Submitting locks that week. Reject onSubmit to show the reason and stay open.",
    whenToUse: ["Time tracking for agencies, consultants and teams", "A weekly hours entry before payroll or invoicing"],
    whenNotToUse: ["A start/stop timer", "A calendar of meetings (use calendar-1)"],
    composesWith: ["invoice-1", "goals-1", "tasks-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, Enter", action: "Every cell is a text field named for its project and day ('Website redesign, Mon 12 Oct'); Enter or leaving the field saves it" },
      { keys: "Over time", action: "A day over the target says '+1:15 over' in words beside its bar; a refused entry is an alert in the cell" },
      { keys: "Table", action: "A real table with a caption, column and row headers and totals in the footer; it scrolls sideways on a phone and is itself a focusable region" },
    ],
    customization: ["dayTarget sets what a full day is (weekends are not counted against the week target)", "Weeks page with Previous and Next; the data for every week lives in the entries by date", "Day names and dates follow the locale"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
