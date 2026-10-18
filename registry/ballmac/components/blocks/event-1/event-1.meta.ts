import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "event-1",
  type: "registry:block",
  title: "Event 1: agenda and my schedule",
  description:
    "An event page with its agenda: dates, venue and a countdown, the schedule by day with a filter per track, a star on each session to build your own schedule, a warning for overlaps, and a calendar file download.",
  category: "blocks",
  blockCategory: "event",
  tags: ["event", "conference", "agenda", "schedule", "sessions", "speakers", "tracks", "calendar", "ics", "summit", "meetup"],
  files: [{ path: "components/blocks/event-1/event-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "cover-art"],
  examples: [
    { name: "event-1-demo", title: "Default", file: "event-1-demo.tsx" },
    { name: "event-1-saved", title: "A schedule with an overlap", file: "event-1-saved.tsx" },
  ],
  statesNone: "Static content: nothing to load, submit or fail.",
  ai: {
    summary:
      "An event agenda. <Event1 name tagline dates={['2026-11-12', '2026-11-13']} venue utcOffset={1} sessions={[{ id, day: '2026-11-12', start: '09:00', end: '09:45', title, track, room, speakers: [{ name, role }], description }]} now='2026-10-18T10:00:00Z' defaultSaved={['s1']} onSavedChange />. Days and tracks come from the sessions; overlaps among saved sessions are found for you; 'Add to my calendar' builds an .ics file in the browser using utcOffset. Pass now yourself; the block never reads the clock.",
    whenToUse: ["A conference, meetup or webinar series page with a schedule", "An internal offsite agenda"],
    whenNotToUse: ["Ticket purchase (use a pricing block)", "A month calendar of many events (use calendar-1)"],
    composesWith: ["hero-1", "pricing-1", "faq-1", "footer-1"],
    a11y: [
      { keys: "Left / Right on the day tabs", action: "Move between days (a tablist); the schedule below is the tab panel" },
      { keys: "Tab, Enter / Space", action: "Track buttons say whether they are on; each Save button says which session, and its pressed state" },
      { keys: "Overlap", action: "Written as a warning with the clashing session's name and times, not only a color; changes to your schedule are announced politely" },
    ],
    customization: ["Sessions at the same time sit side by side in the list, ordered by title", "utcOffset sets the time zone of the calendar file", "Dates use the locale you pass"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
