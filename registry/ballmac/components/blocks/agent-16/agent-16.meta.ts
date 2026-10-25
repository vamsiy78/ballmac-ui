import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-16",
  type: "registry:block",
  title: "Agent 16: answer workspace",
  description:
    "A support-style answer workspace: ask in plain words, watch the assistant work, read an answer where every claim points to its source, and correct or switch off what it remembers about the person.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "chat", "rag", "citations", "sources", "memory", "support", "assistant"],
  files: [{ path: "components/blocks/agent-16/agent-16.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view", "citation", "cited-answer", "memory-panel", "message-actions", "thinking-loader"],
  examples: [
    { name: "agent-16-demo", title: "Default", file: "agent-16-demo.tsx" },
    { name: "agent-16-first", title: "A new conversation", file: "agent-16-first.tsx" },
    { name: "agent-16-loading", title: "Loading", file: "agent-16-loading.tsx" },
    { name: "agent-16-empty", title: "Ask your first question", file: "agent-16-empty.tsx" },
    { name: "agent-16-error", title: "Could not load", file: "agent-16-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-16-loading", trigger: "state=\"loading\"", note: "Skeleton conversation and memory under the real heading, announced as loading." },
    { id: "empty", title: "Ask your first question", example: "agent-16-empty", trigger: "state=\"empty\"", note: "Says to ask a first question; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "agent-16-error", trigger: "state=\"error\"", note: "An alert saying nothing was sent, with Try again (onRetry). A question that fails to answer comes back into the box with the reason." },
  ],
  ai: {
    summary:
      "Answer workspace. <Agent16 title description turns={[{ id, question, answer?: { paragraphs, sources } }]} memories={MemoryItem[]} onAsk={(q) => Promise<{ paragraphs, sources }>} onFeedback={(turnId, value, reason?) => void} onForget={(id) => Promise} />. A turn without an answer shows the thinking loader. Paragraphs cite sources with [1] markers. On a phone the memory panel sits behind a Show memory button. A rejected onAsk removes the pending turn and puts the question back in the box.",
    whenToUse: ["A customer-facing or internal assistant that answers from a knowledge base", "Any chat where trust depends on seeing sources"],
    whenNotToUse: ["A chat with no sources; use ai-chat-1", "Watching a long agent run; use agent-11"],
    composesWith: ["agent-18", "agent-11", "ai-chat-1", "app-shell-1"],
    a11y: [
      { keys: "Conversation", action: "An ordered list of turns; the question and the answer are separate; the working state is announced once" },
      { keys: "Composer", action: "A labelled box; Enter sends, Shift+Enter adds a line; Send is a button with a name" },
      { keys: "Citations", action: "Numbers are buttons named for their source; sources are in a list with links" },
      { keys: "Memory", action: "A switch and buttons with names that include the memory; on phones a disclosure button with aria-expanded" },
    ],
    customization: ["title and description", "turns and memories", "onAsk, onFeedback, onForget"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
