import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "cron-1",
  type: "registry:block",
  title: "Cron 1: scheduled jobs",
  description:
    "The scheduled jobs of a product: each schedule in plain words beside its cron expression, an on and off switch, the last run written out, the next runs, and a Run now button that asks first.",
  category: "blocks",
  blockCategory: "cron",
  tags: ["cron", "scheduled jobs", "scheduler", "automation", "backups", "tasks", "devops", "timers"],
  files: [{ path: "components/blocks/cron-1/cron-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "button", "skeleton", "state-view", "switch", "return-focus"],
  examples: [
    { name: "cron-1-demo", title: "Default", file: "cron-1-demo.tsx" },
    { name: "cron-1-loading", title: "Loading", file: "cron-1-loading.tsx" },
    { name: "cron-1-empty", title: "No scheduled jobs", file: "cron-1-empty.tsx" },
    { name: "cron-1-error", title: "Could not load", file: "cron-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "cron-1-loading", trigger: "state=\"loading\"", note: "Skeleton rows under the real heading, announced as loading." },
    { id: "empty", title: "No scheduled jobs", example: "cron-1-empty", trigger: "state=\"empty\"", note: "Says no scheduled jobs; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "cron-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed or started, with Try again (onRetry). A switch that fails goes back and says why." },
  ],
  ai: {
    summary:
      "Scheduled jobs. <Cron1 jobs={[{ id, name, schedule: '0 9 * * 1-5', timezone?, enabled, owner?, last?: { status: 'success' | 'failed' | 'running', at, duration? }, next?: string[] }]} onToggle={(job, enabled) => Promise} onRunNow={(job) => Promise} />. Exports describeCron(expr), which turns common five-field expressions into a sentence (every N minutes or hours, daily, weekdays, weekends, one weekday, monthly) and says 'A custom schedule' for the rest instead of guessing.",
    whenToUse: ["An admin page for cron jobs and background schedules", "Letting a team pause a job or run it once by hand"],
    whenNotToUse: ["The workers and their failed jobs; use queues-1", "Automations built by users with triggers and steps; use workflow-1"],
    composesWith: ["queues-1", "audit-1", "pipeline-1", "slo-1"],
    a11y: [
      { keys: "Schedule", action: "Written as a sentence and also shown as code, which stays left to right" },
      { keys: "Switch", action: "Named '<job> is on'; a failure is an alert and the switch goes back" },
      { keys: "Run now", action: "A button named for the job that opens an alert dialog, and is off while the job is already running" },
      { keys: "Last run", action: "Written in words with an icon (Last run failed), never colour alone" },
    ],
    customization: ["jobs with last and next runs", "onToggle and onRunNow", "describeCron is exported for your own lists"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
