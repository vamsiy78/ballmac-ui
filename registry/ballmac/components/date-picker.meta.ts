import { defineItem } from "@ballmac-ui/metadata";
export default defineItem({
  name: "date-picker",
  type: "registry:ui",
  title: "Date Picker",
  description:
    "A button that opens a calendar popover to choose one date, with presets, month and year selects, min and max dates, clearing, invalid state and form submission.",
  category: "forms",
  tags: ["date", "input", "popover", "form"],
  files: [{ path: "components/date-picker.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "calendar", "popover"],
  examples: [
    { name: "date-picker-demo", title: "Delivery date with presets", file: "date-picker-demo.tsx" },
    { name: "date-picker-states", title: "Birthday, invalid, disabled", file: "date-picker-states.tsx" },
  ],
  ai: {
    summary:
      "Give it a defaultValue or value and onValueChange. presets add quick picks, dropdowns adds month and year selects, name submits YYYY-MM-DD.",
    whenToUse: ["A single date in a form", "Deadlines, birthdays and delivery dates", "When quick picks like Tomorrow help"],
    whenNotToUse: ["A date range; use date-range-picker", "An always-visible calendar; use calendar"],
    composesWith: ["field", "calendar", "popover"],
    a11y: [
      { keys: "Enter / Space / ArrowDown", action: "Opens the calendar from the trigger" },
      { keys: "Arrow keys", action: "Move between days" },
      { keys: "Escape", action: "Closes and returns focus to the trigger" },
    ],
    customization: ["presets", "dropdowns for distant dates", "minDate and maxDate", "format (Intl options) and locale", "clearable and invalid"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
});
