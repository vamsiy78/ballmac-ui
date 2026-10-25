import { defineItem } from "@ballmac-ui/metadata"

export default defineItem({
  name: "knowledge-sources",
  type: "registry:ui",
  title: "Knowledge Sources",
  description:
    "The places an assistant reads from: each source's kind, document count and freshness, a switch for whether answers may use it, live sync progress, a failed sync with the reason and Retry, and Remove that asks first.",
  category: "ai",
  tags: ["ai", "rag", "knowledge base", "sources", "sync", "connectors", "settings", "indexing"],
  files: [{ path: "components/knowledge-sources.tsx" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["shadcn:utils", "i18n"],
  examples: [
    { name: "knowledge-sources-demo", title: "Five sources in different states", file: "knowledge-sources-demo.tsx" },
    { name: "knowledge-sources-empty", title: "No sources yet", file: "knowledge-sources-empty.tsx" },
  ],
  ai: {
    summary:
      "sources is [{ id, name, kind 'drive'|'notion'|'github'|'web'|'slack'|'files'|'database'|string, detail?, status 'synced'|'syncing'|'error'|'paused', docs, lastSync?, error?, progress? 0-1, included }]. The component keeps its own copy and calls onSync(id), onToggle(id, included), onRemove(id) and onAdd(). Handlers may be async; a rejected sync shows the error with Retry, a rejected toggle or remove puts things back and says why. The header sums only the documents in use.",
    whenToUse: ["The settings page where a team connects what an assistant can read", "Showing the health of a search or RAG index"],
    whenNotToUse: ["Browsing the documents themselves; use a file table", "Choosing a model; use model-picker"],
    composesWith: ["cited-answer", "sources-list", "memory-panel", "guardrail-feed"],
    a11y: [
      { keys: "Switch", action: "Each source has a role=switch named 'Use <name> in answers'" },
      { keys: "Status", action: "Said in words with an icon, never by color alone; progress is also text" },
      { keys: "Actions", action: "Sync and Retry buttons name the source; Remove opens a confirmation group with focus on Keep it" },
      { keys: "Results", action: "Announced politely; failures are alerts" },
    ],
    customization: ["sources", "title", "onAdd, onSync, onToggle, onRemove"],
  },
  statesNone: "A presentational list: the sources are passed in, so it has nothing of its own to load. An empty list says so.",
  version: "1.0.0",
  updated: "2026-10-25",
})
