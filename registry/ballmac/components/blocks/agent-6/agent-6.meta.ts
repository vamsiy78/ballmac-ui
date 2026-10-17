import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-6",
  type: "registry:block",
  title: "Agent 6: assistant memory",
  description:
    "What an AI assistant remembers about someone: a ring splitting memory by kind, a switch to pause it, each memory with its source and use count, edited in place, pinned or forgotten with undo, and Forget everything.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "memory", "personalization", "privacy", "assistant", "context", "preferences", "controls"],
  files: [{ path: "components/blocks/agent-6/agent-6.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "blur-fade", "button", "circular-progress", "segmented-control", "skeleton", "state-view", "switch", "textarea"],
  examples: [
    { name: "agent-6-demo", title: "Default", file: "agent-6-demo.tsx" },
    { name: "agent-6-editing", title: "Editing a memory", file: "agent-6-editing.tsx" },
    { name: "agent-6-paused", title: "Memory paused", file: "agent-6-paused.tsx" },
    { name: "agent-6-loading", title: "Loading", file: "agent-6-loading.tsx" },
    { name: "agent-6-empty", title: "Nothing remembered", file: "agent-6-empty.tsx" },
    { name: "agent-6-error", title: "Could not load", file: "agent-6-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-6-loading", trigger: "state=\"loading\"", note: "A skeleton of the summary and memory cards under the real heading." },
    { id: "empty", title: "Nothing remembered", example: "agent-6-empty", trigger: "state=\"empty\" (or memories={[]})", note: "Explains how the assistant learns and that the person decides what stays; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "agent-6-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry)." },
  ],
  ai: {
    summary:
      "A memory control page for an AI assistant. <Agent6 assistantName memories={[{ id, text, scope: 'you' | 'work' | 'preferences', source, learned, uses, pinned }]} capacity activity={{ chats, updated }} paused onPausedChange onEdit={async (id, text) => …} onPin onForget onRestore onForgetAll />. Forgetting calls onForget at once and offers Undo for seven seconds (onRestore); throw from onEdit to keep the old text and show the error.",
    whenToUse: ["Giving people control over what an AI assistant or agent remembers (a trust and privacy requirement in many products)", "A settings page for personalization"],
    whenNotToUse: ["A knowledge base the assistant searches (use sources-list)", "Chat history (use ai-chat-1)"],
    composesWith: ["settings-3", "agent-1", "agent-3", "app-shell-1"],
    a11y: [
      { keys: "Tab to a memory", action: "Pin, Edit and Forget appear (always visible on touch screens); each says what it acts on" },
      { keys: "Ctrl+Enter or Escape in the edit box", action: "Saves or cancels; errors are announced as alerts" },
      { keys: "Forget", action: "An Undo bar appears as a status message; every change is announced politely" },
    ],
    customization: ["assistantName, capacity, activity", "paused + onPausedChange to control the switch; defaultPaused for the first value", "Memories are grouped by scope; write the text the way the assistant would say it"],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
