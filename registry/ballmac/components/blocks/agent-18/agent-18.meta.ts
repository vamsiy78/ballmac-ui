import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-18",
  type: "registry:block",
  title: "Agent 18: knowledge base",
  description:
    "A knowledge base admin: the sources an assistant reads with their health, document counts and a switch for each, live sync with Retry, and a box to test a question and see which sources the answer comes from.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "rag", "knowledge base", "sources", "sync", "settings", "citations"],
  files: [{ path: "components/blocks/agent-18/agent-18.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "skeleton", "state-view", "citation", "cited-answer", "knowledge-sources"],
  examples: [
    { name: "agent-18-demo", title: "Default", file: "agent-18-demo.tsx" },
    { name: "agent-18-healthy", title: "All healthy", file: "agent-18-healthy.tsx" },
    { name: "agent-18-loading", title: "Loading", file: "agent-18-loading.tsx" },
    { name: "agent-18-empty", title: "No sources yet", file: "agent-18-empty.tsx" },
    { name: "agent-18-error", title: "Could not load", file: "agent-18-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-18-loading", trigger: "state=\"loading\"", note: "Skeleton sources and test box under the real heading, announced as loading." },
    { id: "empty", title: "No sources yet", example: "agent-18-empty", trigger: "state=\"empty\"", note: "Says there are no sources yet; emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "agent-18-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A sync, switch or remove that fails says why and changes nothing." },
  ],
  ai: {
    summary:
      "Knowledge base. <Agent18 title description sources={KnowledgeSource[]} onAdd onSync onToggle onRemove onTest={(q) => Promise<{ paragraphs, sources }>} />. The test box asks a question and shows the answer with its sources, so a person can turn a source off and ask again to see what it contributed. A rejected onTest shows the reason.",
    whenToUse: ["The settings page of an AI product that answers from customer data", "Checking which sources an answer comes from before launch"],
    whenNotToUse: ["A chat for end users; use agent-16", "Browsing documents; use a file table"],
    composesWith: ["agent-16", "agent-12", "settings-1", "app-shell-1"],
    a11y: [
      { keys: "Sources", action: "Each source has a switch named for it; status is in words; actions name the source; Remove asks first with focus on Keep it" },
      { keys: "Test", action: "A labelled box and a button; the answer is a normal region with numbered source buttons" },
      { keys: "Results", action: "Announced politely; failures are alerts" },
    ],
    customization: ["title and description", "sources", "onAdd, onSync, onToggle, onRemove, onTest"],
  },
  version: "1.0.0",
  updated: "2026-10-24",
})
