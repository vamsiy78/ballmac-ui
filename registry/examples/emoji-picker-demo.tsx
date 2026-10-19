"use client"

import * as React from "react"

import { EmojiPicker } from "@/components/ballmac/emoji-picker"

export default function EmojiPickerDemo() {
  const [picked, setPicked] = React.useState<string[]>([])
  return (
    <div className="flex flex-col items-center gap-4">
      <EmojiPicker onSelect={(e) => setPicked((p) => [...p, e.emoji].slice(-12))} />
      <p aria-live="polite" className="min-h-8 text-2xl tracking-wide">
        {picked.length ? picked.join(" ") : <span className="text-sm text-muted-foreground">Picked emoji appear here</span>}
      </p>
    </div>
  )
}
