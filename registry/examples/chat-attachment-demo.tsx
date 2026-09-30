"use client"

import * as React from "react"

import { ChatAttachment, ChatAttachmentList } from "@/components/ballmac/chat-attachment"

type File = { id: string; name: string; size: number; type?: string; status?: "ready" | "uploading" | "error"; progress?: number; error?: string }

const initial: File[] = [
  { id: "1", name: "Q3-revenue-report.pdf", size: 2_483_200, type: "application/pdf" },
  { id: "2", name: "customers-export.csv", size: 184_320, status: "uploading", progress: 62 },
  { id: "3", name: "migration-notes.md", size: 9_830 },
  { id: "4", name: "design-assets.zip", size: 88_400_000, status: "error", error: "File is too large" },
]

export default function ChatAttachmentDemo() {
  const [files, setFiles] = React.useState(initial)
  return (
    <div className="w-full max-w-xl rounded-2xl border bg-card p-3 shadow-xs">
      <ChatAttachmentList>
        {files.map((f) => (
          <ChatAttachment
            key={f.id}
            {...f}
            onRemove={() => setFiles((list) => list.filter((x) => x.id !== f.id))}
            onRetry={() => setFiles((list) => list.map((x) => (x.id === f.id ? { ...x, status: "uploading", progress: 10 } : x)))}
          />
        ))}
      </ChatAttachmentList>
      {files.length === 0 && <p className="px-1 py-2 text-sm text-muted-foreground">No files attached.</p>}
    </div>
  )
}
