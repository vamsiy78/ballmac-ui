import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "approval-card",
  type: "registry:ui",
  title: "Approval Card",
  description:
    "A human-in-the-loop confirmation for agent actions: what will happen, risk level in words, the exact command, Approve, Deny and Always allow, a timeout countdown and a recorded decision.",
  category: "ai",
  tags: ["ai", "agent", "approval", "confirm", "safety", "human-in-the-loop"],
  files: [{ path: "components/approval-card.tsx" }],
  dependencies: ["motion@^12", "lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "approval-card-demo", title: "Shell command", file: "approval-card-demo.tsx" },
    { name: "approval-card-risks", title: "Three risk levels", file: "approval-card-risks.tsx" },
  ],
  ai: {
    summary:
      "title, description, risk (low | medium | high), details rows and a preview of the exact action. onApprove, onDeny, optional onAlwaysAllow. expiresIn counts down and denies. After a decision the card shows the outcome and moves focus to it.",
    whenToUse: ["Before an agent runs commands, writes files or sends data out", "Any action that needs a person's explicit yes"],
    whenNotToUse: ["Confirming a destructive UI action; use alert-dialog", "Reporting what a tool already did; use tool-call-card"],
    composesWith: ["agent-plan", "tool-call-card", "ai-message"],
    a11y: [
      { keys: "Tab", action: "Approve, Deny, Always allow, and the scrollable preview" },
      { keys: "Screen readers", action: "Risk is read as words; the decision is announced and focus moves to it" },
      { keys: "Color", action: "Risk uses an icon and label as well as a colored edge" },
    ],
    customization: ["risk", "details", "preview", "expiresIn and onExpire", "status (controlled)", "button labels"],
  },
  version: "1.0.0",
  updated: "2026-09-30",
})
