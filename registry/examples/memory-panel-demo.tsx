"use client"

import { MemoryPanel, type MemoryItem } from "@/components/ballmac/memory-panel"

const memories: MemoryItem[] = [
  { id: "1", scope: "you", text: "Is the founder of a two-person design studio in Lisbon.", source: "Chat on Oct 3", pinned: true },
  { id: "2", scope: "you", text: "Prefers metric units and 24-hour times.", source: "Said in settings" },
  { id: "3", scope: "work", text: "Is migrating the client portal from Pages Router to the App Router.", source: "Chat on Oct 19" },
  { id: "4", scope: "work", text: "Deploys on Cloudflare Workers, not Vercel.", source: "Chat on Oct 21" },
  { id: "5", scope: "style", text: "Wants short answers with the code first and the explanation after.", source: "Chat on Sep 28", pinned: true },
  { id: "6", scope: "style", text: "Dislikes emoji in replies.", source: "Chat on Oct 8" },
]

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 450))

export default function MemoryPanelDemo() {
  return (
    <div className="w-full max-w-lg">
      <MemoryPanel memories={memories} onUpdate={wait} onForget={wait} onPin={wait} onEnabledChange={wait} onAdd={async () => { await wait() }} />
    </div>
  )
}
