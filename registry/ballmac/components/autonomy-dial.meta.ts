import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "autonomy-dial",
  type: "registry:ui",
  title: "Autonomy Dial",
  description:
    "A stepped dial for how much an agent may do on its own, from suggest-only to full auto, with what it does alone and what it stops to ask about written out for every step.",
  category: "ai",
  tags: ["ai", "agents", "permissions", "autonomy", "settings", "control", "safety"],
  files: [{ path: "components/autonomy-dial.tsx" }],
  dependencies: ["lucide-react", "motion"],
  registryDependencies: ["shadcn:utils", "i18n", "motion-presets"],
  examples: [
    { name: "autonomy-dial-demo", title: "Real actions", file: "autonomy-dial-demo.tsx" },
    { name: "autonomy-dial-levels", title: "Four levels", file: "autonomy-dial-levels.tsx" },
    { name: "autonomy-dial-custom", title: "Your own levels", file: "autonomy-dial-custom.tsx" },
  ],
  ai: {
    summary:
      "levels is [{ value, label, summary, does: string[], asks: string[] }] from least to most autonomous (defaultAutonomyLevels has four). actions is [{ id, label, icon?, risk?: safe | risky | destructive, autoFrom?: a level value }]: with it, real actions sort into Does on its own and Asks you first as the dial moves, and an action with no autoFrom is marked Always asks. value / defaultValue / onValueChange. A native radio group, so arrow keys work; the panel under the dial says in words what the chosen level allows.",
    whenToUse: ["Letting people decide how far an agent may go before asking", "A settings row for an assistant's permissions"],
    whenNotToUse: ["A single yes or no approval; use approval-card", "A numeric value; use slider"],
    composesWith: ["approval-card", "settings-panel", "agent-plan", "tool-call-card"],
    a11y: [
      { keys: "Tab", action: "Moves into the dial once, onto the selected step" },
      { keys: "ArrowRight / ArrowDown", action: "Next level (native radio behaviour; the browser mirrors it in right-to-left)" },
      { keys: "ArrowLeft / ArrowUp", action: "Previous level" },
      { keys: "Screen readers", action: "A fieldset with a legend, one radio per level, and a polite live region that reads the new meaning when it changes" },
      { keys: "Meaning", action: "Carried by the words under the dial, not by the track or its colour" },
    ],
    customization: ["levels: any number of steps, your own words", "label", "Controlled or uncontrolled value"],
  },
  statesNone: "A control with no data of its own: it shows the levels you pass in and reports the choice.",
  version: "1.1.0",
  updated: "2026-10-25",
  changelog: [
    { version: "1.1.0", date: "2026-10-25", note: "New actions prop: real actions with icons and risk badges slide between Does on its own and Asks you first as the dial moves, and an action that never runs alone is marked Always asks." },
    { version: "1.0.0", date: "2026-10-24", note: "First release." },
  ],
})
