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
  registryDependencies: ["shadcn:utils", "button", "calendar", "dialog", "input", "popover"],
  examples: [
    { name: "calendar-1-demo", title: "Default", file: "calendar-1-demo.tsx" },
    { name: "calendar-1-compact", title: "Work hours, your calendars", file: "calendar-1-compact.tsx" },
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
    customization: ["defaultEvents, calendars, today, now (null hides the line)", "startHour and endHour", "onAdd(event), height"],
  },
  version: "1.0.0",
  updated: "2026-10-01",
})
