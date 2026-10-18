import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "event-calendar",
  type: "registry:ui",
  title: "Event Calendar",
  description:
    "A full calendar with month, week, day and agenda views: overlapping events side by side, multi-day bars, drag to move, resize or create, keyboard moves, a live now line and locale-aware weeks.",
  category: "data-display",
  tags: ["calendar", "events", "schedule", "month", "week", "agenda", "drag", "timeline"],
  files: [{ path: "components/event-calendar.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "popover", "skeleton", "state-view", "i18n", "direction", "calendar-dates"],
  examples: [
    { name: "event-calendar-demo", title: "Month", file: "event-calendar-demo.tsx" },
    { name: "event-calendar-week", title: "Week, drag to move and create", file: "event-calendar-week.tsx" },
    { name: "event-calendar-day", title: "Day", file: "event-calendar-day.tsx" },
    { name: "event-calendar-editable", title: "Editable month", file: "event-calendar-editable.tsx" },
    { name: "event-calendar-agenda", title: "Agenda", file: "event-calendar-agenda.tsx" },
    { name: "event-calendar-loading", title: "Loading", file: "event-calendar-loading.tsx" },
    { name: "event-calendar-empty", title: "No events", file: "event-calendar-empty.tsx" },
    { name: "event-calendar-error", title: "Could not load", file: "event-calendar-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "event-calendar-loading", trigger: "state=\"loading\"", note: "A month-shaped skeleton, announced as loading; nothing can be clicked." },
    { id: "empty", title: "No events", example: "event-calendar-empty", trigger: "events={[]} in the agenda view", note: "The agenda says there is nothing this month and emptyState can add an action; the month and week grids stay as plain calendars." },
    { id: "error", title: "Could not load", example: "event-calendar-error", trigger: "state=\"error\"", note: "An error with a Try again button (onRetry), announced as an alert." },
  ],
  ai: {
    summary:
      "Pass events [{ id, title, start, end?, allDay?, tone?, location? }] and a label. Hold view and date in state if you need them. For editing set editable and selectable and handle onEventChange(event, { start, end, allDay }) and onRangeSelect.",
    whenToUse: [
      "Team, booking, room and delivery calendars with several views",
      "Schedulers where people drag events to reschedule or drag across time to add one",
      "A month overview with multi-day events and an agenda list for phones",
    ],
    whenNotToUse: [
      "Picking a date in a form; use calendar or date-picker",
      "A resource timeline with rows per person or room",
      "Recurring-event rules or time zone conversion; compute those yourself and pass plain events",
    ],
    composesWith: ["calendar", "popover", "badge", "dialog"],
    a11y: [
      { keys: "Arrow keys (month)", action: "Move between days; Page Up and Page Down change month; Home and End go to the week's ends" },
      { keys: "Enter / Space (month)", action: "Open the focused day" },
      { keys: "Enter on an event", action: "Calls onEventClick" },
      { keys: "Alt + arrow keys on an event", action: "Move it by a day or a slot; Alt+Shift+arrows change its length. The move is announced" },
      { keys: "Add event button", action: "Starts an event without dragging, for keyboard and switch users" },
      { keys: "Screen readers", action: "The month is a grid with each day named and counted; every event button reads its title, date, time and place" },
    ],
    customization: [
      "views: month | week | day | agenda, defaultView, defaultDate",
      "weekStartsOn (defaults to the locale), slotMinutes, hourHeight, scrollToHour, maxLanes",
      "tone per event: chart-1 to chart-5 or muted",
      "renderEvent to draw your own event content",
      "today to pin the current day in tests and screenshots",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-19",
});
