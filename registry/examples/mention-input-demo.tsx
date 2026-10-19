"use client"

import * as React from "react"

import { MentionInput, type MentionSource, type MentionValue } from "@/components/ballmac/mention-input"

const people = [
  { id: "u1", label: "Maya Chen", description: "Design" },
  { id: "u2", label: "Jonas Weber", description: "Engineering" },
  { id: "u3", label: "Priya Nair", description: "Product" },
  { id: "u4", label: "Omar Haddad", description: "Support" },
  { id: "u5", label: "Layla Aziz", description: "Localization" },
]
const channels = [
  { id: "c1", label: "launch", description: "Release planning" },
  { id: "c2", label: "design-crit", description: "Weekly critique" },
  { id: "c3", label: "support", description: "Customer questions" },
]

const sources: MentionSource[] = [
  { trigger: "@", label: "People", options: people },
  { trigger: "#", label: "Channels", options: channels },
]

export default function MentionInputDemo() {
  const [value, setValue] = React.useState<MentionValue>({ text: "", mentions: [] })
  return (
    <div className="w-full max-w-md space-y-2">
      <MentionInput aria-label="Message" placeholder="Write a message. Type @ for people or # for channels." sources={sources} value={value} onValueChange={setValue} />
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {value.mentions.length ? `Mentions: ${value.mentions.map((m) => m.trigger + m.label).join(", ")}` : "No mentions yet"}
      </p>
    </div>
  )
}
