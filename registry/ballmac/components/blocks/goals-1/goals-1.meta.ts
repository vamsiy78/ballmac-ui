import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "goals-1",
  type: "registry:block",
  title: "Goals 1: objectives and key results",
  description:
    "Objectives and key results for a period: progress worked out from start, current and target, a pace mark on each bar for where it should be today, on track, at risk or behind in words, overall progress, team filter and in-place updates.",
  category: "blocks",
  blockCategory: "goals",
  tags: ["goals", "okr", "okrs", "objectives", "key results", "progress", "targets", "quarter", "planning", "team"],
  files: [{ path: "components/blocks/goals-1/goals-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "cover-art", "input", "skeleton", "state-view"],
  examples: [
    { name: "goals-1-demo", title: "Mid-quarter", file: "goals-1-demo.tsx" },
    { name: "goals-1-late", title: "Late in the quarter", file: "goals-1-late.tsx" },
    { name: "goals-1-loading", title: "Loading", file: "goals-1-loading.tsx" },
    { name: "goals-1-empty", title: "No goals yet", file: "goals-1-empty.tsx" },
    { name: "goals-1-error", title: "Could not load", file: "goals-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "goals-1-loading", trigger: "state=\"loading\"", note: "A skeleton summary and objective cards under the real heading, announced as loading." },
    { id: "empty", title: "No goals yet", example: "goals-1-empty", trigger: "state=\"empty\" (or objectives={[]})", note: "Says to set an objective and the results that would show it worked; emptyState sets the copy and can add a button." },
    { id: "error", title: "Could not load", example: "goals-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). An update that fails to save puts the old number back with the reason." },
  ],
  ai: {
    summary:
      "OKRs. <Goals1 objectives={[{ id, title, owner, team, keyResults: [{ id, title, start, target, current, unit, prefix }] }]} period='Q4 2026' range={['2026-10-01', '2026-12-31']} today='2026-11-12' locale onUpdate={(objective, keyResult, value) => Promise} />. Key result progress is (current - start) / (target - start), clamped 0 to 1, so a target below the start means lower is better. Status compares progress with the share of the period gone: within 10 points On track, within 25 At risk, else Behind, 100% Done. Pass today yourself; the block never reads the clock. Reject onUpdate and the old value returns with the message.",
    whenToUse: ["A team or company goals page", "A quarterly review dashboard"],
    whenNotToUse: ["A project plan with dates and dependencies (use gantt-1)", "A list of to-dos (use tasks-1)"],
    composesWith: ["gantt-1", "tasks-1", "funnel-1", "app-shell-1"],
    a11y: [
      { keys: "Tab, Enter / Escape", action: "Each key result has an Update button named for it; Enter saves the number and Escape cancels" },
      { keys: "Status", action: "Written as On track, At risk, Behind or Done with an icon and the percentage, never by color alone; the pace mark is explained in a caption" },
      { keys: "Summary", action: "Counts by status are a labelled list ('2 On track, 1 At risk')" },
    ],
    customization: ["unit goes after the number ('%', ' ms') and prefix before it ('$')", "Lower-is-better results are recognised from target < start and say so", "The bars, ring and pace marks mirror in right-to-left"],
  },
  version: "1.0.0",
  updated: "2026-10-18",
})
