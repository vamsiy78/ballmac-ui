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
  ],
  examples: [{ name: "ai-chat-1-demo", title: "Default", file: "ai-chat-1-demo.tsx" }],
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
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
