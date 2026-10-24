import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "handoff-card",
  type: "registry:ui",
  title: "Handoff Card",
  description:
    "The packet one agent passes to another: who hands over to whom, the task, the context that travels with it and its size, the questions still open and the rules to keep, with a status and room for actions.",
  category: "ai",
  tags: ["ai", "agents", "handoff", "multi-agent", "delegation", "context"],
  files: [{ path: "components/handoff-card.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "handoff-card-demo", title: "Planner to Coder", file: "handoff-card-demo.tsx" },
    { name: "handoff-card-returned", title: "Sent back with a question", file: "handoff-card-returned.tsx" },
  ],
  ai: {
    summary:
      "from and to are { name, role? }; title; context [{ label, detail?, size? }]; questions string[]; constraints string[]; status pending | accepted | returned; at; actions slot. A server-friendly card with no state.",
    whenToUse: ["Showing what one agent passed to another, in a transcript, an inbox or a run view", "A human review of a delegation before it is accepted"],
    whenNotToUse: ["The timeline of who did what when; use agent-lanes", "A single step of a plan; use agent-plan"],
    composesWith: ["agent-lanes", "approval-card", "trace", "agent-roster"],
    a11y: [
      { keys: "Screen readers", action: "An article named by its title; the arrow between agents reads 'hands over to'; each list has a labelled section" },
      { keys: "Status", action: "Written as words in a pill, never colour alone" },
      { keys: "Actions", action: "Whatever buttons you pass keep their own keyboard behaviour" },
    ],
    customization: ["context, questions and constraints", "status and statusLabel", "actions slot for Accept and Send back buttons"],
  },
  statesNone: "A presentational card: the handoff is passed in, so it has nothing of its own to load or fail.",
  version: "1.0.0",
  updated: "2026-10-24",
})
