import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "plan-tracker",
  type: "registry:ui",
  title: "Plan Tracker",
  description:
    "An agent's plan against what happened: every step with its state in words, expected and actual time, a bar of the whole plan, an honest note when steps were added or skipped, and how far a step ran over.",
  category: "ai",
  tags: ["ai", "agents", "plan", "progress", "steps", "tasks", "estimate", "tracker"],
  files: [{ path: "components/plan-tracker.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "motion-presets"],
  examples: [
    { name: "plan-tracker-demo", title: "A plan that changed", file: "plan-tracker-demo.tsx" },
    { name: "plan-tracker-blocked", title: "A blocked step", file: "plan-tracker-blocked.tsx" },
  ],
  ai: {
    summary:
      "steps is [{ id, title, status: todo | doing | done | skipped | blocked, origin?: planned | added, estimate?: minutes, actual?: minutes, note? }] (required); title. The header says how many of the steps that count are done (skipped ones do not count) and about how long is left. A step over its estimate by a quarter and half a minute says by how much. Exports formatMinutes and remainingMinutes.",
    whenToUse: ["Showing the plan an agent is following, and where it has got to", "Making plan changes (added or skipped steps) visible instead of silent"],
    whenNotToUse: ["A checklist a person ticks off; use checklist", "Who is doing what on a shared timeline; use agent-lanes", "Spans with exact timings; use trace-waterfall"],
    composesWith: ["agent-steering", "context-window", "tool-call-card", "run-ledger"],
    a11y: [
      { keys: "List", action: "An ordered list in plan order; each item starts with its state in words ('Done: …') for screen readers" },
      { keys: "Progress", action: "A progressbar named 'Plan' with a spoken value such as '2 of 5 steps done'" },
      { keys: "State", action: "Never only colour: icons, words for In progress and Blocked, and a line-through for Skipped" },
      { keys: "Changes", action: "Added steps carry an 'Added by the agent' tag and the header counts added and skipped steps" },
    ],
    customization: ["steps and title", "estimate and actual in minutes", "note per step"],
  },
  statesNone: "A presentational list: the steps are passed in with their own status, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
