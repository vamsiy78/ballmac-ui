import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "runbook-1",
  type: "registry:block",
  title: "Runbook 1: guided runbook",
  description:
    "A runbook to follow under pressure: ordered steps with a tick each, the next step marked, commands to copy but never run for you, cautions read before the step, minutes left, and Finish only when every step is done.",
  category: "blocks",
  blockCategory: "runbook",
  tags: ["runbook", "playbook", "incident", "sre", "operations", "checklist", "procedure", "on-call"],
  files: [{ path: "components/blocks/runbook-1/runbook-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "button", "skeleton", "state-view"],
  examples: [
    { name: "runbook-1-demo", title: "Default", file: "runbook-1-demo.tsx" },
    { name: "runbook-1-done", title: "Nearly finished", file: "runbook-1-done.tsx" },
    { name: "runbook-1-loading", title: "Loading", file: "runbook-1-loading.tsx" },
    { name: "runbook-1-empty", title: "No runbook for this", file: "runbook-1-empty.tsx" },
    { name: "runbook-1-error", title: "Could not load", file: "runbook-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "runbook-1-loading", trigger: "state=\"loading\"", note: "Skeleton for the progress and the steps under the page, announced as loading." },
    { id: "empty", title: "No runbook for this", example: "runbook-1-empty", trigger: "state=\"empty\"", note: "Says there is no runbook for this; pass runbook={null} and emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "runbook-1-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A tick that cannot be saved goes back and says why." },
  ],
  ai: {
    summary:
      "A guided runbook. <Runbook1 runbook={{ title, when, steps: [{ id, title, body, command?, caution?, minutes? }] }} defaultDone={['s1']} onStepChange={(stepId, done) => Promise} onComplete={() => Promise} />. The first step not done is marked Next (aria-current='step'). Commands are shown as code with a Copy button and are never executed. Finish is off until every step is ticked.",
    whenToUse: ["The page an on-call engineer follows for a known problem", "Any procedure where order matters and each step must be confirmed"],
    whenNotToUse: ["An onboarding checklist for users; use onboarding-1", "A deploy's stages; use pipeline-1"],
    composesWith: ["incident-1", "alerts-1", "oncall-1", "matrix-1"],
    a11y: [
      { keys: "Steps", action: "An ordered list; the next step has aria-current='step' and is also marked 'Next' in words" },
      { keys: "Ticks", action: "Real checkboxes labelled with the step; a failed save puts the tick back and is an alert" },
      { keys: "Commands", action: "Left to right, in a focusable labelled region with a Copy button; nothing runs automatically" },
      { keys: "Caution", action: "Written as 'Careful:' with an icon before the step" },
      { keys: "Progress", action: "A meter reading '2 of 5 steps done' and the minutes left in text" },
    ],
    customization: ["steps with commands, cautions and minutes", "defaultDone", "onStepChange and onComplete"],
  },
  version: "1.0.1",
  updated: "2026-10-25",
  changelog: [
    { version: "1.0.1", date: "2026-10-25", note: "Steps no longer push the page wider than a phone when a command is long." },
    { version: "1.0.0", date: "2026-10-24", note: "First release." },
  ],
})
