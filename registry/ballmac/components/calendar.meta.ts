import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "calendar",
  type: "registry:ui",
  title: "Calendar",
  description:
    "A date grid for one day, several days or a range, with month and year selects, week numbers, disabled rules and range-end styling, on React DayPicker.",
  category: "forms",
  tags: ["date", "calendar", "range", "day-picker"],
  files: [{ path: "components/calendar.tsx" }],
  dependencies: ["react-day-picker@^9", "lucide-react"],
  registryDependencies: ["shadcn:utils", "direction"],
  examples: [
    { name: "calendar-demo", title: "Date range", file: "calendar-demo.tsx" },
    { name: "calendar-states", title: "Dropdowns and multiple", file: "calendar-states.tsx" },
  ],
  ai: {
    summary:
      "Use mode single, multiple or range with selected and onSelect. All DayPicker props work: disabled, numberOfMonths, captionLayout dropdown, locale.",
    whenToUse: ["Choosing a date or range inside a card or popover", "Booking and scheduling", "Showing availability with disabled days"],
    whenNotToUse: ["A date field in a form; use date-picker", "Typing a range with inputs; use date-range-picker"],
    composesWith: ["popover", "date-picker", "button"],
    a11y: [
      { keys: "Arrow keys", action: "Move between days" },
      { keys: "PageUp / PageDown", action: "Previous or next month; with Shift, previous or next year" },
      { keys: "Home / End", action: "First or last day of the week" },
      { keys: "Enter / Space", action: "Selects the focused day" },
    ],
    customization: ["mode: single | multiple | range", "captionLayout dropdown with startMonth and endMonth", "disabled rules and max selection", "bordered surface", "footer text"],
  },
  source: {
    name: "shadcn/ui Calendar",
    url: "https://github.com/shadcn-ui/ui",
    license: "MIT",
    copyright: "Copyright (c) 2023 shadcn",
    modified: true,
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
