import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "chat-1",
  type: "registry:block",
  title: "Chat 1: team chat with threads",
  description:
    "A team chat: channels and direct messages with unread counts and presence, messages grouped by person and day with a New divider, reactions, threads, @mentions that suggest people, and Retry when a message fails to send.",
  category: "blocks",
  blockCategory: "chat",
  tags: ["chat", "team chat", "messaging", "channels", "threads", "reactions", "mentions", "slack", "realtime", "collaboration"],
  files: [{ path: "components/blocks/chat-1/chat-1.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "avatar", "button", "skeleton", "state-view"],
  examples: [
    { name: "chat-1-demo", title: "Default", file: "chat-1-demo.tsx" },
    { name: "chat-1-thread", title: "Thread open", file: "chat-1-thread.tsx" },
    { name: "chat-1-loading", title: "Loading", file: "chat-1-loading.tsx" },
    { name: "chat-1-empty", title: "New channel", file: "chat-1-empty.tsx" },
    { name: "chat-1-error", title: "Could not load", file: "chat-1-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "chat-1-loading", trigger: "state=\"loading\"", note: "Skeleton messages while the channel loads; the sidebar and composer stay usable." },
    { id: "empty", title: "New channel", example: "chat-1-empty", trigger: "state=\"empty\" (or a channel with no messages)", note: "\"This is the start of #channel\" with a prompt to say hello; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "chat-1-error", trigger: "state=\"error\"", note: "An alert with Try again (onRetry). A single message that fails to send shows Not sent and Retry instead." },
  ],
  ai: {
    summary:
      "A Slack-style team chat. <Chat1 people={[{ id, name, status }]} meId channels={[{ id, name, kind: 'channel' | 'dm', private, topic, unread, personId }]} messages={{ [channelId]: [{ id, authorId, text, day, time, reactions, replies }] }} firstUnread={{ [channelId]: messageId }} onSend={async ({ channelId, text, threadId }) => …} onReact onChannelChange />. Messages appear straight away while sending; throw from onSend to mark one Not sent with Retry.",
    whenToUse: ["Team or community messaging inside a product", "Customer conversations with internal threads"],
    whenNotToUse: ["Talking to an AI assistant (use ai-chat-1 or ai-chat-2)", "Email-style threads (use mail-1)"],
    composesWith: ["app-shell-1", "settings-2", "agent-2"],
    a11y: [
      { keys: "Enter / Shift+Enter in the composer", action: "Sends / adds a line" },
      { keys: "@ then Up / Down and Enter or Tab", action: "Suggests people and inserts the mention (a combobox)" },
      { keys: "Tab into a message", action: "Shows Add a reaction and Reply in thread; reactions are toggle buttons with their count" },
      { keys: "Messages", action: "A log region named after the channel, with day and New separators" },
    ],
    customization: ["Wire onSend to your realtime backend and pass new messages back through messages", "Below 768 px the sidebar becomes a channel select and threads open over the conversation"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
