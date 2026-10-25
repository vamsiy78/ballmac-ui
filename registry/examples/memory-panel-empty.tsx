"use client"

import { MemoryPanel } from "@/components/ballmac/memory-panel"

export default function MemoryPanelEmpty() {
  return (
    <div className="w-full max-w-lg">
      <MemoryPanel memories={[]} onAdd={() => {}} />
    </div>
  )
}
