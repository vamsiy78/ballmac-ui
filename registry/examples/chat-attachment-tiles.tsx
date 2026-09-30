"use client"

import * as React from "react"

import { ChatAttachment, ChatAttachmentList } from "@/components/ballmac/chat-attachment"

// Inline SVG pictures keep the example self-contained.
function picture(a: string, b: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="240" height="240" fill="url(#g)"/><circle cx="170" cy="76" r="30" fill="rgba(255,255,255,.55)"/><path d="M0 200 L70 120 L120 170 L170 110 L240 190 V240 H0Z" fill="rgba(0,0,0,.25)"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const initial = [
  { id: "a", name: "whiteboard.png", size: 1_240_000, type: "image/png", previewUrl: picture("#6366f1", "#22d3ee") },
  { id: "b", name: "sunset.jpg", size: 860_000, type: "image/jpeg", previewUrl: picture("#f97316", "#db2777") },
  { id: "c", name: "wireframe.png", size: 310_000, type: "image/png", previewUrl: picture("#10b981", "#0ea5e9") },
  { id: "d", name: "pitch-deck.pdf", size: 6_100_000, type: "application/pdf" },
]

export default function ChatAttachmentTiles() {
  const [files, setFiles] = React.useState(initial)
  const [opened, setOpened] = React.useState<string | null>(null)
  return (
    <div className="grid w-full max-w-xl gap-3">
      <ChatAttachmentList label="Images in this message">
        {files.map((f) => (
          <ChatAttachment
            key={f.id}
            variant="tile"
            {...f}
            onOpen={() => setOpened(f.name)}
            onRemove={() => setFiles((list) => list.filter((x) => x.id !== f.id))}
          />
        ))}
      </ChatAttachmentList>
      <p className="text-[13px] text-muted-foreground" aria-live="polite">
        {opened ? `Opened ${opened}` : "Select a tile to open it."}
      </p>
    </div>
  )
}
