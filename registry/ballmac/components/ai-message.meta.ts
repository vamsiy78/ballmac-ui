import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "ai-message",
  type: "registry:ui",
  title: "AI Message",
  description:
    "A chat message with user, assistant and system roles: right-aligned user bubbles, full-width assistant prose, an avatar slot, hover-revealed actions and a hydration-safe timestamp.",
  category: "ai",
  tags: ["ai", "chat", "message", "llm", "assistant", "copy"],
  files: [{ path: "components/ai-message.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["button", "shadcn:utils", "i18n"],
  examples: [
    { name: "ai-message-demo", title: "Default", file: "ai-message-demo.tsx" },
    { name: "ai-message-actions", title: "With actions", file: "ai-message-actions.tsx" },
  ],
  ai: {
    summary:
      "Render one chat turn. <Message role> wraps <MessageAvatar>, <MessageContent>, <MessageActions> (with <MessageAction label> and <MessageCopyAction value>) and <MessageTimestamp date>. It takes plain children, so it works with the Vercel AI SDK, LangChain or any stream.",
    whenToUse: [
      "Rendering each turn of an assistant or chatbot conversation",
      "Showing copy, regenerate and feedback buttons under an assistant reply",
      "A system note inside a conversation, such as 'Model switched to a smaller context window'",
    ],
    whenNotToUse: [
      "The scrolling conversation layout itself (use ai-chat and put messages inside ChatMessages)",
      "Threaded comments or email-style lists where both sides look alike",
    ],
    composesWith: ["ai-chat", "prompt-input", "streaming-text", "tool-call-card", "reasoning-disclosure", "code-block"],
    a11y: [
      { keys: "Tab", action: "Moves through the action buttons; focusing any of them reveals the action row" },
      { keys: "Enter / Space", action: "Runs the focused action" },
    ],
    customization: [
      "role: user | assistant | system (sets alignment and bubble styling through context)",
      "MessageActions visibility: hover (default; always visible on touch devices) | always",
      "MessageAction requires a label (used as aria-label and title); pass aria-pressed for thumbs up/down",
      "MessageTimestamp formats with locale (en-US default) and timeZone; without timeZone it formats after hydration in the viewer's zone, or pass preformatted children",
      "Render markdown yourself inside MessageContent; it styles lists, code and spacing lightly",
      "AI SDK: messages.map(m => <Message key={m.id} role={m.role}><MessageContent>{m.parts.map(p => p.type === 'text' ? p.text : null)}</MessageContent></Message>)",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
