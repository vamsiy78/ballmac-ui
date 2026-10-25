import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "memory-panel",
  type: "registry:ui",
  title: "Memory Panel",
  description:
    "What an assistant remembers, in sentences a person can read: grouped, searchable, editable in place, pinnable and forgettable with Undo. A master switch stops replies using memory without deleting it.",
  category: "ai",
  tags: ["ai", "memory", "personalization", "privacy", "settings", "assistant", "chat", "preferences"],
  files: [{ path: "components/memory-panel.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "memory-panel-demo", title: "Six memories in three groups", file: "memory-panel-demo.tsx" },
    { name: "memory-panel-empty", title: "Nothing yet", file: "memory-panel-empty.tsx" },
  ],
  ai: {
    summary:
      "memories is [{ id, text, scope, source?, pinned? }]; scopes is [{ id, label, description? }] (default About you, Your work, Style). The panel keeps its own copy and calls onUpdate(id, text), onForget(id) (after undoMs, default 5000, so Undo works), onPin(id, pinned), onEnabledChange(enabled) and onAdd(text, scope) (adds the form). Handlers may be async; a rejection takes the change back and says why.",
    whenToUse: ["The settings screen where a user manages what an assistant knows about them", "A side panel in a chat that shows which memories a reply used"],
    whenNotToUse: ["Conversation history; use a list of chats", "What a run did; use trace-waterfall"],
    composesWith: ["message-actions", "prompt-library", "ai-chat", "context-window"],
    a11y: [
      { keys: "Switch", action: "role=switch named 'Use memory in replies', with the effect described under it" },
      { keys: "Search", action: "A labelled search box; the list narrows as you type" },
      { keys: "Rows", action: "Pin, Edit and Forget are buttons whose names include the memory text" },
      { keys: "Edit", action: "Enter saves, Shift+Enter adds a line, Escape cancels; focus moves into the box" },
      { keys: "Forget", action: "Shows an Undo button for the whole window; every result is announced and failures are alerts" },
    ],
    customization: ["memories and scopes", "title", "onUpdate, onForget, onPin, onEnabledChange, onAdd", "undoMs"],
  },
  statesNone: "A presentational panel: the memories are passed in, so it has nothing of its own to load. An empty list and a search with no match both say so.",
  version: "1.0.0",
  updated: "2026-10-25",
})
