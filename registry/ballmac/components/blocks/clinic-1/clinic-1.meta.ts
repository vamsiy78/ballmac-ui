import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "clinic-1",
  type: "registry:block",
  title: "Clinic 1: day schedule",
  description:
    "A clinic's day: a column per provider, a row per quarter hour, appointments at their real time and length with status written out, one button to move a patient on, and a privacy switch that shows initials only.",
  category: "blocks",
  blockCategory: "clinic",
  tags: ["clinic", "healthcare", "appointments", "schedule", "front desk", "patients", "medical", "booking"],
  files: [{ path: "components/blocks/clinic-1/clinic-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "clinic-1-demo", title: "Default", file: "clinic-1-demo.tsx" },
    { name: "clinic-1-private", title: "Initials only, for a shared screen", file: "clinic-1-private.tsx" },
    { name: "clinic-1-loading", title: "Loading", file: "clinic-1-loading.tsx" },
    { name: "clinic-1-empty", title: "No appointments today", file: "clinic-1-empty.tsx" },
    { name: "clinic-1-error", title: "Could not load", file: "clinic-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "clinic-1-loading", trigger: "state=\"loading\"", note: "Skeleton columns under the real heading, announced as loading." },
    { id: "empty", title: "No appointments today", example: "clinic-1-empty", trigger: "state=\"empty\"", note: "Says no appointments today; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "clinic-1-error", trigger: "state=\"error\"", note: "An alert saying no appointment was changed, with Try again (onRetry). A status update that fails goes back and says why." },
  ],
  ai: {
    summary:
      "A clinic day view. <Clinic1 providers={[{ id, name, role? }]} appointments={[{ id, providerId, start: 0 /* minutes after firstSlot, in 15s */, length: 30, patient, reason, status: 'booked' | 'arrived' | 'in-room' | 'done' | 'no-show' }]} day='Friday 24 October' firstSlot='08:00' slots={12} defaultPrivate onStatus={(appointment, status) => Promise} />. Select an appointment to see the next actions that fit its status. Initials-only mode hides names in the grid and in the accessible labels.",
    whenToUse: ["A front-desk screen for a clinic, dentist or therapy practice", "Any day schedule with providers and check-in steps"],
    whenNotToUse: ["A calendar for events; use calendar-1", "Booking a class for many people; use booking-1"],
    composesWith: ["booking-1", "roster-1", "calendar-1", "app-shell-1"],
    a11y: [
      { keys: "Columns", action: "Each provider is a labelled group; each appointment is a toggle button that reads '08:30 to 09:00, Ken Watanabe, Blood pressure check, In room'" },
      { keys: "Status", action: "Written on every appointment in words (Booked, Arrived, In room, Done, No-show); tints only reinforce it" },
      { keys: "Privacy", action: "The switch is a toggle button; in initials-only mode names are removed from the labels as well, not just hidden" },
      { keys: "Moving a patient on", action: "Real buttons whose names say what happens; the result is a polite announcement and a failure is an alert" },
    ],
    customization: ["providers, firstSlot and slots", "defaultPrivate for waiting-room screens", "onStatus; reject and the status goes back with the message"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
