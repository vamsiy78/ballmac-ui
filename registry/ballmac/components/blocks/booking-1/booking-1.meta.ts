import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "booking-1",
  type: "registry:block",
  title: "Booking 1: class timetable",
  description:
    "A weekly class timetable people book from: classes grouped by day, places left written out, one button that does the right thing (book, join the waiting list, cancel, leave), a kind filter, and changes undone with the reason if they fail.",
  category: "blocks",
  blockCategory: "booking",
  tags: ["booking", "classes", "timetable", "fitness", "studio", "waitlist", "schedule", "wellness"],
  files: [{ path: "components/blocks/booking-1/booking-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "booking-1-demo", title: "Default", file: "booking-1-demo.tsx" },
    { name: "booking-1-loading", title: "Loading", file: "booking-1-loading.tsx" },
    { name: "booking-1-empty", title: "No classes this week", file: "booking-1-empty.tsx" },
    { name: "booking-1-error", title: "Could not load", file: "booking-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "booking-1-loading", trigger: "state=\"loading\"", note: "Skeleton day headings and cards under the real heading, announced as loading." },
    { id: "empty", title: "No classes this week", example: "booking-1-empty", trigger: "state=\"empty\"", note: "Says no classes this week; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "booking-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was booked or cancelled, with Try again (onRetry). A booking that fails is undone and says why." },
  ],
  ai: {
    summary:
      "A class timetable. <Booking1 classes={[{ id, title, kind, instructor, day: 'Mon 27 Oct', time: '07:00', length: '45 min', capacity, taken, booked?, waitlisted? }]} onChange={(class, 'book' | 'waitlist' | 'cancel' | 'leave') => Promise} />. Places left = capacity minus taken (minus you if booked); 3 or fewer says 'Only 2 places left', zero says 'Full' and offers the waiting list. Changes show at once and are undone if onChange rejects.",
    whenToUse: ["A studio, gym or workshop timetable with limited places", "Any scheduled session where people can book, queue or cancel"],
    whenNotToUse: ["A day schedule for staff and patients; use clinic-1", "A calendar of events with tickets; use event-1"],
    composesWith: ["clinic-1", "calendar-1", "event-1", "profile-1"],
    a11y: [
      { keys: "Days", action: "Each day is a labelled region with a heading; classes are list items in time order" },
      { keys: "Places left", action: "Written as words ('Only 1 place left', 'Full'), never colour alone" },
      { keys: "Buttons", action: "Named for the class, day and time ('Book Spin 45, Wed 29 Oct at 06:45'); the result is a polite announcement and a failure is an alert" },
      { keys: "Filter", action: "Toggle buttons with aria-pressed" },
    ],
    customization: ["classes and the filter kinds come from the data", "onChange handles all four actions", "The week summary updates as you book"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
