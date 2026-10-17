// Ballmac UI: Agent 2. https://ui.ballmac.com/blocks/agent-2
"use client"

import * as React from "react"
import { Bot, CheckCheck, Inbox, OctagonAlert, ShieldAlert, ShieldCheck } from "lucide-react"

import { ApprovalCard, type ApprovalDetail, type ApprovalRisk, type ApprovalStatus } from "@/components/ballmac/approval-card"
import { Button } from "@/components/ballmac/button"
import { Kbd } from "@/components/ballmac/kbd"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Agent2Request = {
  id: string
  /** The agent asking. */
  agent: string
  /** What it wants to do, as a short sentence. */
  title: string
  /** Why, in one or two sentences. */
  description?: string
  risk: ApprovalRisk
  details?: ApprovalDetail[]
  /** The exact thing that will run: a diff, a command, an email draft. */
  preview?: React.ReactNode
  /** When it was asked, already written for people ("4 min ago"). */
  requested: string
  /** The task the agent is working on. */
  task?: string
  status: ApprovalStatus
}

type Agent2Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    /** The requests, newest first. */
    requests?: Agent2Request[]
    /** Heading. */
    title?: string
    /** Called when a request is approved. The block records the decision straight away. */
    onApprove?: (id: string) => void
    /** Called when a request is denied. */
    onDeny?: (id: string) => void
  }

const sample: Agent2Request[] = [
  {
    id: "r1",
    agent: "Billing agent",
    title: "Refund $129.00 to jordan@acme.com",
    description: "The second charge on order 4821 is a duplicate made 40 seconds after the first.",
    risk: "high",
    details: [
      { label: "Charge", value: "ch_2" },
      { label: "Amount", value: "$129.00" },
    ],
    requested: "2 min ago",
    task: "Resolve ticket 5512",
    status: "pending",
  },
  {
    id: "r2",
    agent: "Docs agent",
    title: "Publish the updated install guide",
    description: "Replaces the Node 20 steps with Node 22 and adds the pnpm setup.",
    risk: "medium",
    preview: (
      <pre dir="ltr" className="p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {"- Requires Node.js 20 or later\n+ Requires Node.js 22 or later\n+ Run `corepack enable` to get pnpm"}
      </pre>
    ),
    requested: "9 min ago",
    task: "Keep the docs current",
    status: "pending",
  },
  {
    id: "r3",
    agent: "Research agent",
    title: "Read 14 pages on competitor pricing",
    description: "Only reads public pages. Nothing is stored outside this workspace.",
    risk: "low",
    requested: "12 min ago",
    task: "Pricing review for Q4",
    status: "pending",
  },
  {
    id: "r4",
    agent: "Research agent",
    title: "Search the help center for “export”",
    risk: "low",
    requested: "15 min ago",
    task: "Pricing review for Q4",
    status: "pending",
  },
  {
    id: "r5",
    agent: "Ops agent",
    title: "Restart the worker service in production",
    risk: "high",
    requested: "1 hr ago",
    status: "approved",
  },
]

const riskIcon = { low: ShieldCheck, medium: ShieldAlert, high: OctagonAlert } as const
const riskTone = { low: "text-chart-2", medium: "text-chart-3", high: "text-destructive" } as const
const riskWord = { low: "Low risk", medium: "Medium risk", high: "High risk" } as const

function InboxSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-[20rem_1fr]" aria-hidden="true">
      <div className="grid content-start gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid gap-2 rounded-lg border p-3">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}

/**
 * One inbox for every action agents are waiting on: requests sorted newest first with their risk, the full request beside the
 * list, Approve and Deny with A and D, J and K to move, and one button that approves every low-risk request at once.
 */
function Agent2({
  requests = sample,
  title = "Approvals",
  onApprove,
  onDeny,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Agent2Props) {
  const id = React.useId()
  const [decided, setDecided] = React.useState<Record<string, ApprovalStatus>>({})
  const [view, setView] = React.useState<"pending" | "decided">("pending")
  const all = requests.map((r) => ({ ...r, status: decided[r.id] ?? r.status }))
  const pending = all.filter((r) => r.status === "pending")
  const list = view === "pending" ? pending : all.filter((r) => r.status !== "pending")
  const [selectedId, setSelectedId] = React.useState<string | undefined>(list[0]?.id)
  const selected = list.find((r) => r.id === selectedId) ?? list[0]
  const lowRisk = pending.filter((r) => r.risk === "low")
  const [announce, setAnnounce] = React.useState("")

  function decide(r: Agent2Request, status: "approved" | "denied") {
    const index = list.findIndex((x) => x.id === r.id)
    setDecided((d) => ({ ...d, [r.id]: status }))
    if (status === "approved") onApprove?.(r.id)
    else onDeny?.(r.id)
    setAnnounce(`${status === "approved" ? "Approved" : "Denied"}: ${r.title}`)
    // move on to the next request still waiting, so a queue can be cleared from the keyboard
    if (view === "pending") {
      const rest = list.filter((x) => x.id !== r.id)
      setSelectedId(rest[Math.min(index, rest.length - 1)]?.id)
    }
  }

  function onListKey(e: React.KeyboardEvent) {
    if (!list.length || !selected || e.metaKey || e.ctrlKey || e.altKey) return
    const i = list.findIndex((r) => r.id === selected.id)
    const key = e.key.toLowerCase()
    if (key === "arrowdown" || key === "j") {
      e.preventDefault()
      setSelectedId(list[Math.min(i + 1, list.length - 1)]!.id)
    } else if (key === "arrowup" || key === "k") {
      e.preventDefault()
      setSelectedId(list[Math.max(i - 1, 0)]!.id)
    } else if (key === "a" && selected.status === "pending") {
      e.preventDefault()
      decide(selected, "approved")
    } else if (key === "d" && selected.status === "pending") {
      e.preventDefault()
      decide(selected, "denied")
    }
  }

  const ready = state === "ready"
  const empty = ready && list.length === 0

  return (
    <section data-slot="agent-2" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em]">
            {title}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {ready ? (pending.length === 1 ? "1 action is waiting for you." : `${pending.length} actions are waiting for you.`) : "Actions your agents are waiting on."}
          </p>
        </div>
        {ready && lowRisk.length > 1 ? (
          <Button variant="outline" size="sm" onClick={() => lowRisk.forEach((r) => decide(r, "approved"))}>
            <CheckCheck aria-hidden="true" />
            Approve {lowRisk.length} low-risk
          </Button>
        ) : null}
        <SegmentedControl value={view} onValueChange={(v) => { setView(v as typeof view); setSelectedId(undefined) }} aria-label="Show" size="sm" disabled={!ready}>
          <SegmentedControlItem value="pending">Waiting{ready ? ` (${pending.length})` : ""}</SegmentedControlItem>
          <SegmentedControlItem value="decided">Decided</SegmentedControlItem>
        </SegmentedControl>
      </header>

      <StateView
        state={empty ? "empty" : state}
        onRetry={onRetry}
        label="Loading approvals"
        loading={<InboxSkeleton />}
        empty={{
          title: emptyState?.title ?? (view === "pending" ? "All caught up" : "Nothing decided yet"),
          description: emptyState?.description ?? (view === "pending" ? "When an agent needs your go-ahead, the request appears here." : "Requests you approve or deny are kept here."),
          icon: emptyState?.icon ?? <Inbox />,
          action: emptyState?.action,
        }}
        error={{ title: errorState?.title ?? "Approvals could not be loaded", ...errorState }}
        className="mt-6"
      >
        <div className="grid gap-4 md:grid-cols-[20rem_1fr]">
          <div className="grid content-start gap-2">
            <ul
              role="listbox"
              tabIndex={0}
              aria-label={view === "pending" ? "Waiting requests" : "Decided requests"}
              aria-activedescendant={selected ? `${id}-${selected.id}` : undefined}
              aria-describedby={`${id}-keys`}
              onKeyDown={onListKey}
              className="grid gap-1.5 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {list.map((r) => {
                const Icon = riskIcon[r.risk]
                const isSel = r.id === selected?.id
                return (
                  <li
                    key={r.id}
                    id={`${id}-${r.id}`}
                    role="option"
                    aria-selected={isSel}
                    onClick={() => setSelectedId(r.id)}
                    className={cn(
                      "bg-card cursor-default rounded-lg border p-3 transition-colors duration-150",
                      isSel ? "border-ring ring-ring/20 ring-2" : "hover:bg-accent/50"
                    )}
                  >
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Bot aria-hidden="true" className="size-3.5" />
                      <span className="min-w-0 flex-1 truncate">{r.agent}</span>
                      <span className="shrink-0 tabular-nums">{r.requested}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-pretty">{r.title}</p>
                    <p className={cn("mt-1.5 flex items-center gap-1.5 text-xs", riskTone[r.risk])}>
                      <Icon aria-hidden="true" className="size-3.5" />
                      <span className="text-foreground">{riskWord[r.risk]}</span>
                      {r.status !== "pending" ? <span className="text-muted-foreground">· {r.status === "approved" ? "Approved" : r.status === "denied" ? "Denied" : "Expired"}</span> : null}
                    </p>
                  </li>
                )
              })}
            </ul>
            <p id={`${id}-keys`} className="text-muted-foreground hidden items-center gap-1.5 px-1 text-xs md:flex">
              <Kbd>J</Kbd>
              <Kbd>K</Kbd> move · <Kbd>A</Kbd> approve · <Kbd>D</Kbd> deny
            </p>
          </div>

          {selected ? (
            <div className="grid min-w-0 content-start gap-3">
              {selected.task ? (
                <p className="text-muted-foreground text-xs">
                  For the task <span className="text-foreground font-medium">{selected.task}</span>
                </p>
              ) : null}
              <ApprovalCard
                key={selected.id}
                title={selected.title}
                description={selected.description}
                risk={selected.risk}
                details={selected.details}
                preview={selected.preview}
                status={selected.status}
                onApprove={() => decide(selected, "approved")}
                onDeny={() => decide(selected, "denied")}
              />
            </div>
          ) : null}
        </div>
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Agent2, type Agent2Props, type Agent2Request }
