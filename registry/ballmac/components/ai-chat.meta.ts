import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "ai-chat",
  type: "registry:ui",
  title: "AI Chat",
  description:
    "The layout for a chat UI: a message log that sticks to the bottom while replies stream unless the reader scrolls up, a jump-to-latest button, an empty state with suggestions and a footer.",
  category: "ai",
  tags: ["ai", "chat", "conversation", "llm", "scroll", "streaming", "layout"],
  files: [{ path: "components/ai-chat.tsx" }],
  dependencies: ["lucide-react", "motion@^12"],
  registryDependencies: ["button", "motion-presets", "shadcn:utils"],
  examples: [
    { name: "ai-chat-demo", title: "Default", file: "ai-chat-demo.tsx" },
    { name: "ai-chat-empty", title: "Empty state with suggestions", file: "ai-chat-empty.tsx" },
  ],
  ai: {
    summary:
      "Layout only: <Chat> (a full-height column) > <ChatMessages> (role=log, auto-scroll) + <ChatFooter>. Put ai-message items inside ChatMessages and a prompt-input inside ChatFooter. It holds no chat state, so any source works (Vercel AI SDK useChat, your own fetch stream).",
    whenToUse: [
      "Building an assistant, support bot or copilot panel from ai-message and prompt-input",
      "Any log that receives streaming content and should follow the newest line unless the reader scrolls up",
      "A first-run screen with suggested prompts (ChatEmpty + ChatSuggestions)",
    ],
    whenNotToUse: [
      "A single one-off AI answer on a page (use ai-message or streaming-text alone)",
      "Terminal-style command output (use terminal)",
    ],
    composesWith: ["ai-message", "prompt-input", "streaming-text", "tool-call-card", "reasoning-disclosure"],
    a11y: [
      { keys: "Tab", action: "Focuses the message log (scroll with arrow keys / Page Up / Page Down), then the jump-to-latest button when shown" },
      { keys: "Enter / Space", action: "On a suggestion, sends it through onSelect" },
      { keys: "—", action: "The log is role=log with aria-live=polite; set aria-busy on ChatMessages while a reply streams to avoid announcing every token" },
    ],
    customization: [
      "Give Chat (or its parent) a height; ChatMessages fills the remaining space and scrolls",
      "contentClassName on ChatMessages and ChatFooter sets the message column width (max-w-3xl by default)",
      "useChatScroll() inside Chat returns { isAtBottom, scrollToBottom } — call scrollToBottom() when the user sends a message",
      "Keep ChatMessages mounted and render ChatEmpty inside it when there are no messages",
      "AI SDK wiring: const { messages, sendMessage, status, stop } = useChat(); render messages in ChatMessages and <PromptInput status={status === 'streaming' || status === 'submitted' ? 'streaming' : 'idle'} onStop={stop} onSubmit={(text) => sendMessage({ text })} /> in ChatFooter",
    ],
  },
  version: "1.0.0",
  updated: "2026-09-28",
})
