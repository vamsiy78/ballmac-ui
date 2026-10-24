import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-lanes",
  type: "registry:ui",
  title: "Agent Lanes",
  description:
    "A swimlane timeline for multi-agent runs: one lane per agent, steps coloured by what they are doing, dashed handoffs between lanes, a Now line and a detail panel, all reachable with the arrow keys.",
  category: "ai",
  tags: ["ai", "agents", "timeline", "swimlane", "handoff", "multi-agent", "trace"],
  files: [{ path: "components/agent-lanes.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "direction", "i18n"],
  examples: [
    { name: "agent-lanes-demo", title: "A four-agent run", file: "agent-lanes-demo.tsx" },
    { name: "agent-lanes-blocked", title: "Waiting and blocked", file: "agent-lanes-blocked.tsx" },
  ],
  ai: {
    summary:
      "lanes is [{ id, name, role?, segments: [{ id, start, end, kind, label, detail? }] }] with times in seconds; kind is thinking | tool | waiting | blocked | done. handoffs is [{ from, to, label? }] using segment ids. Optional duration, now, selected / defaultSelected / onSelectedChange, formatTime.",
    whenToUse: ["Showing what several agents did and when, and who handed work to whom", "Finding the step where a run waited or got blocked"],
    whenNotToUse: ["One agent's linear steps; use trace", "A plan with checkable steps; use agent-plan", "A project schedule; use the gantt block"],
    composesWith: ["trace", "token-meter", "approval-card", "tool-call-card"],
    a11y: [
      { keys: "Tab", action: "Moves into the chart once, onto one step; the rest are reached with the arrow keys" },
      { keys: "ArrowRight / ArrowLeft", action: "Next or previous step in the same lane (swapped in right-to-left)" },
      { keys: "ArrowDown / ArrowUp", action: "The closest step in the lane below or above" },
      { keys: "Home / End", action: "First or last step in the lane; with Ctrl, in the whole chart" },
      { keys: "Enter / Space", action: "Selects the step and shows its detail in a polite live region" },
      { keys: "Screen readers", action: "Each step reads its label, lane, kind and time range; handoffs are also listed as sentences" },
    ],
    customization: ["duration and now", "formatTime for your own time text", "minTrackWidth before the chart scrolls sideways", "Controlled selection"],
  },
  statesNone: "A presentational chart: you pass the finished or running steps in, so there is nothing for it to load, submit or fail.",
  version: "1.0.0",
  updated: "2026-10-24",
})
