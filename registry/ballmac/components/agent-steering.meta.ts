import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-steering",
  type: "registry:ui",
  title: "Agent Steering",
  description:
    "Redirecting an agent while it works: say what to change and when (now, after this step or at the end), and watch each instruction go from queued to applied or dropped. Take back an instruction that has not applied yet.",
  category: "ai",
  tags: ["ai", "agents", "steering", "interrupt", "queue", "human in the loop", "instructions", "control"],
  files: [{ path: "components/agent-steering.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "agent-steering-demo", title: "Steer a running agent", file: "agent-steering-demo.tsx" },
    { name: "agent-steering-idle", title: "The agent is not running", file: "agent-steering-idle.tsx" },
  ],
  ai: {
    summary:
      "notes is [{ id, text, mode: now | after-step | end, state: queued | applied | dropped, at? }] and the parent owns it (required). running (default true) and step say what it is doing; instructions can only be sent while it runs. onSend(text, mode) and onRemove(id) may be async: reject and the card keeps the text and says why. defaultMode (default after-step). Ctrl or Command with Enter sends.",
    whenToUse: ["Letting a person change an agent's course without stopping it", "Showing the instructions that are queued, applied or dropped"],
    whenNotToUse: ["A first prompt before a run starts; use ai-chat or a prompt box", "Approving a risky action; use approval-card", "Setting how much it may do alone; use autonomy-dial"],
    composesWith: ["tool-call-card", "plan-tracker", "autonomy-dial", "agent-lanes"],
    a11y: [
      { keys: "Timing", action: "A native radio group (Now, After this step, At the end); each has a title that says what it does" },
      { keys: "States", action: "Queued, Applied and Dropped are words with icons beside each instruction" },
      { keys: "Errors", action: "An empty instruction, a failed send and a failed take-back are alerts; the text stays in the box" },
      { keys: "Take back", action: "A button named 'Take back: <text>', only on queued instructions" },
      { keys: "Keyboard", action: "Ctrl or Command with Enter sends" },
    ],
    customization: ["notes, running and step", "onSend and onRemove", "defaultMode"],
  },
  statesNone: "A presentational card: the instructions are passed in with their own state, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
