import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "escalation-card",
  type: "registry:ui",
  title: "Escalation Card",
  description:
    "The moment an AI agent hands a conversation to a person: who is waiting and for how long, why, how the customer seems to feel in words, what the agent understood, the last messages, an editable suggested reply, and Take over and Snooze.",
  category: "ai",
  tags: ["ai", "agents", "support", "handoff", "escalation", "human in the loop", "inbox", "customer service"],
  files: [{ path: "components/escalation-card.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "escalation-card-demo", title: "A frustrated customer", file: "escalation-card-demo.tsx" },
    { name: "escalation-card-simple", title: "No suggested reply", file: "escalation-card-simple.tsx" },
  ],
  ai: {
    summary:
      "Optional waitedMinutes and slaMinutes show a time-to-reply meter. customer, channel, reason (required); sentiment calm | frustrated | angry | unknown, waiting, summary string[], messages [{ from: 'customer' | 'agent', text, time? }], suggestedReply (editable). onTakeOver, onSnooze and onSendReply(reply) may return promises; each reports success in words and shows a failure as an alert.",
    whenToUse: ["Showing a person a conversation an agent could not finish, with context and a head start", "An inbox row that needs a human decision"],
    whenNotToUse: ["Approving a tool call; use approval-card", "The packet passed between two agents; use handoff-card"],
    composesWith: ["handoff-card", "approval-card", "agent-roster", "ai-chat"],
    a11y: [
      { keys: "Screen readers", action: "An article named by the customer; how they seem to feel is read as a word ('Seems frustrated'); results are a polite live region and failures an alert" },
      { keys: "Tab", action: "The suggested reply, then Snooze, Send reply and Take over" },
      { keys: "Sentiment", action: "Always a word in a pill; red only reinforces 'Angry'" },
    ],
    customization: ["sentiment and waiting", "summary and messages", "suggestedReply and onSendReply", "onTakeOver and onSnooze"],
  },
  statesNone: "A presentational card with its own actions: the conversation is passed in, so it has nothing of its own to load, and failures are reported on the card.",
  version: "1.1.0",
  updated: "2026-10-25",
  changelog: [
    { version: "1.1.0", date: "2026-10-25", note: "A time-to-reply meter that turns red as the wait nears the target and says how long is left, or how late it is. New props: waitedMinutes, slaMinutes." },
    { version: "1.0.0", date: "2026-10-24", note: "First release." },
  ],
})
