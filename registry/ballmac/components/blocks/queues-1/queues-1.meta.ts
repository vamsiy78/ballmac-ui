import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "queues-1",
  type: "registry:block",
  title: "Queues 1: job queues",
  description:
    "The queues behind a product: jobs waiting, arrival and finish rates, the age of the oldest job, a queue that is filling faster than it drains called out in words, failed jobs with their errors to retry or discard, and a pause switch.",
  category: "blocks",
  blockCategory: "queues",
  tags: ["queues", "jobs", "background jobs", "retries", "dead letter", "workers", "devops", "monitoring"],
  files: [{ path: "components/blocks/queues-1/queues-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view", "switch"],
  examples: [
    { name: "queues-1-demo", title: "Default", file: "queues-1-demo.tsx" },
    { name: "queues-1-loading", title: "Loading", file: "queues-1-loading.tsx" },
    { name: "queues-1-empty", title: "No queues yet", file: "queues-1-empty.tsx" },
    { name: "queues-1-error", title: "Could not load", file: "queues-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "queues-1-loading", trigger: "state=\"loading\"", note: "Skeleton rows under the real heading, announced as loading." },
    { id: "empty", title: "No queues yet", example: "queues-1-empty", trigger: "state=\"empty\"", note: "Says no queues yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "queues-1-error", trigger: "state=\"error\"", note: "An alert saying no jobs were changed, with Try again (onRetry). A failed pause or retry puts things back and says why." },
  ],
  ai: {
    summary:
      "Background job queues. <Queues1 queues={[{ id, name, depth, inRate, outRate, oldest: '9 min', paused?, series: number[], failed: [{ id, name, error, attempts, at }] }]} defaultOpenId='email' onPause={(queueId, paused) => Promise} onRetryJobs={(queueId, jobId | 'all') => Promise} onDiscard={(queueId, jobId) => Promise} />. A queue is 'Backing up' when jobs arrive over 1.2 times faster than they finish and over 100 wait. Each action updates the screen and reports success or the error.",
    whenToUse: ["An operations view of workers and background jobs", "Finding and retrying jobs that failed"],
    whenNotToUse: ["Scheduled jobs and their next runs; use cron-1", "A deploy's stages; use pipeline-1"],
    composesWith: ["cron-1", "slo-1", "incident-1", "webhooks-1"],
    a11y: [
      { keys: "Table", action: "A real table with a caption; each queue name is a button (aria-expanded) that opens its failed jobs" },
      { keys: "Backing up", action: "Written in words with an icon; the sparkline is decoration" },
      { keys: "Pause", action: "A switch named 'Pause email'; the result is a polite announcement and an error is an alert" },
      { keys: "Retry and discard", action: "Buttons named for the job ('Retry Send invoice 4812')" },
    ],
    customization: ["queues and defaultOpenId", "onPause, onRetryJobs and onDiscard; reject and the message says why", "The backing-up rule is 1.2 times and 100 jobs"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
