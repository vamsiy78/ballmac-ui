// Ballmac UI: Agent 13. https://ui.ballmac.com/blocks/agent-13
"use client"

import * as React from "react"

import { ReviewCenter, type ReviewItem } from "@/components/ballmac/review-center"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Agent13Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    items?: ReviewItem[]
    /** Called to approve an item. Reject and the decision is taken back with the message. */
    onApprove?: (id: string) => void | Promise<void>
    /** Called to send an item back with a comment. Reject and the decision is taken back with the message. */
    onRequestChanges?: (id: string, comment: string) => void | Promise<void>
  }

function Diff({ lines }: { lines: [" " | "+" | "-", string][] }) {
  return (
    <div dir="ltr" className="grid gap-px overflow-hidden rounded-md border bg-border font-mono text-xs">
      {lines.map(([kind, text], i) => (
        <p key={i} className={cn("px-3 py-1", kind === "+" ? "bg-chart-2/10" : kind === "-" ? "bg-destructive/10" : "bg-card text-muted-foreground")}>
          <span aria-hidden="true" className="me-2 select-none">{kind === " " ? " " : kind}</span>
          <span className="sr-only">{kind === "+" ? "Added: " : kind === "-" ? "Removed: " : ""}</span>
          {text}
        </p>
      ))}
    </div>
  )
}

const sample: ReviewItem[] = [
  { id: "1", title: "Release notes for version 2.4", agent: "Writer agent", meta: "Changelog, 240 words", confidence: 0.91, status: "pending", summary: "Eight changes grouped into New, Improved and Fixed, written from the merged pull requests.", preview: <Diff lines={[[" ", "### New"], ["+", "- Export any report as a PDF from the share menu."], ["+", "- Filters now remember your last choice."], [" ", "### Fixed"], ["-", "- Fixed a bug."], ["+", "- Fixed totals rounding on invoices over $10,000."]]} /> },
  { id: "2", title: "Refund of $340.00 to Maria Lopez", agent: "Payments agent", meta: "Order A-9914", confidence: 0.48, status: "pending", summary: "The order arrived damaged twice. The amount is above the $250 an agent may approve alone, and the policy allows it.", preview: <Diff lines={[[" ", "order      A-9914"], [" ", "reason     damaged on arrival (twice)"], ["+", "refund     $340.00 to the original card"], ["-", "replacement  not sent"]]} /> },
  { id: "3", title: "Reply to the press enquiry from The Daily Ledger", agent: "Support agent", meta: "Email draft", confidence: 0.77, status: "pending", summary: "A short holding reply that promises an answer by Friday and names no figures." },
  { id: "4", title: "Change the free plan's export limit to 50 rows", agent: "Pricing agent", meta: "Config change", confidence: 0.64, status: "pending", summary: "Lowers the free export limit from 100 to 50 rows, as agreed in the pricing thread.", preview: <Diff lines={[[" ", "plans.free.export_rows"], ["-", "  100"], ["+", "  50"]]} /> },
  { id: "5", title: "Weekly usage report for the leadership team", agent: "Analyst agent", meta: "Report, 2 pages", confidence: 0.95, status: "approved", summary: "Usage is up 12% week on week, driven by the new import flow." },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-px overflow-hidden rounded-xl border md:grid-cols-[17rem_1fr]">
      <div className="grid gap-px">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-none" />)}</div>
      <div className="grid content-start gap-4 p-5">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-14" />
        <Skeleton className="h-32" />
        <Skeleton className="h-9 w-48 rounded-full" />
      </div>
    </div>
  )
}

/**
 * A review desk for the work agents produce: one place to go through drafts, decisions and changes quickly, with the keyboard. It adds nothing between the person and
 * the work: pick an item, read what it did and what it changed, approve it or send it back with a reason, and the desk moves on to the next one waiting.
 */
function Agent13({ title = "Review desk", description = "Everything your agents made that needs a person to look at it before it goes out.", items = sample, onApprove, onRequestChanges, state = "ready", onRetry, emptyState, errorState, className, ...props }: Agent13Props) {
  const id = React.useId()
  const view = state === "ready" && items.length === 0 ? "empty" : state
  return (
    <section data-slot="agent-13" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the items to review" loading={<Skel />} empty={{ title: "Nothing to review", description: "When an agent makes something that needs a person, it appears here.", ...emptyState }} error={{ title: "The items could not be loaded", description: "Nothing was approved or sent back. Check your connection and try again.", ...errorState }}>
        <ReviewCenter items={items} title="To review" onApprove={onApprove} onRequestChanges={onRequestChanges} />
      </StateView>
    </section>
  )
}

export { Agent13, type Agent13Props }
