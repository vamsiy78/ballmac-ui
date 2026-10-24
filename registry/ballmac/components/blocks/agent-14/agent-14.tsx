// Ballmac UI: Agent 14. https://ui.ballmac.com/blocks/agent-14
"use client"

import * as React from "react"

import { AgentQueue, type QueuePriority, type QueueTask } from "@/components/ballmac/agent-queue"
import { FanOutGrid, type FanItem } from "@/components/ballmac/fan-out-grid"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Agent14Props = Omit<React.ComponentProps<"section">, "title" | "onPause" | "onCancel"> &
  StateProps & {
    title?: string
    description?: string
    /** The things being worked through, one tile each. */
    items?: FanItem[]
    /** What runs next. */
    tasks?: QueueTask[]
    slots?: number
    /** Called to run the failed items again. Reject and the card says why. */
    onRetryItems?: (ids: string[]) => void | Promise<void>
    onMove?: (id: string, toIndex: number) => void | Promise<void>
    onPause?: (id: string, paused: boolean) => void | Promise<void>
    onCancel?: (id: string) => void | Promise<void>
    onPriority?: (id: string, priority: QueuePriority) => void | Promise<void>
  }

const failures: Record<number, string> = {
  7: "The total did not match the line items: $412.00 against $421.00.",
  19: "Unreadable scan. The second page is blank.",
  33: "The supplier is not in the vendor list.",
}
const sampleItems: FanItem[] = Array.from({ length: 48 }, (_, i) => {
  const n = i + 1
  const label = `invoice-${String(n).padStart(3, "0")}.pdf`
  if (failures[n]) return { id: String(n), label, status: "failed", detail: failures[n], duration: "0.9 s" }
  if (n <= 30) return { id: String(n), label, status: "done", detail: `Matched to purchase order PO-${4100 + n}.`, duration: `${(0.8 + (n % 5) * 0.3).toFixed(1)} s` }
  if (n <= 36) return { id: String(n), label, status: "running", detail: "Reading the line items." }
  if (n === 44) return { id: String(n), label, status: "skipped", detail: "A duplicate of invoice-012.pdf." }
  return { id: String(n), label, status: "queued" }
})
const sampleTasks: QueueTask[] = [
  { id: "r1", title: "Match invoices 31 to 36", state: "running", progress: 58, eta: "about 1 min", agent: "Finance agent" },
  { id: "r2", title: "Match invoices 37 to 42", state: "running", progress: 12, eta: "about 3 min", agent: "Finance agent" },
  { id: "a", title: "Match invoices 43 to 48", state: "queued", priority: "normal", eta: "starts when a slot frees" },
  { id: "b", title: "Post matched invoices to the ledger", state: "queued", priority: "high" },
  { id: "c", title: "Email the finance team a summary", state: "queued", priority: "low" },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Skeleton className="h-96 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}

/**
 * A batch run in one view: the tiles of everything being processed on the left (which are done, running or failed, with Retry for the failures), and the queue of what
 * the agents will do next on the right, where waiting work can be reordered, paused or cancelled. It answers the two questions people have of a big job: which ones went
 * wrong, and what happens next.
 */
function Agent14({ title = "Matching invoices to purchase orders", description = "48 invoices, worked through three at a time.", items = sampleItems, tasks = sampleTasks, slots = 3, onRetryItems, onMove, onPause, onCancel, onPriority, state = "ready", onRetry, emptyState, errorState, className, ...props }: Agent14Props) {
  const id = React.useId()
  const view = state === "ready" && items.length === 0 ? "empty" : state
  return (
    <section data-slot="agent-14" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the batch" loading={<Skel />} empty={{ title: "No batch running", description: "Start a batch and its items appear here as they are worked through.", ...emptyState }} error={{ title: "The batch could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <FanOutGrid items={items} title="Invoices" defaultSelected={items.find((i) => i.status === "failed")?.id} onRetry={onRetryItems} />
          <AgentQueue tasks={tasks} slots={slots} title="What runs next" onMove={onMove} onPause={onPause} onCancel={onCancel} onPriority={onPriority} />
        </div>
      </StateView>
    </section>
  )
}

export { Agent14, type Agent14Props }
