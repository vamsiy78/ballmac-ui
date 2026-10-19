"use client"

import * as React from "react"

import { MentionInput, mentionsToMarkup, type MentionSource, type MentionValue } from "@/components/ballmac/mention-input"

const sources: MentionSource[] = [
  {
    trigger: "#",
    label: "Tags",
    options: [
      { id: "t1", label: "billing" },
      { id: "t2", label: "bug" },
      { id: "t3", label: "feature-request" },
      { id: "t4", label: "urgent" },
      { id: "t5", label: "docs" },
    ],
  },
]

export default function MentionInputSingle() {
  const [value, setValue] = React.useState<MentionValue>({ text: "Login fails after the reset email #", mentions: [] })
  const [sent, setSent] = React.useState("")
  return (
    <div className="w-full max-w-md space-y-2">
      <MentionInput singleLine aria-label="Ticket title" sources={sources} value={value} onValueChange={setValue} onSubmit={(v) => setSent(mentionsToMarkup(v))} />
      <p className="text-xs text-muted-foreground">Press Enter to send. {sent ? <code className="font-mono">{sent}</code> : "Tags are kept with the ticket."}</p>
    </div>
  )
}
