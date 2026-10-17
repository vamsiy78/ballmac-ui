// Ballmac UI: Agent 1. https://ui.ballmac.com/blocks/agent-1
"use client"

import * as React from "react"
import { Bot, Check, Copy, RotateCw, SendHorizontal, Square } from "lucide-react"

import { AgentPlan, type PlanStep } from "@/components/ballmac/agent-plan"
import { ApprovalCard, type ApprovalDetail, type ApprovalRisk, type ApprovalStatus } from "@/components/ballmac/approval-card"
import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { ToolCallCard } from "@/components/ballmac/tool-call-card"
import { cn } from "@/lib/utils"

type Agent1Event =
  | { id: string; type: "message"; text: string }
  | { id: string; type: "tool"; name: string; status: "pending" | "running" | "success" | "error"; description?: string; duration?: number; input?: unknown; result?: unknown }
  | { id: string; type: "approval"; title: string; description?: string; risk?: ApprovalRisk; details?: ApprovalDetail[]; preview?: React.ReactNode; status: ApprovalStatus }

type Agent1RunStatus = "running" | "waiting" | "done" | "failed" | "stopped"

type Agent1Run = {
  /** What the agent was asked to do. */
  task: string
  /** The agent's name. */
  agent?: string
  status: Agent1RunStatus
  /** Already written for people ("2 min 14 s"). */
  elapsed?: string
  /** The plan, as Agent Plan steps. */
  steps: PlanStep[]
  /** What happened, oldest first: messages, tool calls and approval requests. */
  events: Agent1Event[]
  /** The final answer, once the run is done. */
  output?: string
  /** Tokens used so far, and the cost already formatted ("$0.42"). */
  usage?: { tokens: number; cost?: string }
}

type Agent1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    /** The run to show. */
    run?: Agent1Run
    /** Locale for numbers. */
    locale?: string
    /** Called when an approval request is approved. The block marks it approved straight away. */
    onApprove?: (eventId: string) => void
    /** Called when an approval request is denied. */
    onDeny?: (eventId: string) => void
    /** Called by Stop while the run is going or waiting. */
    onStop?: () => void
    /** Called by "Run again" after a run failed or was stopped. */
    onRunAgain?: () => void
    /** Called with a follow-up instruction. Without it the composer is hidden. */
    onFollowUp?: (text: string) => void
  }

const sample: Agent1Run = {
  task: "Refund the duplicate charge on order 4821 and tell the customer",
  agent: "Support agent",
  status: "waiting",
  elapsed: "48 s",
  usage: { tokens: 18420, cost: "$0.06" },
  steps: [
    { id: "1", title: "Find the order and its payments", status: "done", duration: "6 s" },
    { id: "2", title: "Confirm the second charge is a duplicate", status: "done", duration: "11 s" },
    { id: "3", title: "Refund the duplicate charge", status: "running", description: "Waiting for your approval" },
    { id: "4", title: "Email the customer", status: "pending" },
  ],
  events: [
    { id: "e1", type: "message", text: "I’ll look up order 4821 and check both charges before refunding anything." },
    { id: "e2", type: "tool", name: "orders.get", status: "success", duration: 420, description: "Order 4821", input: { id: 4821 }, result: { customer: "jordan@acme.com", total: "$129.00", payments: 2 } },
    { id: "e3", type: "tool", name: "payments.list", status: "success", duration: 610, description: "Two charges of $129.00, 40 seconds apart", input: { order: 4821 }, result: [{ id: "ch_1", amount: 12900 }, { id: "ch_2", amount: 12900 }] },
    { id: "e4", type: "message", text: "The second charge was made 40 seconds after the first with the same card and amount. It is a duplicate." },
    {
      id: "e5",
      type: "approval",
      title: "Refund $129.00 to the customer’s card",
      description: "Refunds charge ch_2. The customer keeps the order.",
      risk: "high",
      details: [
        { label: "Charge", value: "ch_2" },
        { label: "Amount", value: "$129.00" },
      ],
      status: "pending",
    },
  ],
}

const statusCopy: Record<Agent1RunStatus, { label: string; tone: string }> = {
  running: { label: "Working", tone: "bg-chart-1" },
  waiting: { label: "Waiting for you", tone: "bg-chart-3" },
  done: { label: "Done", tone: "bg-chart-2" },
  failed: { label: "Failed", tone: "bg-destructive" },
  stopped: { label: "Stopped", tone: "bg-muted-foreground" },
}

function RunSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]" aria-hidden="true">
      <div className="grid content-start gap-3 rounded-xl border p-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-3.5 flex-1" />
          </div>
        ))}
      </div>
      <div className="grid content-start gap-3">
        <Skeleton className="h-12 w-4/5 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  )
}

/**
 * One agent run, live: the task and its status, the plan on the side, and everything the agent did in order (its notes, each tool
 * call with input and result, and approval requests that pause the run until someone decides), then the answer and a follow-up box.
 */
function Agent1({
  run = sample,
  locale = "en-US",
  onApprove,
  onDeny,
  onStop,
  onRunAgain,
  onFollowUp,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Agent1Props) {
  const [decisions, setDecisions] = React.useState<Record<string, ApprovalStatus>>({})
  const [draft, setDraft] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const id = React.useId()
  const status = statusCopy[run.status]
  const active = run.status === "running" || run.status === "waiting"
  const nf = new Intl.NumberFormat(locale)
  React.useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  return (
    <section data-slot="agent-1" data-state={state} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="flex flex-wrap items-start gap-4 border-b pb-5">
        <span aria-hidden="true" className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl border">
          <Bot className="size-5" />
        </span>
        <div className="min-w-0 flex-1 basis-64">
          <p className="text-muted-foreground text-xs">{run.agent ?? "Agent"}</p>
          <h2 id={`${id}-task`} className="mt-0.5 text-lg font-semibold tracking-tight text-pretty">
            {run.task}
          </h2>
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums">
            <span role="status" className="text-foreground inline-flex items-center gap-1.5 font-medium">
              <span aria-hidden="true" className={cn("size-2 rounded-full", status.tone)} />
              {status.label}
            </span>
            {run.elapsed ? <span>{run.elapsed}</span> : null}
            {run.usage ? (
              <span>
                {nf.format(run.usage.tokens)} tokens{run.usage.cost ? ` · ${run.usage.cost}` : ""}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          {active && onStop ? (
            <Button variant="outline" size="sm" onClick={onStop}>
              <Square aria-hidden="true" className="fill-current" />
              Stop
            </Button>
          ) : null}
          {(run.status === "failed" || run.status === "stopped") && onRunAgain ? (
            <Button size="sm" onClick={onRunAgain}>
              <RotateCw aria-hidden="true" />
              Run again
            </Button>
          ) : null}
        </div>
      </header>

      <StateView
        state={state}
        onRetry={onRetry}
        label="Loading the run"
        loading={<RunSkeleton />}
        empty={{ title: emptyState?.title ?? "No run yet", description: emptyState?.description ?? "Give the agent a task and its plan and progress appear here.", icon: emptyState?.icon ?? <Bot />, action: emptyState?.action }}
        error={{ title: errorState?.title ?? "The run could not be loaded", ...errorState }}
        className="mt-6"
      >
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <AgentPlan steps={run.steps} title="Plan" className="h-fit lg:sticky lg:top-6" />

          <div className="grid min-w-0 content-start gap-3">
            <h3 className="sr-only">Activity</h3>
            <ol aria-label="Activity" className="grid gap-3">
              {run.events.map((e) => (
                <li key={e.id} className="min-w-0">
                  {e.type === "message" ? (
                    <div className="flex gap-3">
                      <span aria-hidden="true" className="bg-muted mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border [&_svg]:size-3.5">
                        <Bot />
                      </span>
                      <p className="text-sm leading-relaxed text-pretty">{e.text}</p>
                    </div>
                  ) : e.type === "tool" ? (
                    <ToolCallCard name={e.name} status={e.status} duration={e.duration} input={e.input} result={e.result} description={e.description} />
                  ) : (
                    <ApprovalCard
                      title={e.title}
                      description={e.description}
                      risk={e.risk}
                      details={e.details}
                      preview={e.preview}
                      status={decisions[e.id] ?? e.status}
                      onApprove={() => {
                        setDecisions((d) => ({ ...d, [e.id]: "approved" }))
                        onApprove?.(e.id)
                      }}
                      onDeny={() => {
                        setDecisions((d) => ({ ...d, [e.id]: "denied" }))
                        onDeny?.(e.id)
                      }}
                    />
                  )}
                </li>
              ))}
            </ol>

            {run.status === "done" && run.output ? (
              <div className="bg-card rounded-xl border p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Check aria-hidden="true" className="text-chart-2 size-4" />
                    Result
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard?.writeText(run.output ?? "")
                        setCopied(true)
                      } catch {}
                    }}
                  >
                    {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-pretty">{run.output}</p>
              </div>
            ) : null}

            {onFollowUp ? (
              <form
                className="bg-card focus-within:ring-ring/50 mt-2 flex items-center gap-2 rounded-xl border p-1.5 ps-3 focus-within:ring-[3px]"
                onSubmit={(e) => {
                  e.preventDefault()
                  const text = draft.trim()
                  if (!text) return
                  onFollowUp(text)
                  setDraft("")
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-label="Follow-up instruction"
                  aria-describedby={`${id}-task`}
                  placeholder={active ? "Add an instruction while it works…" : "Ask a follow-up…"}
                  className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
                <Button type="submit" size="icon-sm" aria-label="Send" disabled={!draft.trim()}>
                  <SendHorizontal aria-hidden="true" className="rtl:-scale-x-100" />
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Agent1, type Agent1Props, type Agent1Run, type Agent1Event, type Agent1RunStatus }
