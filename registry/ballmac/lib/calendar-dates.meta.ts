import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "calendar-dates",
  type: "registry:lib",
  title: "Calendar Dates",
  description: "Date helpers for calendars with no dependencies: weeks that start where the locale says, month grids, daylight-saving-safe day math, and layout for overlapping events.",
  category: "foundation",
  tags: ["date", "calendar", "week", "month", "layout", "locale"],
  files: [{ path: "lib/calendar-dates.ts" }],
  dependencies: [],
  registryDependencies: [],
  ai: {
    summary: "Import from @/lib/ballmac/calendar-dates: toDate, addDays, addMonths, startOfWeek, monthGrid, weekStartFor(locale), spanOf, layoutDay and layoutWeek.",
    whenToUse: ["Building a calendar, scheduler or timeline", "Reading dates like 2026-10-20 as local days, not UTC", "Placing overlapping events side by side"],
    whenNotToUse: ["Formatting or time zone conversion for a whole app; use Intl or a date library", "A date picker; use calendar"],
    customization: ["weekStartsOn is 0 (Sunday) to 6", "spanOf treats an all-day event's end as its last day, inclusive"],
  },
  version: "1.0.0",
  updated: "2026-10-19",
})
