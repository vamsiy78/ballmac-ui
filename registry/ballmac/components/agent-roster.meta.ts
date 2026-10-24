import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-roster",
  type: "registry:ui",
  title: "Agent Roster",
  description:
    "Every agent on a team of agents as a card: name and role, a status in words (working, waiting, blocked, idle, offline), what it is doing, a load meter and when it was last active, with status counts that filter the grid.",
  category: "ai",
  tags: ["ai", "agents", "roster", "status", "team", "multi-agent", "monitor"],
  files: [{ path: "components/agent-roster.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "agent-roster-demo", title: "A team of six", file: "agent-roster-demo.tsx" },
    { name: "agent-roster-select", title: "Select to open a run", file: "agent-roster-select.tsx" },
  ],
  ai: {
    summary:
      "agents is [{ id, name, role?, status: working | idle | waiting | blocked | offline, task?, load?: 0..100, lastActive? }]. selected / defaultSelected / onSelectedChange track the picked agent (a second click clears it). Status counts are filters; statuses with no agents are hidden.",
    whenToUse: ["An overview of the agents in a multi-agent product and what each is doing", "Picking an agent to open its run, logs or settings"],
    whenNotToUse: ["One agent's steps; use trace", "A table of users; use data-table", "Who handed what to whom; use agent-lanes or handoff-card"],
    composesWith: ["agent-lanes", "handoff-card", "run-ledger", "trace"],
    a11y: [
      { keys: "Tab, Enter / Space", action: "Filters and cards are buttons; a card is a toggle (aria-pressed)" },
      { keys: "Screen readers", action: "Status is written as a word beside its icon; the load is a labelled meter; the shown count is a polite live region" },
      { keys: "Blocked", action: "Called out in words and an icon, with a red border only as reinforcement" },
    ],
    customization: ["agents and their wording", "title", "Controlled or uncontrolled selection"],
  },
  statesNone: "A presentational overview: the agents are passed in, so it has nothing of its own to load or fail.",
  version: "1.0.0",
  updated: "2026-10-24",
})
