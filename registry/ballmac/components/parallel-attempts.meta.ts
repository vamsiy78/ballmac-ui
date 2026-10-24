import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "parallel-attempts",
  type: "registry:ui",
  title: "Parallel Attempts",
  description:
    "Compare several runs of the same task side by side: status, summary, a changed-lines bar, time and cost on each card, a suggested run, and a native radio group to pick one and continue.",
  category: "ai",
  tags: ["ai", "agents", "compare", "attempts", "best-of-n", "diff", "choose"],
  files: [{ path: "components/parallel-attempts.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "parallel-attempts-demo", title: "Four attempts, one running", file: "parallel-attempts-demo.tsx" },
    { name: "parallel-attempts-choose", title: "Pick and continue", file: "parallel-attempts-choose.tsx" },
  ],
  ai: {
    summary:
      "attempts is [{ id, label, model?, status: running | done | failed | stopped, summary, added?, removed?, files?, duration?, cost?, progress? }]. value / defaultValue / onValueChange pick a finished attempt; recommended marks one; onChoose adds a confirm button.",
    whenToUse: ["Best-of-n runs where a person chooses the result", "Comparing two or more models on the same task"],
    whenNotToUse: ["Comparing prompts in a table; use the agent-4 block", "A single run's steps; use trace or agent-lanes"],
    composesWith: ["agent-lanes", "run-ledger", "diff-viewer", "approval-card"],
    a11y: [
      { keys: "Tab", action: "Moves into the group once; the arrow keys move between finished attempts" },
      { keys: "ArrowRight / ArrowDown", action: "Picks the next finished attempt (native radio behaviour, mirrored in right-to-left by the browser)" },
      { keys: "Space", action: "Picks the focused attempt" },
      { keys: "Running, failed or stopped", action: "Shown with an icon and words, and not selectable" },
      { keys: "Screen readers", action: "A fieldset with a hidden legend; each radio is described by its summary" },
    ],
    customization: ["recommended and recommendedLabel", "onChoose and chooseLabel", "Cards fill the width in columns of at least 15rem"],
  },
  statesNone: "A presentational comparison: you pass in the attempts and their statuses, so it has nothing of its own to load or submit.",
  version: "1.0.0",
  updated: "2026-10-24",
})
