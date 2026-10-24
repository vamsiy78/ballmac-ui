"use client"

import { ContextWindow } from "@/components/ballmac/context-window"

export default function ContextWindowOver() {
  return (
    <div className="w-full max-w-lg">
      <ContextWindow
        limit={128000}
        onCompact={() => Promise.reject(new Error("The summary model is busy. Nothing was changed."))}
        fullNote="Older messages are already being dropped."
        segments={[
          { id: "sys", label: "System prompt", tokens: 3800 },
          { id: "files", label: "Files in the project", tokens: 84000 },
          { id: "chat", label: "Conversation", tokens: 52000 },
        ]}
      />
    </div>
  )
}
