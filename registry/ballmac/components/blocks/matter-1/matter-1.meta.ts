import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "matter-1",
  type: "registry:block",
  title: "Matter 1: legal matters",
  description:
    "A law firm's matters: deadlines that cannot be missed first with overdue and due-soon in words, then each matter with client, lead and status, hours against the month's budget, search, a practice area filter and a show-closed switch.",
  category: "blocks",
  blockCategory: "matter",
  tags: ["legal", "law firm", "matters", "deadlines", "billable hours", "practice management", "cases", "professional services"],
  files: [{ path: "components/blocks/matter-1/matter-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "match-highlight", "skeleton", "state-view"],
  examples: [
    { name: "matter-1-demo", title: "Default", file: "matter-1-demo.tsx" },
    { name: "matter-1-quiet", title: "No deadlines set", file: "matter-1-quiet.tsx" },
    { name: "matter-1-loading", title: "Loading", file: "matter-1-loading.tsx" },
    { name: "matter-1-empty", title: "No matters yet", file: "matter-1-empty.tsx" },
    { name: "matter-1-error", title: "Could not load", file: "matter-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "matter-1-loading", trigger: "state=\"loading\"", note: "Skeleton for the dates panel and rows under the real heading, announced as loading." },
    { id: "empty", title: "No matters yet", example: "matter-1-empty", trigger: "state=\"empty\"", note: "Says no matters yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "matter-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A search or filter with no match says so." },
  ],
  ai: {
    summary:
      "A matters list. <Matter1 matters={[{ id, client, title, area, lead, status: 'open' | 'waiting' | 'closed', deadline?: { label, date, days /* from today; negative is overdue */ }, hours, budget? }]} soonDays={7} />. The panel on top lists open deadlines soonest first and says 'overdue' or 'in 3 days'; a matter over budget says 'Over budget by 3 h'. Closed matters are hidden until the switch is on.",
    whenToUse: ["A practice-management home for a law firm or any deadline-driven professional service", "A list where hours are tracked against a budget"],
    whenNotToUse: ["A general task list; use tasks-1", "Time entry; use timesheet-1"],
    composesWith: ["timesheet-1", "invoice-1", "calendar-1", "app-shell-1"],
    a11y: [
      { keys: "Dates panel", action: "A labelled region with an ordered list; overdue and due-soon are written ('1 day overdue', 'In 3 days') with an icon, never colour alone" },
      { keys: "Table", action: "A real table with a caption; each matter is a row header with client and area under it" },
      { keys: "Filters", action: "A labelled search, a labelled native select and a checkbox; the count is a polite announcement" },
      { keys: "Budget", action: "'Over budget by 3 h' is text under the hours, not only a colour" },
    ],
    customization: ["matters, soonDays and the title", "closed matters are off by default", "Practice areas come from the data"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
