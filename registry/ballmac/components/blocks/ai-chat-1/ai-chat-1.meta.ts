import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "ai-chat-1",
  type: "registry:block",
  title: "AI Chat 1: full chat app pane",
  description:
    "A complete assistant screen: collapsible conversation sidebar, model picker, messages with reasoning and tool calls, streaming replies, copy and regenerate, and a prompt with attachments.",
  category: "blocks",
  blockCategory: "ai-chat",
  tags: ["ai", "chat", "assistant", "agent", "copilot", "app"],
  files: [{ path: "components/blocks/ai-chat-1/ai-chat-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: [
    "shadcn:utils",
    "ai-chat",
    "ai-message",
    "button",
    "prompt-input",
    "reasoning-disclosure",
    "select",
    "streaming-text",
    "tool-call-card",
    "state-view",
    "skeleton",
  ],
  examples: [
    { name: "ai-chat-1-demo", title: "Default", file: "ai-chat-1-demo.tsx" },
    { name: "ai-chat-1-loading", title: "Loading", file: "ai-chat-1-loading.tsx" },
    { name: "ai-chat-1-error", title: "Could not load", file: "ai-chat-1-error.tsx" },
    { name: "ai-chat-1-new-chat", title: "New chat", file: "ai-chat-1-new-chat.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "ai-chat-1-loading", trigger: "state=\"loading\"", note: "The conversation list and prompt stay; the thread shows placeholder messages, announced as loading, and the prompt is disabled." },
    { id: "empty", title: "New chat", example: "ai-chat-1-new-chat", trigger: "state=\"empty\"", note: "A welcome in the thread. emptyState sets the title, description and an action." },
    { id: "error", title: "Could not load", example: "ai-chat-1-error", trigger: "state=\"error\"", note: "The messages stay and a failed-reply row sits where the reply would be, with Try again (onRetry), announced as an alert." },
  ],
  ai: {
    summary:
      "A ready-made chat screen driven entirely by props. Map your chat state (for example the Vercel AI SDK's useChat messages) to `messages`, call your API in `onSubmit`, and pass `streaming` while a reply arrives.",
    whenToUse: ["Assistant, copilot or agent products", "Internal AI tools that need history and model choice"],
    whenNotToUse: ["A small embedded chat widget (compose ai-chat, ai-message and prompt-input instead)"],
    composesWith: ["hero-3", "ai-chat", "prompt-input"],
    customization: [
      "messages: { id, role, text, streaming?, reasoning?, tools? }[]",
      "conversations, activeConversation, onSelectConversation(id | null)",
      "models, model, onModelChange",
      "onSubmit(value, files), onStop, streaming",
      "state: \"ready\" | \"loading\" | \"empty\" | \"error\"; onRetry, emptyState and errorState set the retry action and the copy. loading shows a skeleton thread and disables the prompt; error shows a failed-reply row with Try again (onRetry) under the messages. Pair with useResource for the history"],
  },
  version: "1.1.0",
  updated: "2026-10-11",
  changelog: [
    { version: "1.1.0", date: "2026-10-11", note: "Adds state (loading, empty, error) with onRetry, emptyState and errorState: a skeleton thread while history loads, a welcome when empty, and a failed-reply row with Try again. Unchanged without state." },
    { version: "1.0.0", date: "2026-09-28", note: "First release." },
  ],
})
