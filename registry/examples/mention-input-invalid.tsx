"use client"

import * as React from "react"

import { MentionInput, type MentionSource, type MentionValue } from "@/components/ballmac/mention-input"

const sources: MentionSource[] = [{ trigger: "@", label: "People", options: [{ id: "u1", label: "Maya Chen" }, { id: "u2", label: "Jonas Weber", disabled: true, description: "Out of office" }, { id: "u3", label: "Priya Nair" }] }]

export default function MentionInputInvalid() {
  const [value, setValue] = React.useState<MentionValue>({ text: "", mentions: [] })
  const missing = value.text.trim() !== "" && value.mentions.length === 0
  return (
    <div className="w-full max-w-md space-y-1.5">
      <MentionInput aria-label="Assign to" aria-describedby="assign-help" invalid={missing} minRows={2} placeholder="Mention the person who should pick this up" sources={sources} value={value} onValueChange={setValue} />
      <p id="assign-help" className={missing ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
        {missing ? "Mention one person with @ so they are notified." : "Jonas is away and cannot be chosen."}
      </p>
    </div>
  )
}
