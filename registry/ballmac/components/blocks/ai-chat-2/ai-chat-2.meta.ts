import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "ai-chat-2",
  type: "registry:block",
  title: "AI Chat 2: conversation with artifact panel",
  description: "A chat that builds things: conversation list, streaming replies, suggestion chips and a side panel with Preview and Code tabs, version history, copy and download. The panel overlays the chat on narrow screens.",
  category: "blocks",
  blockCategory: "ai-chat",
  tags: ["ai chat", "artifact", "assistant", "streaming", "code", "side panel", "versions"],
  files: [{ path: "components/blocks/ai-chat-2/ai-chat-2.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "ai-chat", "ai-message", "artifact-panel", "button", "prompt-input", "streaming-text", "state-view", "skeleton"],
  examples: [{ name: "ai-chat-2-demo", title: "Default", file: "ai-chat-2-demo.tsx" },
    { name: "ai-chat-2-blank", title: "Your own artifact", file: "ai-chat-2-blank.tsx" },
    { name: "ai-chat-2-loading", title: "Loading", file: "ai-chat-2-loading.tsx" },
    { name: "ai-chat-2-error", title: "Could not load", file: "ai-chat-2-error.tsx" },
    { name: "ai-chat-2-new-chat", title: "New chat", file: "ai-chat-2-new-chat.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "ai-chat-2-loading", trigger: "state=\"loading\"", note: "The conversation list and prompt stay; the thread shows placeholder messages, announced as loading, and the prompt is disabled." },
    { id: "empty", title: "New chat", example: "ai-chat-2-new-chat", trigger: "state=\"empty\"", note: "A welcome in the thread. emptyState sets the title, description and an action." },
    { id: "error", title: "Could not load", example: "ai-chat-2-error", trigger: "state=\"error\"", note: "The messages stay and a failed-reply row sits where the reply would be, with Try again (onRetry), announced as an alert." },
  ],
  ai: {
    summary: "An assistant UI that produces artifacts. Pass versions=[{ code, preview, note }], defaultMessages, suggestions and onSend(prompt) returning { reply, artifact? } (the 1-based version the reply moves to). Without onSend a built-in script lets you try the whole flow.",
    whenToUse: ["Assistants that write code, documents or designs", "Anywhere results deserve their own panel with versions"],
    whenNotToUse: ["A plain chat pane (use ai-chat-1)"],
    composesWith: ["app-shell-1", "ai-chat-1", "mail-1"],
    a11y: [
      { keys: "Tab", action: "Chips, the artifact chip in a reply, the panel's tabs and its version arrows are all buttons in reading order" },
      { keys: "Streaming", action: "Replies stream into a live region; the panel shows a progress edge while it writes" },
      { keys: "Esc / Close", action: "The close button returns to the chat on narrow screens" },
    ],
    customization: ["versions, defaultMessages, suggestions, conversations", "artifactTitle, artifactKind, filename, language", "onSend(prompt) async", "state: \"ready\" | \"loading\" | \"empty\" | \"error\"; onRetry, emptyState and errorState set the retry action and the copy. loading shows a skeleton thread and disables the prompt; error shows a failed-reply row with Try again (onRetry) under the messages. Pair with useResource for the history"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (loading, empty, error) with onRetry, emptyState and errorState: a skeleton thread while history loads, a welcome when empty, and a failed-reply row with Try again. Unchanged without state." },
    { version: "1.0.0", date: "2026-10-01", note: "First release." },
  ],
})
