"use client"

import * as React from "react"

import { ReviewCenter, type ReviewItem } from "@/components/ballmac/review-center"

function Diff({ lines }: { lines: [string, string][] }) {
  return (
    <div dir="ltr" className="grid gap-px overflow-hidden rounded-md border bg-border font-mono text-xs">
      {lines.map(([kind, text], i) => (
        <p key={i} className={kind === "+" ? "bg-chart-2/10 px-3 py-1" : kind === "-" ? "bg-destructive/10 px-3 py-1" : "bg-card px-3 py-1 text-muted-foreground"}>
          <span aria-hidden="true" className="me-2 select-none">{kind === " " ? " " : kind}</span>
          <span className="sr-only">{kind === "+" ? "Added: " : kind === "-" ? "Removed: " : ""}</span>
          {text}
        </p>
      ))}
    </div>
  )
}

const items: ReviewItem[] = [
  { id: "1", title: "Release notes for version 2.4", agent: "Writer agent", meta: "Changelog, 240 words", confidence: 0.91, status: "pending", summary: "Eight changes grouped into New, Improved and Fixed, written from the merged pull requests.", preview: <Diff lines={[[" ", "### New"], ["+", "- Export any report as a PDF from the share menu."], ["+", "- Filters now remember your last choice."], [" ", "### Fixed"], ["-", "- Fixed a bug."], ["+", "- Fixed totals rounding on invoices over $10,000."]]} /> },
  { id: "2", title: "Refund of $340.00 to Maria Lopez", agent: "Payments agent", meta: "Order A-9914", confidence: 0.48, status: "pending", summary: "The order arrived damaged twice. The amount is above the $250 an agent may approve alone, and the policy allows it.", preview: <Diff lines={[[" ", "order      A-9914"], [" ", "reason     damaged on arrival (twice)"], ["+", "refund     $340.00 to the original card"], ["-", "replacement  not sent"]]} /> },
  { id: "3", title: "Reply to the press enquiry from The Daily Ledger", agent: "Support agent", meta: "Email draft", confidence: 0.77, status: "pending", summary: "A short holding reply that promises an answer by Friday and names no figures." },
  { id: "4", title: "Weekly usage report for the leadership team", agent: "Analyst agent", meta: "Report, 2 pages", confidence: 0.95, status: "approved", summary: "Usage is up 12% week on week, driven by the new import flow." },
]

export default function ReviewCenterDemo() {
  return (
    <div className="w-full max-w-4xl">
      <ReviewCenter
        items={items}
        title="Review desk"
        onApprove={() => new Promise((resolve) => setTimeout(resolve, 400))}
        onRequestChanges={() => new Promise((resolve) => setTimeout(resolve, 400))}
      />
    </div>
  )
}
