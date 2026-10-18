import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "gantt-1",
  type: "registry:block",
  title: "Gantt 1: project timeline",
  description:
    "A project timeline: bars placed by real dates with a progress fill, milestones, dependency arrows, a today line, three zoom levels, a sticky task column, a details panel and a table of the same data for screen readers.",
  category: "blocks",
  blockCategory: "gantt",
  tags: ["gantt", "timeline", "project", "schedule", "roadmap", "planning", "milestones", "dependencies", "project management"],
  files: [{ path: "components/blocks/gantt-1/gantt-1.tsx" }],
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["shadcn:utils", "button", "segmented-control", "skeleton", "state-view"],
  examples: [
    { name: "gantt-1-demo", title: "Weeks, with a task open", file: "gantt-1-demo.tsx" },
    { name: "gantt-1-days", title: "Days", file: "gantt-1-days.tsx" },
    { name: "gantt-1-months", title: "Months, a late task open", file: "gantt-1-months.tsx" },
    { name: "gantt-1-loading", title: "Loading", file: "gantt-1-loading.tsx" },
    { name: "gantt-1-empty", title: "No tasks yet", file: "gantt-1-empty.tsx" },
    { name: "gantt-1-error", title: "Could not load", file: "gantt-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "gantt-1-loading", trigger: "state=\"loading\"", note: "A skeleton chart under the real heading, announced as loading; zoom and Today are disabled." },
    { id: "empty", title: "No tasks yet", example: "gantt-1-empty", trigger: "state=\"empty\" (or tasks={[]})", note: "Says the plan draws itself once tasks have dates; emptyState sets the copy and can add a button." },
    { id: "error", title: "Could not load", example: "gantt-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A Gantt chart. <Gantt1 tasks={[{ id, name, start: '2026-10-05', end: '2026-10-16', progress: 0..1, group, owner, dependsOn: ['id'], milestone }]} today=\"2026-10-18\" defaultScale='days' | 'weeks' | 'months' defaultSelectedId locale onSelect />. Status is worked out for you: done at progress 1, late when the end date has passed, in progress when it has started, planned otherwise. Pass today yourself (an ISO date); the block never reads the clock. A milestone has the same start and end.",
    whenToUse: ["Showing a project plan with dates, progress and dependencies", "A read-only schedule overview in a project tool or a client report"],
    whenNotToUse: ["A board of cards by status (use kanban-1)", "Booking rooms or people by the hour (use calendar-pro-1)", "A simple list of dated items (use timeline or tasks-1)"],
    composesWith: ["tasks-1", "kanban-1", "app-shell-1", "calendar-1"],
    a11y: [
      { keys: "Tab, then Up / Down / Home / End", action: "Move between bars; each bar's name says its dates, progress and status in words" },
      { keys: "Table", action: "A hidden table lists every task with start, end, progress, status and what it waits for, so the chart has a text equivalent" },
      { keys: "Late", action: "Marked with an icon and the word Late in the task column and the details, not only by color" },
    ],
    customization: [
      "defaultScale: days (44 px a day), weeks (18) or months (6)",
      "dependsOn draws arrows; a task that starts before what it depends on shows the arrow running backwards, which is the sign of a planning problem",
      "The timeline runs left to right in every language, like a chart",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
