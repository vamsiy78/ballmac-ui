"use client"

import { ContextWindow } from "@/components/ballmac/context-window"

export default function ContextWindowNearly() {
  return (
    <div className="w-full max-w-lg">
      <ContextWindow
        limit={200000}
        reserved={16000}
        onCompact={() => new Promise((resolve) => setTimeout(resolve, 800))}
        fullNote="Compact now, or the next long file will push the start of the task out."
        segments={[
          { id: "sys", label: "System prompt", tokens: 3800 },
          { id: "tools", label: "Tools and their schemas", tokens: 14200 },
          { id: "files", label: "Files in the project", tokens: 98000 },
          { id: "chat", label: "Conversation", tokens: 52000 },
        ]}
      />
    </div>
  )
}
