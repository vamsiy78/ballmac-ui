import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "dispatch-1",
  type: "registry:block",
  title: "Dispatch 1: field service board",
  description:
    "A dispatch board for field work: waiting jobs with urgent ones first and named, a lane per technician with their jobs in time order, assignment by a labelled select instead of a drag, take-back, and changes undone with the reason.",
  category: "blocks",
  blockCategory: "dispatch",
  tags: ["dispatch", "field service", "technicians", "jobs", "scheduling", "trades", "logistics", "assign"],
  files: [{ path: "components/blocks/dispatch-1/dispatch-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "dispatch-1-demo", title: "Default", file: "dispatch-1-demo.tsx" },
    { name: "dispatch-1-loading", title: "Loading", file: "dispatch-1-loading.tsx" },
    { name: "dispatch-1-empty", title: "No jobs today", file: "dispatch-1-empty.tsx" },
    { name: "dispatch-1-error", title: "Could not load", file: "dispatch-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "dispatch-1-loading", trigger: "state=\"loading\"", note: "Skeleton for the waiting list and the lanes under the real heading, announced as loading." },
    { id: "empty", title: "No jobs today", example: "dispatch-1-empty", trigger: "state=\"empty\"", note: "Says no jobs today; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "dispatch-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was assigned or changed, with Try again (onRetry). A failed assignment is undone and says why." },
  ],
  ai: {
    summary:
      "A dispatch board. <Dispatch1 technicians={[{ id, name, area?, now? }]} jobs={[{ id, title, address, window, priority: 'normal' | 'urgent', assignedTo?: techId, status?: 'scheduled' | 'en-route' | 'on-site' | 'done' }]} onAssign={(jobId, techId | null) => Promise} />. Waiting jobs list urgent first. Assigning uses a labelled select (no drag), and only a scheduled job can be taken back.",
    whenToUse: ["An office view for assigning field jobs to technicians", "Any queue where jobs wait and are given to people"],
    whenNotToUse: ["A kitchen's tickets by station; use kitchen-1", "A calendar of a person's day; use calendar-1"],
    composesWith: ["workorder-1", "kitchen-1", "roster-1", "locations-1"],
    a11y: [
      { keys: "Assigning", action: "A native select per waiting job named 'Give Fit a thermostat to'; no drag is needed" },
      { keys: "Urgent", action: "Written as the word Urgent with an icon, never a coloured border alone" },
      { keys: "Lanes", action: "Each technician is a labelled region with a count, and jobs are listed in time order with the status in words" },
      { keys: "Take back", action: "A button named for the job and the technician, only on jobs not yet under way" },
    ],
    customization: ["technicians and jobs", "onAssign; reject and the job goes back", "The waiting count and urgent count update as you assign"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
