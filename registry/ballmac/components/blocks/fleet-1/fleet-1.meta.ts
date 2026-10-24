import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "fleet-1",
  type: "registry:block",
  title: "Fleet 1: vehicle fleet",
  description:
    "A fleet overview: each vehicle with where it is, status in words, fuel or charge, distance to the next service, and faults, filter by status, message the driver, book a service, all undone with the reason if it fails.",
  category: "blocks",
  blockCategory: "fleet",
  tags: ["fleet", "vehicles", "logistics", "transport", "telematics", "drivers", "maintenance", "operations"],
  files: [{ path: "components/blocks/fleet-1/fleet-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "fleet-1-demo", title: "Default", file: "fleet-1-demo.tsx" },
    { name: "fleet-1-service", title: "Service due", file: "fleet-1-service.tsx" },
    { name: "fleet-1-loading", title: "Loading", file: "fleet-1-loading.tsx" },
    { name: "fleet-1-empty", title: "No vehicles yet", file: "fleet-1-empty.tsx" },
    { name: "fleet-1-error", title: "Could not load", file: "fleet-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "fleet-1-loading", trigger: "state=\"loading\"", note: "Skeleton cards under the real heading, announced as loading." },
    { id: "empty", title: "No vehicles yet", example: "fleet-1-empty", trigger: "state=\"empty\"", note: "Says no vehicles yet; emptyState sets the copy. A filter with no match says so." },
    { id: "error", title: "Could not load", example: "fleet-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was sent or booked, with Try again (onRetry). An action that fails says why." },
  ],
  ai: {
    summary:
      "Fleet overview. <Fleet1 vehicles={[{ id, name, plate, driver?, status: 'moving'|'idle'|'parked'|'service', where, speedKmh?, level, serviceInKm, alerts? }]} lowLevel={20} serviceSoonKm={500} onMessage={(vehicle, text) => Promise} onBookService={(vehicle) => Promise} />. Low level and service soon are called out in words.",
    whenToUse: ["A dispatcher or fleet manager overview", "Any list of assets with location, level and upkeep"],
    whenNotToUse: ["A live map; place this beside one", "Driver payroll or trips history"],
    composesWith: ["inspection-1", "capacity-1", "alerts-1"],
    a11y: [
      { keys: "Status", action: "Moving, Idle, Parked and In service are words with icons" },
      { keys: "Level", action: "A meter with a text value, and Low is written" },
      { keys: "Message", action: "A labelled field and a button named for the driver; the result is announced" },
      { keys: "Filter", action: "A group of toggle buttons with pressed state" },
    ],
    customization: ["vehicles, lowLevel, serviceSoonKm", "onMessage and onBookService"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
