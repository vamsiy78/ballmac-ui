"use client"

import * as React from "react"

import { MatchHighlight, matchesAll } from "@/components/ballmac/match-highlight"

const items = ["Reset your password", "Download invoices and receipts", "Create and rotate an API key", "Invite teammates and set their role", "Turn on two-step sign-in", "Connect your chat workspace"]

export default function MatchHighlightLive() {
  const [query, setQuery] = React.useState("in")
  const shown = items.filter((i) => matchesAll(i, query))
  return (
    <div className="grid w-full max-w-sm gap-3">
      <label className="grid gap-1.5 text-sm font-medium">
        Filter
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border px-3 text-sm font-normal outline-none focus-visible:ring-[3px]" />
      </label>
      <ul className="grid gap-1 text-sm">
        {shown.map((i) => (
          <li key={i} className="rounded-md border px-3 py-2">
            <MatchHighlight text={i} query={query} />
          </li>
        ))}
        {!shown.length ? <li className="text-muted-foreground px-1 text-sm">Nothing matches.</li> : null}
      </ul>
    </div>
  )
}
