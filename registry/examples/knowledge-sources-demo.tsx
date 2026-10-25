"use client"

import { KnowledgeSources, type KnowledgeSource } from "@/components/ballmac/knowledge-sources"

const sources: KnowledgeSource[] = [
  { id: "1", name: "Product docs", kind: "notion", detail: "Workspace: Acme", status: "synced", docs: 1284, lastSync: "12 minutes ago", included: true },
  { id: "2", name: "Support macros", kind: "drive", detail: "Shared drive / Support / Macros", status: "syncing", docs: 342, progress: 0.62, included: true },
  { id: "3", name: "ui.acme.com", kind: "web", detail: "Crawled weekly, 3 levels deep", status: "synced", docs: 96, lastSync: "Yesterday", included: true },
  { id: "4", name: "acme/platform", kind: "github", detail: "README and /docs on main", status: "error", docs: 58, lastSync: "3 days ago", error: "The access token expired. Reconnect GitHub and sync again.", included: true },
  { id: "5", name: "#help-questions", kind: "slack", detail: "Last 90 days", status: "paused", docs: 2210, lastSync: "Oct 2", included: false },
]

const wait = (ms = 900) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export default function KnowledgeSourcesDemo() {
  return (
    <div className="w-full max-w-3xl">
      <KnowledgeSources sources={sources} onAdd={() => {}} onSync={() => wait(1200)} onToggle={() => wait(300)} onRemove={() => wait(500)} />
    </div>
  )
}
