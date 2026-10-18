// Ballmac UI: Tickets 1. https://ui.ballmac.com/blocks/tickets-1
"use client"

import * as React from "react"
import { CircleAlert, Clock, Loader2, Lock, Mail, MapPin, RotateCw, Send, Sparkles, TicketX } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Textarea } from "@/components/ballmac/textarea"
import { cn } from "@/lib/utils"

type Tickets1Status = "open" | "pending" | "solved"
type Tickets1Priority = "low" | "normal" | "high" | "urgent"

type Tickets1Message = {
  id: string
  from: "customer" | "agent" | "note"
  author: string
  /** "Today, 09:42", already written for people. */
  time: string
  body: string
}

type Tickets1Ticket = {
  id: string
  number: string
  subject: string
  status: Tickets1Status
  priority: Tickets1Priority
  assignee: string
  tags?: string[]
  /** ISO date and time in UTC by which the next reply is due. */
  replyDueAt?: string
  requester: { name: string; email: string; plan?: string; location?: string; since?: string }
  messages: Tickets1Message[]
}

type Tickets1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    ticket?: Tickets1Ticket
    agents?: string[]
    cannedReplies?: { id: string; title: string; body: string }[]
    /** An ISO date and time in UTC for "now", used for the reply timer. The block never reads the clock. */
    now?: string
    /** Name shown on messages you send. */
    me?: string
    /** Called to send a reply or a note. Return a promise; reject and the message stays with Retry. */
    onSend?: (message: { kind: "reply" | "note"; body: string }) => void | Promise<void>
    onStatusChange?: (status: Tickets1Status) => void
    onPriorityChange?: (priority: Tickets1Priority) => void
    onAssign?: (agent: string) => void
  }

const sample: Tickets1Ticket = {
  id: "t1",
  number: "T-48213",
  subject: "I was charged twice for my October invoice",
  status: "open",
  priority: "high",
  assignee: "Sam Okafor",
  tags: ["billing", "refund"],
  replyDueAt: "2026-10-18T11:30:00Z",
  requester: { name: "Hannah Brooks", email: "hannah@brooks.studio", plan: "Team · yearly", location: "London", since: "Customer since March 2024" },
  messages: [
    { id: "m1", from: "customer", author: "Hannah Brooks", time: "Today, 09:12", body: "Hi, I just noticed two charges of $1,440 for October on my card, on the 1st and on the 3rd. I only have one subscription. Could you check and refund the extra one? Thank you." },
    { id: "m2", from: "note", author: "Sam Okafor", time: "Today, 09:31", body: "Checked Stripe: the second charge is a retry after a webhook timeout on our side. Confirmed duplicate, safe to refund in full." },
    { id: "m3", from: "agent", author: "Sam Okafor", time: "Today, 09:38", body: "Hi Hannah, thank you for flagging it, and I am sorry for the trouble. You are right: the second charge was a duplicate on our side. I have started a full refund of $1,440. It usually shows on your card in 3 to 5 working days." },
    { id: "m4", from: "customer", author: "Hannah Brooks", time: "Today, 10:20", body: "Thanks Sam, that was quick. Can you send me a receipt for the refund for our accountant?" },
  ],
}

const canned = [
  { id: "c1", title: "Refund started", body: "I have started a full refund. It usually shows on your card in 3 to 5 working days, and you will get an email when it is sent." },
  { id: "c2", title: "Need more details", body: "Thanks for writing in. To look into this, could you share a screenshot or the exact time it happened?" },
  { id: "c3", title: "Closing the loop", body: "I will mark this as solved for now. If anything is still off, just reply here and it will reopen." },
]

const statusMeta: Record<Tickets1Status, { label: string; dot: string }> = {
  open: { label: "Open", dot: "bg-chart-1" },
  pending: { label: "Waiting on customer", dot: "bg-amber-400" },
  solved: { label: "Solved", dot: "bg-chart-2" },
}
const priorityMeta: Record<Tickets1Priority, { label: string; tone: string }> = {
  low: { label: "Low", tone: "bg-muted" },
  normal: { label: "Normal", tone: "bg-muted" },
  high: { label: "High", tone: "bg-amber-500/15 border-amber-500/40" },
  urgent: { label: "Urgent", tone: "bg-destructive/10 border-destructive/40" },
}

const left = (ms: number) => {
  const m = Math.round(Math.abs(ms) / 60_000)
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ""}`.trim() : `${m} min`
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid gap-4">
        <Skeleton className="h-24 rounded-2xl" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

/**
 * One support ticket as an agent sees it: the conversation with customer messages, replies and private notes (which look different so a note is
 * never sent by mistake), a reply timer that says how long is left or how late you are, a composer that switches between Reply and Internal note
 * with canned replies, and a side panel with the customer, the assignee, status and priority. A message that fails to send stays in the thread with Retry.
 */
function Tickets1({ ticket = sample, agents = ["Sam Okafor", "Mia Laurent", "Alex Kim"], cannedReplies = canned, now = "2026-10-18T10:42:00Z", me = "Sam Okafor", onSend, onStatusChange, onPriorityChange, onAssign, state = "ready", onRetry, emptyState, errorState, className, ...props }: Tickets1Props) {
  const id = React.useId()
  const [messages, setMessages] = React.useState<(Tickets1Message & { pending?: boolean; failed?: boolean; kind?: "reply" | "note" })[]>(ticket.messages)
  const [kind, setKind] = React.useState<"reply" | "note">("reply")
  const [draft, setDraft] = React.useState("")
  const [status, setStatus] = React.useState(ticket.status)
  const [priority, setPriority] = React.useState(ticket.priority)
  const [assignee, setAssignee] = React.useState(ticket.assignee)
  const endRef = React.useRef<HTMLLIElement>(null)
  const empty = state === "empty"

  const due = ticket.replyDueAt ? Date.parse(ticket.replyDueAt) - Date.parse(now) : null
  const lastFromCustomer = [...messages].reverse().find((m) => m.from !== "note")?.from === "customer"
  const timer = due === null || status === "solved" || !lastFromCustomer ? null : due >= 0 ? { late: false, text: `Reply due in ${left(due)}`, warn: due < 3_600_000 } : { late: true, text: `Reply is ${left(due)} late`, warn: true }

  async function deliver(m: Tickets1Message & { kind: "reply" | "note" }) {
    try {
      await onSend?.({ kind: m.kind, body: m.body })
      setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, pending: false, failed: false } : x)))
      if (m.kind === "reply") {
        setStatus("pending")
        onStatusChange?.("pending")
      }
    } catch {
      setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, pending: false, failed: true } : x)))
    }
  }
  function send() {
    const body = draft.trim()
    if (!body) return
    const m = { id: `n${Date.now()}`, from: (kind === "note" ? "note" : "agent") as "note" | "agent", author: me, time: "Just now", body, pending: true, kind }
    setMessages((ms) => [...ms, m])
    setDraft("")
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: "nearest" }))
    void deliver(m)
  }
  function retry(m: (typeof messages)[number]) {
    setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, pending: true, failed: false } : x)))
    void deliver({ ...m, kind: m.kind ?? (m.from === "note" ? "note" : "reply") })
  }

  const content = empty ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <TicketX className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "This ticket is not here"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "It may have been merged or deleted. Go back to the list to find it."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0">
        <header className="bg-card rounded-2xl border p-5 sm:p-6">
          <p className="text-muted-foreground text-sm tabular-nums">Ticket {ticket.number}</p>
          <h1 id={`${id}-title`} className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-balance">
            {ticket.subject}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
              <span aria-hidden="true" className={cn("size-2 rounded-full", statusMeta[status].dot)} />
              {statusMeta[status].label}
            </span>
            <span className={cn("rounded-full border px-3 py-1 text-sm font-medium", priorityMeta[priority].tone)}>{priorityMeta[priority].label} priority</span>
            {timer ? (
              <span role="status" className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium tabular-nums", timer.late ? "bg-destructive/10 border-destructive/40" : timer.warn ? "bg-amber-500/15 border-amber-500/40" : "")}>
                {timer.late ? <CircleAlert aria-hidden="true" className="size-4" /> : <Clock aria-hidden="true" className="size-4" />}
                {timer.text}
              </span>
            ) : null}
          </div>
        </header>

        <ol aria-label="Conversation" className="mt-5 grid gap-4">
          {messages.map((m) => {
            const mine = m.from === "agent"
            const note = m.from === "note"
            return (
              <li key={m.id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
                <span aria-hidden="true" className="relative mt-1 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border text-xs font-semibold">
                  <CoverArt seed={m.author} variant="mesh" className="absolute inset-0" />
                  <span className="relative">{m.author.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                </span>
                <div className={cn("min-w-0 max-w-[85%] rounded-2xl border p-4", mine && "bg-foreground text-background border-foreground", note && "border-dashed bg-amber-500/10 border-amber-500/50", !mine && !note && "bg-card")}>
                  <p className={cn("flex flex-wrap items-center gap-x-2 text-xs", mine ? "text-background/70" : "text-muted-foreground")}>
                    <span className={cn("font-semibold", mine ? "text-background" : "text-foreground")}>{m.author}</span>
                    {note ? (
                      <span className="text-foreground inline-flex items-center gap-1 font-medium">
                        <Lock aria-hidden="true" className="size-3" />
                        Internal note, only your team sees this
                      </span>
                    ) : null}
                    <span className="tabular-nums">{m.time}</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-pretty whitespace-pre-line">{m.body}</p>
                  {m.pending ? (
                    <p className="mt-2 flex items-center gap-1.5 text-xs opacity-80">
                      <Loader2 aria-hidden="true" className="size-3 animate-spin motion-reduce:animate-none" />
                      Sending
                    </p>
                  ) : null}
                  {m.failed ? (
                    <p role="alert" className="mt-2 flex items-center gap-2 text-xs">
                      <CircleAlert aria-hidden="true" className="size-3.5" />
                      Not sent.
                      <button type="button" onClick={() => retry(m)} className="focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-sm font-semibold underline underline-offset-2 outline-none focus-visible:ring-[3px]">
                        <RotateCw aria-hidden="true" className="size-3" />
                        Retry
                      </button>
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
          <li ref={endRef} aria-hidden="true" />
        </ol>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className={cn("bg-card mt-5 rounded-2xl border p-3 transition-colors motion-reduce:transition-none", kind === "note" && "border-amber-500/50 bg-amber-500/5")}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2">
            <div role="tablist" aria-label="Message type" className="bg-muted flex rounded-lg p-0.5">
              {(["reply", "note"] as const).map((k) => (
                <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={cn("focus-visible:ring-ring/50 rounded-md px-3 py-1.5 text-sm font-medium outline-none focus-visible:ring-[3px]", kind === k ? "bg-background shadow-sm" : "text-muted-foreground")}>
                  {k === "reply" ? "Reply to customer" : "Internal note"}
                </button>
              ))}
            </div>
            <Select value="" onValueChange={(v) => setDraft((d) => (d ? `${d}\n\n` : "") + (cannedReplies.find((c) => c.id === v)?.body ?? ""))}>
              <SelectTrigger aria-label="Insert a canned reply" className="w-48">
                <Sparkles aria-hidden="true" className="size-4" />
                <SelectValue placeholder="Canned replies" />
              </SelectTrigger>
              <SelectContent>
                {cannedReplies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea aria-label={kind === "note" ? "Write an internal note" : "Write a reply to the customer"} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); send() } }} rows={4} placeholder={kind === "note" ? "Only your team will see this…" : `Reply to ${ticket.requester.name.split(" ")[0]}…`} className="border-0 shadow-none focus-visible:ring-0" />
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2">
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              {kind === "note" ? (
                <>
                  <Lock aria-hidden="true" className="size-3" />
                  Not sent to the customer
                </>
              ) : (
                <>
                  <Mail aria-hidden="true" className="size-3" />
                  Sent to {ticket.requester.email}
                </>
              )}
            </p>
            <Button type="submit" size="sm" disabled={!draft.trim()}>
              <Send aria-hidden="true" className="rtl:-scale-x-100" />
              {kind === "note" ? "Add note" : "Send reply"}
              <span aria-hidden="true" className="hidden text-xs opacity-60 sm:inline">⌘↵</span>
            </Button>
          </div>
        </form>
      </div>

      <aside aria-label="Ticket details" className="grid gap-4 lg:sticky lg:top-6">
        <div className="bg-card rounded-2xl border p-5">
          <div className="flex items-center gap-3.5">
            <span aria-hidden="true" className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border font-semibold">
              <CoverArt seed={ticket.requester.name} variant="mesh" className="absolute inset-0" />
              <span className="relative">{ticket.requester.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
            </span>
            <div className="min-w-0">
              <h2 className="font-semibold tracking-tight">{ticket.requester.name}</h2>
              <a href={`mailto:${ticket.requester.email}`} className="text-muted-foreground focus-visible:ring-ring/50 block truncate rounded-sm text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">
                {ticket.requester.email}
              </a>
            </div>
          </div>
          <dl className="mt-4 grid gap-2 text-sm">
            {ticket.requester.plan ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-medium">{ticket.requester.plan}</dd>
              </div>
            ) : null}
            {ticket.requester.location ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="size-3.5" />
                  Location
                </dt>
                <dd className="font-medium">{ticket.requester.location}</dd>
              </div>
            ) : null}
          </dl>
          {ticket.requester.since ? <p className="text-muted-foreground mt-3 text-xs">{ticket.requester.since}</p> : null}
        </div>

        <div className="bg-card grid gap-4 rounded-2xl border p-5">
          {[
            { key: "status", label: "Status", value: status, set: (v: string) => { setStatus(v as Tickets1Status); onStatusChange?.(v as Tickets1Status) }, options: (Object.keys(statusMeta) as Tickets1Status[]).map((k) => [k, statusMeta[k].label] as const) },
            { key: "priority", label: "Priority", value: priority, set: (v: string) => { setPriority(v as Tickets1Priority); onPriorityChange?.(v as Tickets1Priority) }, options: (Object.keys(priorityMeta) as Tickets1Priority[]).map((k) => [k, priorityMeta[k].label] as const) },
            { key: "assignee", label: "Assigned to", value: assignee, set: (v: string) => { setAssignee(v); onAssign?.(v) }, options: agents.map((a) => [a, a] as const) },
          ].map((f) => (
            <div key={f.key}>
              <p id={`${id}-${f.key}`} className="text-muted-foreground mb-1.5 text-xs font-medium">
                {f.label}
              </p>
              <Select value={f.value} onValueChange={f.set}>
                <SelectTrigger aria-labelledby={`${id}-${f.key}`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {f.options.map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          {ticket.tags?.length ? (
            <ul aria-label="Tags" className="flex flex-wrap gap-1.5 pt-1">
              {ticket.tags.map((t) => (
                <li key={t} className="bg-muted rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </aside>
    </div>
  )

  return (
    <section data-slot="tickets-1" data-state={state} aria-label={empty ? "Ticket" : `Ticket ${ticket.number}`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the ticket" loading={<Skel />} error={{ title: errorState?.title ?? "The ticket could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Tickets1, type Tickets1Props, type Tickets1Ticket, type Tickets1Message, type Tickets1Status, type Tickets1Priority }
