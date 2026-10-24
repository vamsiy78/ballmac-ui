"use client"

import { ContextWindow } from "@/components/ballmac/context-window"

export default function ContextWindowDemo() {
  return (
    <div className="w-full max-w-lg">
      <ContextWindow
        limit={200000}
        reserved={16000}
        fullNote="When it fills, the oldest messages are dropped first. Compact summarises them so nothing important is lost."
        onCompact={() => new Promise((resolve) => setTimeout(resolve, 800))}
        segments={[
          { id: "sys", label: "System prompt", tokens: 3800 },
          { id: "tools", label: "Tools and their schemas", tokens: 14200 },
          { id: "files", label: "Files in the project", tokens: 62000 },
          { id: "chat", label: "Conversation", tokens: 38000 },
        ]}
      />
    </div>
  )
}
