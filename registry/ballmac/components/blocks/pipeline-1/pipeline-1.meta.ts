import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "pipeline-1",
  type: "registry:block",
  title: "Pipeline 1: deploy pipeline",
  description:
    "One run of a deploy pipeline: the commit, each stage as a step with its status written out and duration, logs one click away, an approval gate that says who can approve, and a failed stage that offers to run again from there.",
  category: "blocks",
  blockCategory: "pipeline",
  tags: ["ci", "cd", "deploy", "pipeline", "release", "build", "approval", "devops"],
  files: [{ path: "components/blocks/pipeline-1/pipeline-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "pipeline-1-demo", title: "Default", file: "pipeline-1-demo.tsx" },
    { name: "pipeline-1-failed", title: "A failed stage", file: "pipeline-1-failed.tsx" },
    { name: "pipeline-1-loading", title: "Loading", file: "pipeline-1-loading.tsx" },
    { name: "pipeline-1-empty", title: "No runs yet", file: "pipeline-1-empty.tsx" },
    { name: "pipeline-1-error", title: "Could not load", file: "pipeline-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "pipeline-1-loading", trigger: "state=\"loading\"", note: "Skeleton for the commit and the stages under the real heading, announced as loading." },
    { id: "empty", title: "No runs yet", example: "pipeline-1-empty", trigger: "state=\"empty\"", note: "Says no runs yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "pipeline-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was deployed or changed, with Try again (onRetry). A failed approval keeps the gate waiting and says why." },
  ],
  ai: {
    summary:
      "A deploy pipeline run. <Pipeline1 run={{ branch, commit, message, author, stages: [{ id, name, status: 'passed' | 'running' | 'failed' | 'waiting' | 'pending' | 'skipped', duration?, log?: string[], approver? }] }} defaultOpenId='build' onApprove={(stageId) => Promise} onRerun={(stageId) => Promise} />. A waiting stage shows its approver and an Approve button; a failed stage offers Run again from here. Only stages with a log are buttons.",
    whenToUse: ["A release page showing where a deploy is and what is blocking it", "An approval step before production"],
    whenNotToUse: ["A list of many runs; use a table", "Server logs in real time; use log-stream"],
    composesWith: ["incident-1", "audit-1", "status-1", "dev-1"],
    a11y: [
      { keys: "Stages", action: "An ordered list named 'Stages'; each status is written ('Passed · 1 min 48 s', 'Waiting for approval'), never colour alone" },
      { keys: "Stage with a log", action: "A button with aria-expanded that controls the log region; a stage with no log is not focusable" },
      { keys: "Log", action: "A focusable, labelled, scrollable region that stays left to right" },
      { keys: "Approve and run again", action: "Real buttons; a failure is an alert beside the stage and the stage stays as it was" },
    ],
    customization: ["run and defaultOpenId", "onApprove and onRerun; reject and the message says why", "The number of stages is not fixed"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
