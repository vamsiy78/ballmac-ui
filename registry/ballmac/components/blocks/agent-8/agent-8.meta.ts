import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "agent-8",
  type: "registry:block",
  title: "Agent 8: knowledge manager",
  description:
    "A knowledge manager for an AI agent: a health bar across its sources, each source with sync progress or failure and a retry, a switch for whether the agent may use it, and a panel showing which passages come back for a question.",
  category: "blocks",
  blockCategory: "agents",
  tags: ["ai", "agent", "knowledge", "rag", "sources", "retrieval", "documents", "sync", "training data", "knowledge base"],
  files: [{ path: "components/blocks/agent-8/agent-8.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "alert-dialog", "badge", "blur-fade", "button", "dropdown-menu", "match-highlight", "skeleton", "state-view", "switch"],
  examples: [
    { name: "agent-8-demo", title: "Default, with a test run", file: "agent-8-demo.tsx" },
    { name: "agent-8-no-match", title: "A question nothing covers", file: "agent-8-no-match.tsx" },
    { name: "agent-8-empty", title: "No sources yet", file: "agent-8-empty.tsx" },
    { name: "agent-8-loading", title: "Loading", file: "agent-8-loading.tsx" },
    { name: "agent-8-error", title: "Could not load", file: "agent-8-error.tsx" },
  ],
  states: [
    { id: "loading", title: "Loading", example: "agent-8-loading", trigger: "state=\"loading\"", note: "A skeleton of the summary, the source cards and the test panel under the real heading." },
    { id: "empty", title: "No sources yet", example: "agent-8-empty", trigger: "state=\"empty\" (or sources={[]})", note: "Explains what knowledge is and offers the three ways to add it as large buttons (website, files, pasted text); emptyState sets the copy." },
    { id: "error", title: "Could not load", example: "agent-8-error", trigger: "state=\"error\"", note: "An alert saying nothing was changed, with Try again (onRetry). A single source that fails to sync shows its reason and Retry on its own card." },
  ],
  ai: {
    summary:
      "An agent knowledge page. <Agent8 sources={[{ id, name, kind: 'website' | 'file' | 'text', location, status: 'ready' | 'syncing' | 'failed', progress, passages, synced, error, enabled, excerpts }]} onAdd={(kind) => …} onResync onRemove onToggle onAsk={async (question, sources) => ({ passages: [{ sourceId, text, score }], answer })} defaultQuestion />. The test panel shows retrieval, not a generated answer; onAsk returns your vector search's top passages. Without onAsk it searches each source's excerpts.",
    whenToUse: ["Managing what a support, docs or internal agent may read (RAG sources)", "Checking that a question is covered before shipping an agent"],
    whenNotToUse: ["Showing the sources an answer used (use sources-list and citation)", "Configuring tools and instructions (use agent-7)"],
    composesWith: ["agent-7", "agent-6", "agent-3", "app-shell-1"],
    a11y: [
      { keys: "Tab", action: "Each source has a switch named for it, a retry or sync button and a remove button; failures are announced as alerts" },
      { keys: "Remove", action: "Asks for confirmation in an alert dialog first" },
      { keys: "Test", action: "Results are a polite live region marked busy while searching; matches are real mark elements and scores are also written as text" },
    ],
    customization: [
      "title, exampleQuestions, defaultQuestion (runs once at the start)",
      "progress (0 to 1) drives the bar of a syncing source",
      "onAsk gets the enabled, ready sources; return passages with a score from 0 to 1 and, if you have one, an answer",
    ],
  },
  version: "1.0.0",
  updated: "2026-10-17",
})
