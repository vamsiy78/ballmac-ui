// Ballmac UI: Review Center. https://ui.ballmac.com/components/review-center
"use client"

import * as React from "react"
import { Check, CircleDashed, Loader2, MessageSquareWarning } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type ReviewStatus = "pending" | "approved" | "changes"

type ReviewItem = {
  id: string
  title: string
  /** Which agent made it. */
  agent?: string
  /** What it is and what it did, in a sentence or two. */
  summary: string
  /** A line of context such as "Release notes, 240 words". */
  meta?: string
  /** How sure the agent is, 0 to 1. Shown as a percentage and a bar. */
  confidence?: number
  status: ReviewStatus
  /** What the reviewer asked to change, shown on an item that was sent back. */
  feedback?: string
  /** The thing to review: a diff, a draft, a table. Anything you can render. */
  preview?: React.ReactNode
}

type ReviewCenterProps = Omit<React.ComponentProps<"section">, "title" | "onSelect"> & {
  items: ReviewItem[]
  title?: string
  /** The selected item id. Controlled. */
  selected?: string | null
  defaultSelected?: string | null
  onSelectedChange?: (id: string) => void
  /** Called to approve an item. Reject and the decision is taken back with the message. */
  onApprove?: (id: string) => void | Promise<void>
  /** Called to send an item back with what should change. Reject and the decision is taken back with the message. */
  onRequestChanges?: (id: string, comment: string) => void | Promise<void>
}

const STATUS = { pending: { icon: CircleDashed, label: "To review" }, approved: { icon: Check, label: "Approved" }, changes: { icon: MessageSquareWarning, label: "Sent back" } } as const

/**
 * A desk for reviewing what agents produced: a list of items to look at, with how confident the agent was, and for the chosen one its summary, the thing itself
 * (a diff, a draft, a table: you pass it in) and two decisions, Approve and Request changes with a comment. It is built to be fast from the keyboard: J and K
 * (or the arrow keys) move, A approves, R asks for changes, and after a decision it moves to the next item still waiting. A decision is shown at once and
 * taken back with the reason if it cannot be saved.
 */
function ReviewCenter({ items, title, selected: selectedProp, defaultSelected, onSelectedChange, onApprove, onRequestChanges, className, ...props }: ReviewCenterProps) {
  const msg = useMessages()
  const id = React.useId()
  title ??= msg("review-center.title", "Review")
  const [local, setLocal] = React.useState<Record<string, { status: ReviewStatus; feedback?: string }>>({})
  const [inner, setInner] = React.useState<string | null>(defaultSelected ?? items.find((i) => i.status === "pending")?.id ?? items[0]?.id ?? null)
  const selected = selectedProp !== undefined ? selectedProp : inner
  const [asking, setAsking] = React.useState(false)
  const [comment, setComment] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const commentRef = React.useRef<HTMLTextAreaElement>(null)
  const optionRefs = React.useRef(new Map<string, HTMLDivElement>())

  // New items from the parent replace what was decided here.
  const key = items.map((i) => `${i.id}:${i.status}`).join("|")
  React.useEffect(() => setLocal({}), [key])

  const view = items.map((i) => ({ ...i, ...(local[i.id] ?? {}) }))
  const chosen = view.find((i) => i.id === selected)
  const counts = { pending: view.filter((i) => i.status === "pending").length, approved: view.filter((i) => i.status === "approved").length, changes: view.filter((i) => i.status === "changes").length }
  const word = (s: ReviewStatus) => msg(`review-center.status.${s}`, STATUS[s].label)

  function select(itemId: string, focus = false) {
    setAsking(false)
    setComment("")
    setError(null)
    if (selectedProp === undefined) setInner(itemId)
    onSelectedChange?.(itemId)
    if (focus) optionRefs.current.get(itemId)?.focus()
  }
  const step = (delta: number) => {
    const at = view.findIndex((i) => i.id === selected)
    const next = view[Math.min(view.length - 1, Math.max(0, at + delta))]
    if (next) select(next.id, true)
  }
  const nextPending = (from: string) => {
    const at = view.findIndex((i) => i.id === from)
    return [...view.slice(at + 1), ...view.slice(0, at)].find((i) => i.status === "pending")
  }

  async function decide(status: ReviewStatus, text?: string) {
    if (!chosen) return
    if (status === "changes" && !text?.trim()) {
      setError(msg("review-center.needComment", "Say what should change first."))
      return
    }
    const before = local[chosen.id]
    setLocal((l) => ({ ...l, [chosen.id]: { status, feedback: text?.trim() } }))
    setBusy(true)
    setError(null)
    try {
      await (status === "approved" ? onApprove?.(chosen.id) : onRequestChanges?.(chosen.id, text!.trim()))
      setAnnounce(status === "approved" ? msg("review-center.approvedDone", "Approved: {title}", { title: chosen.title }) : msg("review-center.changesDone", "Sent back: {title}", { title: chosen.title }))
      setAsking(false)
      setComment("")
      const next = nextPending(chosen.id)
      if (next) select(next.id, true)
    } catch (e) {
      setLocal((l) => {
        const n = { ...l }
        if (before) n[chosen.id] = before
        else delete n[chosen.id]
        return n
      })
      setError(e instanceof Error ? e.message : msg("review-center.failed", "The decision was not saved. Nothing was changed."))
    } finally {
      setBusy(false)
    }
  }

  function onSectionKeyDown(e: React.KeyboardEvent) {
    const t = e.target as HTMLElement
    if (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.tagName === "SELECT" || e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === "j" || e.key === "ArrowDown") step(1)
    else if (e.key === "k" || e.key === "ArrowUp") step(-1)
    else if (e.key === "Home") { const f = view[0]; if (f) select(f.id, true) }
    else if (e.key === "End") { const l = view[view.length - 1]; if (l) select(l.id, true) }
    else if (e.key === "a" && chosen && !busy && onApprove) void decide("approved")
    else if (e.key === "r" && chosen && !busy && onRequestChanges) { setAsking(true); setTimeout(() => commentRef.current?.focus(), 0) }
    else return
    e.preventDefault()
  }

  return (
    <section data-slot="review-center" aria-labelledby={`${id}-t`} onKeyDown={onSectionKeyDown} className={cn("bg-card text-card-foreground overflow-hidden rounded-xl border", className)} {...props}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-4 py-3">
        <h3 id={`${id}-t`} className="text-sm font-semibold">{title}</h3>
        <p className="text-xs tabular-nums text-muted-foreground">
          {msg("review-center.toReview", "{count} to review", { count: counts.pending })} · {msg("review-center.approvedCount", "{count} approved", { count: counts.approved })}
          {counts.changes > 0 ? ` · ${msg("review-center.changesCount", "{count} sent back", { count: counts.changes })}` : ""}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-muted-foreground">{msg("review-center.empty", "Nothing to review.")}</p>
      ) : (
        <div className="grid md:grid-cols-[17rem_minmax(0,1fr)]">
          <div role="listbox" aria-label={msg("review-center.listLabel", "Items to review")} className="max-h-[28rem] divide-y overflow-y-auto border-b md:border-e md:border-b-0">
            {view.map((it) => {
              const S = STATUS[it.status]
              const on = it.id === selected
              return (
                <div
                  key={it.id}
                  ref={(el) => {
                    if (el) optionRefs.current.set(it.id, el)
                    else optionRefs.current.delete(it.id)
                  }}
                  role="option"
                  aria-selected={on}
                  tabIndex={on || (!selected && it.id === view[0]?.id) ? 0 : -1}
                  onClick={() => select(it.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(it.id) } }}
                  className={cn("flex cursor-default items-start gap-2.5 px-3.5 py-3 text-sm outline-none transition-colors hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transition-none", on && "bg-accent/60")}
                >
                  <S.icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", it.status === "pending" ? "text-muted-foreground" : "text-foreground")} />
                  <div className="min-w-0 flex-1">
                    <p className={cn("leading-snug text-pretty", it.status === "pending" ? "font-medium" : "text-muted-foreground")}><span className="sr-only">{word(it.status)}: </span>{it.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{[it.agent, it.confidence !== undefined ? msg("review-center.confidence", "{percent}% sure", { percent: Math.round(it.confidence * 100) }) : undefined].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid min-w-0 content-start gap-4 p-4 sm:p-5">
            {chosen ? (
              <>
                <div>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold tracking-tight">
                    {chosen.title}
                    <span className={cn("rounded-full border px-2 py-px text-[11px] font-medium", chosen.status === "pending" ? "text-muted-foreground" : "border-foreground")}>{word(chosen.status)}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{[chosen.agent, chosen.meta].filter(Boolean).join(" · ")}</p>
                </div>
                <p className="text-sm leading-relaxed text-pretty">{chosen.summary}</p>
                {chosen.confidence !== undefined && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div role="meter" aria-label={msg("review-center.confidenceMeter", "Agent confidence")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(chosen.confidence * 100)} aria-valuetext={msg("review-center.confidenceSpoken", "{percent}% sure", { percent: Math.round(chosen.confidence * 100) })} className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", chosen.confidence < 0.6 ? "bg-destructive/70" : "bg-foreground")} style={{ width: `${chosen.confidence * 100}%` }} />
                    </div>
                    <span className={cn("tabular-nums", chosen.confidence < 0.6 && "font-medium text-destructive")}>{msg("review-center.confidence", "{percent}% sure", { percent: Math.round(chosen.confidence * 100) })}{chosen.confidence < 0.6 ? ` · ${msg("review-center.lowConfidence", "worth a close look")}` : ""}</span>
                  </div>
                )}
                {chosen.preview && <div className="min-w-0 rounded-lg border bg-background/60 p-3.5 text-sm">{chosen.preview}</div>}
                {chosen.status === "changes" && chosen.feedback && <p className="rounded-lg bg-muted/60 px-3 py-2.5 text-sm"><span className="font-medium">{msg("review-center.youAsked", "You asked for:")}</span> {chosen.feedback}</p>}

                {asking && (
                  <div className="grid gap-2">
                    <label htmlFor={`${id}-c`} className="text-sm font-medium">{msg("review-center.commentLabel", "What should change?")}</label>
                    <textarea ref={commentRef} id={`${id}-c`} rows={3} value={comment} onChange={(e) => { setComment(e.target.value); setError(null) }} onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setAsking(false) } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void decide("changes", comment) } }} aria-invalid={!!error} className="w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[invalid=true]:border-destructive" />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {onApprove && (
                    <button type="button" disabled={busy || chosen.status === "approved"} onClick={() => void decide("approved")} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none">
                      {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Check aria-hidden="true" className="size-4" />}
                      {msg("review-center.approve", "Approve")}
                    </button>
                  )}
                  {onRequestChanges && (asking ? (
                    <>
                      <button type="button" disabled={busy} onClick={() => void decide("changes", comment)} className="inline-flex h-9 items-center rounded-full border bg-background px-4 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 motion-reduce:transition-none">{msg("review-center.sendBack", "Send it back")}</button>
                      <button type="button" onClick={() => setAsking(false)} className="inline-flex h-9 items-center rounded-full px-3 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">{msg("review-center.cancel", "Cancel")}</button>
                    </>
                  ) : (
                    <button type="button" disabled={busy} onClick={() => { setAsking(true); setTimeout(() => commentRef.current?.focus(), 0) }} className="inline-flex h-9 items-center rounded-full border bg-background px-4 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 motion-reduce:transition-none">{msg("review-center.requestChanges", "Request changes")}</button>
                  ))}
                </div>
                {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">{msg("review-center.hint", "Select an item to review it.")}</p>
            )}
            <p className="text-xs text-muted-foreground">{msg.rich("review-center.keys", "{j} and {k} move, {a} approves, {r} asks for changes.", { j: <kbd className="rounded border bg-muted px-1 font-mono">J</kbd>, k: <kbd className="rounded border bg-muted px-1 font-mono">K</kbd>, a: <kbd className="rounded border bg-muted px-1 font-mono">A</kbd>, r: <kbd className="rounded border bg-muted px-1 font-mono">R</kbd> })}</p>
          </div>
        </div>
      )}
      <p aria-live="polite" className="sr-only">{announce}</p>
    </section>
  )
}

export { ReviewCenter, type ReviewCenterProps, type ReviewItem, type ReviewStatus }
