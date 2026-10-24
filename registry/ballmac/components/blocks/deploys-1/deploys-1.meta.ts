import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "deploys-1",
  type: "registry:block",
  title: "Deploys 1: deploy history",
  description:
    "The deploy history of a product: version, what changed, who shipped it and when, how it ended in words, one environment at a time, the live version marked, and a confirmed rollback to any earlier version that succeeded.",
  category: "blocks",
  blockCategory: "deploys",
  tags: ["deploys", "releases", "rollback", "history", "ci", "cd", "versions", "devops"],
  files: [{ path: "components/blocks/deploys-1/deploys-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "button", "skeleton", "state-view", "return-focus"],
  examples: [
    { name: "deploys-1-demo", title: "Default", file: "deploys-1-demo.tsx" },
    { name: "deploys-1-failing", title: "Rollback fails", file: "deploys-1-failing.tsx" },
    { name: "deploys-1-loading", title: "Loading", file: "deploys-1-loading.tsx" },
    { name: "deploys-1-empty", title: "Nothing deployed yet", file: "deploys-1-empty.tsx" },
    { name: "deploys-1-error", title: "Could not load", file: "deploys-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "deploys-1-loading", trigger: "state=\"loading\"", note: "Skeleton rows under the real heading, announced as loading." },
    { id: "empty", title: "Nothing deployed yet", example: "deploys-1-empty", trigger: "state=\"empty\"", note: "Says nothing has been deployed yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "deploys-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was rolled back or changed, with Try again (onRetry). A rollback that does not start says why." },
  ],
  ai: {
    summary:
      "Deploy history. <Deploys1 deploys={[{ id, version, message, author, time, environment, status: 'success' | 'failed' | 'rolled-back' | 'running', duration?, commit? }]} onRollback={(deploy) => Promise} />. The first environment shows at first; a control switches. The newest successful deploy per environment is Live; only earlier successful ones offer Roll back to this, behind a confirmation naming both versions.",
    whenToUse: ["A release page where people check what is live and go back if needed", "An audit of what shipped to each environment"],
    whenNotToUse: ["The stages of one deploy; use pipeline-1", "Changes to settings; use audit-1"],
    composesWith: ["pipeline-1", "incident-1", "audit-1", "status-1"],
    a11y: [
      { keys: "Timeline", action: "An ordered list named 'Deploys to production, newest first'; each status is written ('Succeeded · 3 min 12 s', 'Failed', 'Rolled back') with an icon" },
      { keys: "Live", action: "Marked with the word Live" },
      { keys: "Environment", action: "Toggle buttons with aria-pressed" },
      { keys: "Rollback", action: "A button named 'Roll back production to v2.18.2' that opens an alert dialog and returns focus when closed; a failure is an alert" },
    ],
    customization: ["deploys with environments", "onRollback; reject and nothing changes", "Commit ids and versions stay left to right"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
