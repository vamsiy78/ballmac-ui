"use client"

import { KnowledgeSources } from "@/components/ballmac/knowledge-sources"

export default function KnowledgeSourcesEmpty() {
  return (
    <div className="w-full max-w-2xl">
      <KnowledgeSources sources={[]} onAdd={() => {}} />
    </div>
  )
}
