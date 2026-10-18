import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "roster-1",
  type: "registry:block",
  title: "Roster 1: weekly shift planner",
  description:
    "A weekly shift roster: a row per person and a column per day, shifts you set, change or mark as time off, hours per person with overtime and rest flags, a coverage row against what each day needs, weeks to page through and a publish step.",
  category: "blocks",
  blockCategory: "roster",
  tags: ["roster", "shifts", "schedule", "rota", "staff scheduling", "rostering", "workforce", "hospitality", "retail", "coverage"],
  files: [{ path: "components/blocks/roster-1/roster-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "cover-art", "dialog", "input", "select", "skeleton", "state-view", "return-focus"],
  examples: [
    { name: "roster-1-demo", title: "A week with problems", file: "roster-1-demo.tsx" },
    { name: "roster-1-published", title: "A published week", file: "roster-1-published.tsx" },
    { name: "roster-1-loading", title: "Loading", file: "roster-1-loading.tsx" },
    { name: "roster-1-empty", title: "No staff", file: "roster-1-empty.tsx" },
    { name: "roster-1-error", title: "Could not load", file: "roster-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "roster-1-loading", trigger: "state=\"loading\"", note: "A skeleton grid under the real heading, announced as loading." },
    { id: "empty", title: "No staff", example: "roster-1-empty", trigger: "state=\"empty\" (or staff={[]})", note: "Says to add the people who work here; emptyState sets the copy and can add a button." },
    { id: "error", title: "Could not load", example: "roster-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A publish that fails says the week is still a draft, in place under the grid." },
  ],
  ai: {
    summary:
      "A shift roster. <Roster1 staff={[{ id, name, role, maxHours }]} positions={[{ id, label, tone }]} shifts={{ 'p1|2026-10-12': { start: '07:00', end: '15:00', position: 'bar' } | { off: true } }} weekStart='2026-10-12' /* a Monday */ required={[3,3,3,4,4,5,4]} minRest={11} locale onChange={(key, shift | null) => ...} onPublish={(weekStart) => Promise} />. Hours, overtime against each maxHours, rest between one day's end and the next day's start (under minRest is flagged) and coverage against required are worked out from the shifts. Press a cell to add, edit or remove a shift or mark time off. Reject onPublish to keep the week a draft with the reason.",
    whenToUse: ["Scheduling staff in hospitality, retail, care and support teams", "Planning who covers what each day"],
    whenNotToUse: ["A project timeline (use gantt-1)", "Booking one meeting (use a calendar)"],
    composesWith: ["timesheet-1", "directory-1", "calendar-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, Enter", action: "Every cell is a button that reads the person, day, hours and position ('Amara Okoye, Mon 12 Oct: 07:00 to 15:00, Bar. Edit') or 'no shift. Add one'; the editor is a dialog that returns focus to the cell" },
      { keys: "Flags", action: "Overtime ('4 h over 32'), too little rest and short coverage ('3 of 4, short by 1') are written in words with icons, and the summary counts them" },
      { keys: "Table", action: "A real table with caption, headers and a coverage footer; it scrolls sideways on a phone and is a focusable region" },
    ],
    customization: ["positions carry their own color classes", "minRest and each person's maxHours are plain numbers", "Weeks page with Previous and Next; the shifts are keyed by person and date so any range can be loaded"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
