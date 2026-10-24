import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "message-actions",
  type: "registry:ui",
  title: "Message Actions",
  description:
    "The small bar under an AI reply: copy, try again, good or bad answer (with reasons), branch, share. A real toolbar with arrow-key movement, spoken results, and choices taken back with the reason when they cannot be saved.",
  category: "ai",
  tags: ["ai", "chat", "message", "toolbar", "feedback", "copy", "regenerate", "thumbs"],
  files: [{ path: "components/message-actions.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "message-actions-demo", title: "Under an AI reply", file: "message-actions-demo.tsx" },
    { name: "message-actions-minimal", title: "Copy only", file: "message-actions-minimal.tsx" },
  ],
  ai: {
    summary:
      "Each button appears only when you give it something to do: text (Copy), onRegenerate, onFeedback(value, reason?) (the thumbs; a thumbs down asks for a reason from reasons, default five, or Skip), onBranch, onShare. defaultFeedback. Handlers may be async; a rejection is shown as an alert and a thumbs choice is taken back. With nothing to do it renders nothing.",
    whenToUse: ["Under every assistant message in a chat or a run", "Collecting quick feedback with a reason on a bad answer"],
    whenNotToUse: ["Actions on a person's own message; use a menu", "A formal rating form; use a form"],
    composesWith: ["ai-chat", "writing-assistant", "thinking-loader", "tool-call-card"],
    a11y: [
      { keys: "Toolbar", action: "role=toolbar with a label; one button is in the tab order and Left, Right, Home and End move between buttons, wrapping at the ends" },
      { keys: "Buttons", action: "Icon buttons with a name and a title; the thumbs have pressed state" },
      { keys: "Results", action: "Copied, the thanks and any error are in one live region; errors are alerts" },
      { keys: "Reasons", action: "A labelled group of buttons after a thumbs down, with Skip" },
    ],
    customization: ["which handlers to give", "reasons", "defaultFeedback"],
  },
  statesNone: "A presentational toolbar: each action reports its own result, so it has nothing of its own to load.",
  version: "1.0.0",
  updated: "2026-10-25",
})
