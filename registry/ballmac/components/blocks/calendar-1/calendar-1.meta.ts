import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "calendar-1",
  type: "registry:block",
  title: "Calendar 1: week view with mini month",
  description: "A week calendar: a time grid with overlapping events placed side by side, an all-day row, a now line, a mini month and calendar toggles, event popovers and a new-event dialog. One day at a time on phones.",
  category: "blocks",
  blockCategory: "calendar",
  tags: ["calendar", "schedule", "week view", "events", "planner", "agenda"],
  files: [{ path: "components/blocks/calendar-1/calendar-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "calendar", "dialog", "input", "popover", "state-view", "skeleton"],
  examples: [
    { name: "calendar-1-demo", title: "Default", file: "calendar-1-demo.tsx" },
    { name: "calendar-1-compact", title: "Work hours, your calendars", file: "calendar-1-compact.tsx" },
    { name: "calendar-1-loading", title: "Loading", file: "calendar-1-loading.tsx" },
    { name: "calendar-1-error", title: "Could not load", file: "calendar-1-error.tsx" },
    { name: "calendar-1-no-events", title: "No events", file: "calendar-1-no-events.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "calendar-1-loading", trigger: "state=\"loading\"", note: "A skeleton with the same shapes as the ready view, announced as loading; nothing is clickable." },
    { id: "empty", title: "No events", example: "calendar-1-no-events", trigger: "state=\"empty\"", note: "The real week with no events, so adding one still works." },
    { id: "error", title: "Could not load", example: "calendar-1-error", trigger: "state=\"error\"", note: "An error with a Try again button (onRetry), announced as an alert." },
  ],
  ai: {
    summary: "A scheduling view. Pass defaultEvents=[{ id, title, start, end, calendar, location?, allDay? }] with local 'YYYY-MM-DDTHH:mm' times, calendars, today (YYYY-MM-DD) and now (HH:mm) so the page is identical on the server and in the browser.",
    whenToUse: ["Scheduling, booking and planning screens", "A realistic product screenshot"],
    whenNotToUse: ["Picking a date in a form (use calendar or date-picker)", "An agenda list (use calendar-agenda)"],
    composesWith: ["app-shell-1", "kanban-1", "mail-1"],
    a11y: [
      { keys: "Tab", action: "Events are buttons in time order; Enter opens a popover with the details" },
      { keys: "Mini month arrow keys", action: "Move between days; PageUp and PageDown change month" },
      { keys: "Calendar checkboxes", action: "Show or hide a calendar; each event's name, time and place are in its accessible name" },
    ],
    customization: ["defaultEvents, calendars, today, now (null hides the line)", "startHour and endHour", "onAdd(event), height", "state: \"ready\" | \"loading\" | \"empty\" | \"error\"; onRetry, emptyState and errorState set the retry action and the copy. Pair with useResource: state={r.state} onRetry={r.retry}"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (loading, empty, error) with onRetry, emptyState and errorState: a skeleton with the same shapes as the ready view, an error with retry, and an empty message. Unchanged without state." },
    { version: "1.0.1", date: "2026-10-11", note: "The mini calendar uses the block's own today, so the block prerenders with Cache Components (the Next.js 16.4 default). The highlighted day is unchanged." },
  ],
})
