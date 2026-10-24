import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-tree",
  type: "registry:ui",
  title: "Agent Tree",
  description:
    "Who handed work to whom: an orchestrator and the agents it delegated to as a tree, each with its state in words, model, rolled-up progress and cost, a header that adds it up, and the full tree keyboard model.",
  category: "ai",
  tags: ["ai", "agents", "tree", "delegation", "orchestrator", "sub-agents", "multi-agent", "hierarchy"],
  files: [{ path: "components/agent-tree.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n", "motion-presets"],
  examples: [
    { name: "agent-tree-demo", title: "A research team", file: "agent-tree-demo.tsx" },
    { name: "agent-tree-failed", title: "A failed branch", file: "agent-tree-failed.tsx" },
  ],
  ai: {
    summary:
      "agents is [{ id, parentId?, name, task?, status: queued | running | waiting | done | failed, progress?, model?, tokens?, cost?, duration? }] (required); selected / defaultSelected / onSelectedChange, defaultCollapsed (ids), title, currency. A parent without progress shows the average of its sub-agents; the header counts agents, running, waiting and failed, and adds up cost. A real tree: arrow keys, Home, End, Enter. Exports flattenAgents and agentProgress.",
    whenToUse: ["Showing an orchestrator and the sub-agents it started, and how each is doing", "A multi-agent run where delegation depth and cost matter"],
    whenNotToUse: ["Agents that work side by side on a timeline; use agent-lanes", "How agents and tools are wired in general; use agent-graph", "Timing of spans; use trace-waterfall"],
    composesWith: ["agent-lanes", "agent-graph", "trace-waterfall", "agent-steering"],
    a11y: [
      { keys: "Tab", action: "Enters the tree once, on the first agent (or the selected one)" },
      { keys: "Arrow keys", action: "Up and Down move; Right opens an agent or goes into it; Left closes it or goes to its parent; Home and End jump" },
      { keys: "Enter", action: "Selects an agent and writes out its task, model, cost and sub-agents below" },
      { keys: "Screen readers", action: "A tree with level, position and expanded state; each name includes the state in words and the task" },
      { keys: "State", action: "Queued, Running, Waiting, Done and Failed are words with icons, never only colour" },
    ],
    customization: ["agents and their numbers", "title, currency", "selected and defaultCollapsed"],
  },
  statesNone: "A presentational tree: the agents are passed in with their own status, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
