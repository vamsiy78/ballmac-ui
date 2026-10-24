import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "permission-grid",
  type: "registry:ui",
  title: "Permission Grid",
  description:
    "A grid of everything an agent could do, each row set to Allow, Ask or Deny with native radios, risk written out, a warning when a high-risk action is allowed, grouped rows and one-click presets.",
  category: "ai",
  tags: ["ai", "agents", "permissions", "settings", "safety", "tools", "approval"],
  files: [{ path: "components/permission-grid.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "permission-grid-demo", title: "Tools with presets", file: "permission-grid-demo.tsx" },
    { name: "permission-grid-dial", title: "With an Autonomy Dial", file: "permission-grid-dial.tsx" },
  ],
  ai: {
    summary:
      "permissions is [{ id, label, description?, risk?: low | medium | high, group? }]; value / defaultValue / onValueChange hold { [id]: 'allow' | 'ask' | 'deny' } (missing ids mean ask). presets is [{ id, label, values }] and fills the grid in one click.",
    whenToUse: ["Letting people decide which tools an agent may use without asking", "A permissions page for an assistant or a bot"],
    whenNotToUse: ["One overall level of freedom; use autonomy-dial", "A single approval in the moment; use approval-card", "User roles in a workspace; use the access review block"],
    composesWith: ["autonomy-dial", "approval-card", "tool-call-card", "settings-panel"],
    a11y: [
      { keys: "Tab", action: "One stop per row: the chosen answer, or the first if none is" },
      { keys: "ArrowRight / ArrowLeft / ArrowDown / ArrowUp", action: "Moves between Allow, Ask and Deny in the row (native radios)" },
      { keys: "Screen readers", action: "A real table; each radio is named 'Run shell commands: Allow'; the counts are a polite live region" },
      { keys: "Risk and decisions", action: "Written as words and icons; colour only reinforces them" },
    ],
    customization: ["permissions with groups and risk", "presets that set many rows at once", "title", "Controlled or uncontrolled value"],
  },
  statesNone: "A control with no data of its own: it shows the permissions you pass in and reports the choices.",
  version: "1.0.0",
  updated: "2026-10-24",
})
