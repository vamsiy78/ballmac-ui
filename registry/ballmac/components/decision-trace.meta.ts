import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "decision-trace",
  type: "registry:ui",
  title: "Decision Trace",
  description:
    "Why an agent picked one path over the others: options on a branch diagram with fit scores, the chosen one marked in words, reasoning with pros and cons on open, and a way for a person to choose another.",
  category: "ai",
  tags: ["ai", "agent", "explainability", "decision", "routing", "trace", "transparency", "human in the loop"],
  files: [{ path: "components/decision-trace.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "decision-trace-demo", title: "A router choosing how to answer", file: "decision-trace-demo.tsx" },
    { name: "decision-trace-readonly", title: "Read only", file: "decision-trace-readonly.tsx" },
  ],
  ai: {
    summary:
      "question and options ({ id, label, score 0-1, reason, pros?, cons?, cost? }) are required. The highest score is chosen unless chosen/defaultChosen says otherwise. decidedBy names the decider. onOverride(id) adds 'Use this instead' on the others; reject and the choice goes back with the reason. Options open and close; the chosen one starts open.",
    whenToUse: ["Showing why a router, planner or tool-picker chose what it chose", "A review step where a person may overrule an agent's choice"],
    whenNotToUse: ["The sequence of steps in a run; use agent-graph or trace-waterfall", "Comparing outputs; use model-compare"],
    composesWith: ["agent-graph", "trace-waterfall", "escalation-card", "tool-catalog"],
    a11y: [
      { keys: "Options", action: "Each option is a heading with a button, aria-expanded, and the words Chosen or Not chosen; score is text as well as a bar" },
      { keys: "Override", action: "A native button named 'Use this instead'; the result is announced and failures are alerts" },
      { keys: "Diagram", action: "The branch lines are decoration; the list order is highest score first" },
    ],
    customization: ["question, options, decidedBy", "chosen or defaultChosen", "onOverride"],
  },
  statesNone: "A presentational trace: the options are passed in, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
