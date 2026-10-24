import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-15",
  type: "registry:block",
  title: "Agent 15: draft studio",
  description:
    "A drafting studio: pick a saved prompt and fill its blanks, let the agent write a first draft, polish it in place with suggestions you accept or dismiss one by one, and give feedback on the result.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "writing", "draft", "prompts", "editor", "suggestions", "support"],
  files: [{ path: "components/blocks/agent-15/agent-15.tsx" }],
  dependencies: [],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view", "message-actions", "prompt-library", "writing-assistant"],
  examples: [
    { name: "agent-15-demo", title: "Default", file: "agent-15-demo.tsx" },
    { name: "agent-15-fresh", title: "With your own draft", file: "agent-15-fresh.tsx" },
    { name: "agent-15-loading", title: "Loading", file: "agent-15-loading.tsx" },
    { name: "agent-15-empty", title: "No prompts yet", file: "agent-15-empty.tsx" },
    { name: "agent-15-error", title: "Could not load", file: "agent-15-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-15-loading", trigger: "state=\"loading\"", note: "Skeleton prompts and draft under the real heading, announced as loading." },
    { id: "empty", title: "No prompts yet", example: "agent-15-empty", trigger: "state=\"empty\"", note: "Says there are no prompts yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "agent-15-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A draft that fails to write says why and keeps the old one." },
  ],
  ai: {
    summary:
      "Draft studio. <Agent15 title description prompts={LibraryPrompt[]} draft={{ text, suggestions }} onGenerate={(prompt, source) => Promise<{ text, suggestions } | void>} onFeedback={(value, reason?) => Promise} />. Inserting a finished prompt calls onGenerate; the draft and its suggestions are replaced with what it returns, or the old draft stays and the reason is shown if it rejects.",
    whenToUse: ["Writing customer replies or documents from reusable prompts, with a human polish pass", "A place where a model's draft is always reviewed in place"],
    whenNotToUse: ["A long-form editor; use rich-text-editor", "Reviewing many items; use agent-13"],
    composesWith: ["agent-13", "agent-11", "ai-chat-1", "app-shell-1"],
    a11y: [
      { keys: "Steps", action: "Numbered headings 1 and 2 name the two parts; each part is its own labelled region" },
      { keys: "Draft", action: "Marked phrases are buttons with their kind in the name; Accept and Dismiss name the words they affect" },
      { keys: "Results", action: "Drafted from a prompt, accepted suggestions and feedback are announced politely; failures are alerts" },
    ],
    customization: ["prompts", "draft and suggestions", "onGenerate and onFeedback"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
