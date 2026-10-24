import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-graph",
  type: "registry:ui",
  title: "Agent Graph",
  description:
    "A layered graph of how agents, tools, memory and people hand work to each other: nodes that say what they are and what they are doing in words, labelled arrows, the active path drawn heavier, and arrow keys that follow the edges.",
  category: "ai",
  tags: ["ai", "agents", "graph", "multi-agent", "workflow", "orchestration", "diagram", "topology"],
  files: [{ path: "components/agent-graph.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "agent-graph-demo", title: "A research team", file: "agent-graph-demo.tsx" },
    { name: "agent-graph-review", title: "With a person and a loop", file: "agent-graph-review.tsx" },
  ],
  ai: {
    summary:
      "nodes is [{ id, label, kind?: agent | tool | human | memory, status?: idle | working | waiting | blocked | done, detail? }]; edges is [{ from, to, label?, active? }]. Columns are computed from the edges; an edge that loops back is drawn under the nodes. selected / defaultSelected / onSelectedChange. layoutGraph(nodes, edges) is exported.",
    whenToUse: ["Showing how a multi-agent system is wired and where the work is right now", "A map of tools and people an agent can call"],
    whenNotToUse: ["Who did what over time; use agent-lanes", "A linear list of steps; use trace or agent-plan", "Flows with amounts; use flow-sankey"],
    composesWith: ["agent-roster", "agent-lanes", "handoff-card", "tool-catalog"],
    a11y: [
      { keys: "Tab", action: "Enters the graph once, on the first node (or the selected one)" },
      { keys: "ArrowRight / ArrowLeft", action: "Follow an edge to what the node sends to, or to what feeds it" },
      { keys: "ArrowDown / ArrowUp", action: "Next or previous node in the same column; Home and End go to the first and last" },
      { keys: "Enter / Space", action: "Selects the node and lists its connections in a sentence (a polite live region)" },
      { keys: "Screen readers", action: "Each node reads 'Coder, agent, working'; status and kind are words, never colour or position alone" },
    ],
    customization: ["nodes with kind and status", "edges with labels and active", "Controlled selection", "layoutGraph is exported"],
  },
  statesNone: "A presentational diagram: you pass the nodes and edges in, so it has nothing of its own to load or fail.",
  version: "1.0.0",
  updated: "2026-10-24",
})
