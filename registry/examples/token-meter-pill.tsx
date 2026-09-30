"use client"

import * as React from "react"

import { TokenMeterPill, estimateTokens } from "@/components/ballmac/token-meter"

export default function TokenMeterPillExample() {
  const [draft, setDraft] = React.useState("")
  const typed = estimateTokens(draft)
  return (
    <div className="flex h-[22rem] w-full max-w-lg flex-col justify-end">
      <div className="rounded-2xl border bg-card p-3 shadow-xs">
        <textarea
          aria-label="Message"
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type to watch the context fill…"
          className="w-full resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-1 flex items-center justify-end">
          <TokenMeterPill
            limit={8_000}
            segments={[
              { label: "System prompt", tokens: 600 },
              { label: "Conversation", tokens: 5_400 },
              { label: "This message", tokens: typed },
              { label: "Room for the reply", tokens: 1_000, reserved: true },
            ]}
            cost="$0.03"
          />
        </div>
      </div>
    </div>
  )
}
