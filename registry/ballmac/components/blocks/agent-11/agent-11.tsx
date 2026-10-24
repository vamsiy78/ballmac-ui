// Ballmac UI: Agent 11. https://ui.ballmac.com/blocks/agent-11
"use client"

import * as React from "react"
import { CreditCard, Loader2, Search, Square, UserRound } from "lucide-react"

import { AgentSteering, type SteeringMode, type SteeringNote } from "@/components/ballmac/agent-steering"
import { Button } from "@/components/ballmac/button"
import { ContextWindow, type ContextSegment } from "@/components/ballmac/context-window"
import { PlanTracker, type PlanStep } from "@/components/ballmac/plan-tracker"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { ThinkingLoader } from "@/components/ballmac/thinking-loader"
import { ToolCallCard, type ToolCallStatus } from "@/components/ballmac/tool-call-card"
import { cn } from "@/lib/utils"

type Agent11Message =
  | { id: string; role: "user"; text: string; at?: string }
  | { id: string; role: "agent"; text: string; at?: string }
  | { id: string; role: "tool"; name: string; status: ToolCallStatus; server?: string; input?: unknown; result?: unknown; duration?: number; icon?: React.ReactNode }

type Agent11Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    /** The task, shown as the heading. */
    title?: string
    /** The model it runs on, shown beside the heading. */
    model?: string
    /** Whether the run is going. Steering and Stop only work while it is. */
    running?: boolean
    /** What it is doing right now. */
    step?: string
    messages?: Agent11Message[]
    plan?: PlanStep[]
    context?: { segments: ContextSegment[]; limit: number; reserved?: number }
    /** Instructions already sent. */
    notes?: SteeringNote[]
    /** Called with an instruction and when it should apply. Reject and the instruction is taken back with the message. */
    onSteer?: (text: string, mode: SteeringMode) => void | Promise<void>
    /** Called to take back an instruction that has not applied. */
    onRemoveNote?: (id: string) => void | Promise<void>
    /** Called by the Stop button. Reject and the run keeps going with the message. */
    onStop?: () => void | Promise<void>
    /** Called by Compact in the context meter. */
    onCompact?: () => void | Promise<void>
    /** Called when Retry is pressed on a failed tool call. */
    onRetryTool?: (messageId: string) => void | Promise<void>
  }

const sample = {
  title: "Fix the refund for order A-9914",
  model: "Sonnet 5.5",
  step: "Issuing the refund (step 5 of 6)",
  messages: [
    { id: "m1", role: "user", text: "Customer Maria Lopez says her refund for order A-9914 never arrived. Find out why and fix it.", at: "2:02 pm" },
    { id: "m2", role: "agent", text: "I'll look up the order and its payment first.", at: "2:02 pm" },
    { id: "m3", role: "tool", name: "search_orders", server: "orders", icon: <Search />, status: "success", duration: 1240, input: { email: "maria.lopez@example.com", status: "delivered" }, result: "Found order A-9914: $340.00, delivered 6 Oct, refund requested 12 Oct." },
    { id: "m4", role: "tool", name: "get_payment", server: "stripe", icon: <CreditCard />, status: "success", duration: 880, input: { order: "A-9914" }, result: "Refund re_3Pq issued 14 Oct and returned by the bank: the card expired on 30 Sep." },
    { id: "m5", role: "agent", text: "The refund was sent to a card that has since expired, so the bank returned it. I'll re-issue it as store credit, which arrives straight away.", at: "2:04 pm" },
    { id: "m6", role: "tool", name: "issue_refund", server: "stripe", icon: <CreditCard />, status: "running", input: { order: "A-9914", amount: 340, method: "store_credit" } },
  ] as Agent11Message[],
  plan: [
    { id: "p1", title: "Look up the order and its payment", status: "done", estimate: 1, actual: 1 },
    { id: "p2", title: "Find out why the refund failed", status: "done", estimate: 2, actual: 2.5 },
    { id: "p3", title: "Choose how to pay the customer back", status: "done", estimate: 1, actual: 0.5 },
    { id: "p4", title: "Check the amount is within my limit", status: "done", origin: "added", estimate: 1, actual: 0.5 },
    { id: "p5", title: "Issue the refund as store credit", status: "doing", estimate: 2, actual: 1, note: "Waiting for Stripe to confirm." },
    { id: "p6", title: "Email the customer", status: "todo", estimate: 1 },
  ] as PlanStep[],
  context: {
    limit: 200000,
    reserved: 16000,
    segments: [
      { id: "sys", label: "System prompt", tokens: 3800 },
      { id: "tools", label: "Tools and their schemas", tokens: 14200 },
      { id: "files", label: "Policies and order data", tokens: 41000 },
      { id: "chat", label: "Conversation", tokens: 22000 },
    ],
  },
  notes: [{ id: "n1", text: "Prefer store credit over a new card refund.", mode: "now", state: "applied", at: "2:03 pm" }] as SteeringNote[],
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-3">
        <Skeleton className="ms-auto h-12 w-2/3 rounded-2xl" />
        <Skeleton className="h-14 w-5/6 rounded-2xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
      <div className="grid content-start gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  )
}

/**
 * A run workbench: the conversation with each tool call as an openable card, a live plan beside it, the context meter, and a steering box to redirect the agent
 * while it works. Steering is optimistic and honest: an instruction appears as queued at once, and if sending fails it is taken back with the reason. Stop
 * reports back too. Everything the person can do is a labelled control, and the conversation is a log that announces new messages politely.
 */
function Agent11({ title = sample.title, model = sample.model, running = true, step = sample.step, messages = sample.messages, plan = sample.plan, context = sample.context, notes: notesProp = sample.notes, onSteer, onRemoveNote, onStop, onCompact, onRetryTool, state = "ready", onRetry, emptyState, errorState, className, ...props }: Agent11Props) {
  const id = React.useId()
  const [notes, setNotes] = React.useState(notesProp)
  const [live, setLive] = React.useState(running)
  const [stopping, setStopping] = React.useState(false)
  const [stopError, setStopError] = React.useState<string | null>(null)
  const view = state === "ready" && messages.length === 0 ? "empty" : state

  async function steer(text: string, mode: SteeringMode) {
    const note: SteeringNote = { id: `local-${notes.length}-${text.length}`, text, mode, state: "queued", at: "now" }
    setNotes((n) => [...n, note])
    try {
      await onSteer?.(text, mode)
    } catch (e) {
      setNotes((n) => n.filter((x) => x.id !== note.id))
      throw e
    }
  }
  async function remove(noteId: string) {
    await onRemoveNote?.(noteId)
    setNotes((n) => n.filter((x) => x.id !== noteId))
  }
  async function stop() {
    setStopping(true)
    setStopError(null)
    try {
      await onStop?.()
      setLive(false)
    } catch (e) {
      setStopError(e instanceof Error ? e.message : "The run could not be stopped. It is still going.")
    } finally {
      setStopping(false)
    }
  }

  return (
    <section data-slot="agent-11" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">{title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className={cn("size-1.5 rounded-full", live ? "bg-chart-2" : "bg-muted-foreground")} />
              {live ? "Running" : "Stopped"}
            </span>
            <span aria-hidden="true">·</span>
            <span>{model}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Button variant="outline" size="sm" disabled={!live || stopping || state !== "ready"} onClick={() => void stop()}>
            {stopping ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Square aria-hidden="true" />} Stop the run
          </Button>
          {stopError && <p role="alert" className="max-w-xs text-end text-sm font-medium text-destructive">{stopError}</p>}
        </div>
      </header>

      <StateView state={view} onRetry={onRetry} label="Loading the run" loading={<Skel />} empty={{ title: "No run yet", description: "Start a task and its conversation, plan and tool calls appear here.", ...emptyState }} error={{ title: "The run could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid min-w-0 gap-5">
            <div role="log" aria-label="Conversation" aria-live="polite" className="grid gap-3">
              {messages.map((m) => {
                if (m.role === "tool") {
                  return <ToolCallCard key={m.id} name={m.name} status={m.status} server={m.server} icon={m.icon} duration={m.duration} input={m.input} result={m.result} onRetry={onRetryTool ? () => onRetryTool(m.id) : undefined} />
                }
                const mine = m.role === "user"
                return (
                  <div key={m.id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
                    <span aria-hidden="true" className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold", mine ? "bg-foreground text-background" : "bg-muted text-muted-foreground")}>{mine ? <UserRound className="size-4" /> : "A"}</span>
                    <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed text-pretty", mine ? "rounded-se-md bg-foreground text-background" : "rounded-ss-md bg-muted")}>
                      <p className="sr-only">{mine ? "You" : "Agent"}{m.at ? `, ${m.at}` : ""}:</p>
                      {m.text}
                    </div>
                  </div>
                )
              })}
              {live && <ThinkingLoader className="justify-self-start" phases={["Working", "Waiting for Stripe", "Checking the result"]} />}
            </div>
            <AgentSteering notes={notes} running={live} step={step} onSend={steer} onRemove={onRemoveNote ? remove : undefined} />
          </div>

          <aside aria-label="Run details" className="grid content-start gap-4 lg:sticky lg:top-6">
            <PlanTracker steps={plan} title="Plan" />
            <ContextWindow segments={context.segments} limit={context.limit} reserved={context.reserved} onCompact={onCompact} />
          </aside>
        </div>
      </StateView>
    </section>
  )
}

export { Agent11, type Agent11Message, type Agent11Props }
