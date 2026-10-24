// Ballmac UI: Message Actions. https://ui.ballmac.com/components/message-actions
"use client"

import * as React from "react"
import { Check, Copy, GitBranch, Loader2, RefreshCw, Share2, ThumbsDown, ThumbsUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type Feedback = "up" | "down"

type MessageActionsProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** The message text, copied by Copy. Leave it out to hide Copy. */
  text?: string
  /** Adds Regenerate. Reject and the bar says why. */
  onRegenerate?: () => void | Promise<void>
  /** Adds the thumbs. Called with the choice, and for a thumbs down the reason picked. Reject and the choice is taken back. */
  onFeedback?: (value: Feedback, reason?: string) => void | Promise<void>
  /** Adds Branch, which continues the conversation from here. */
  onBranch?: () => void | Promise<void>
  /** Adds Share. */
  onShare?: () => void | Promise<void>
  /** The reasons offered after a thumbs down. */
  reasons?: string[]
  /** The feedback already given, if any. */
  defaultFeedback?: Feedback | null
}

const DEFAULT_REASONS = ["Not accurate", "Not helpful", "Too long", "Wrong tone", "Unsafe"]

/**
 * The small bar under an AI reply: copy it, try again, say it was good or bad, branch from it, share it. It is a real toolbar: one stop in the tab order,
 * and Left, Right, Home and End move between the buttons. Every result is said aloud and shown ("Copied", "Thanks, that helps"); a thumbs down asks what was wrong
 * and a choice that cannot be saved is taken back with the reason.
 */
function MessageActions({ text, onRegenerate, onFeedback, onBranch, onShare, reasons = DEFAULT_REASONS, defaultFeedback = null, className, ...props }: MessageActionsProps) {
  const msg = useMessages()
  const id = React.useId()
  const [copied, setCopied] = React.useState(false)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [feedback, setFeedback] = React.useState<Feedback | null>(defaultFeedback)
  const [asking, setAsking] = React.useState(false)
  const [status, setStatus] = React.useState<{ text: string; error?: boolean } | null>(null)
  const refs = React.useRef<HTMLButtonElement[]>([])
  const [active, setActive] = React.useState(0)

  async function run(key: string, fn: () => void | Promise<void>, ok?: string) {
    setBusy(key)
    setStatus(null)
    try {
      await fn()
      if (ok) setStatus({ text: ok })
      return true
    } catch (e) {
      setStatus({ text: e instanceof Error ? e.message : msg("message-actions.failed", "That did not work. Nothing was changed."), error: true })
      return false
    } finally {
      setBusy(null)
    }
  }
  async function copy() {
    if (text === undefined) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setStatus({ text: msg("message-actions.copied", "Copied") })
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setStatus({ text: msg("message-actions.copyFailed", "It could not be copied. Select the text and copy it yourself."), error: true })
    }
  }
  async function rate(value: Feedback, reason?: string) {
    const before = feedback
    setFeedback(value)
    setAsking(value === "down" && reason === undefined)
    if (value === "down" && reason === undefined) return
    const ok = await run("feedback", () => onFeedback?.(value, reason), msg("message-actions.thanks", "Thanks, that helps."))
    if (!ok) { setFeedback(before); setAsking(false) } else setAsking(false)
  }

  const buttons: { key: string; label: string; icon: React.ReactNode; pressed?: boolean; onClick: () => void; disabled?: boolean }[] = [
    ...(text !== undefined ? [{ key: "copy", label: msg("message-actions.copy", "Copy"), icon: copied ? <Check /> : <Copy />, onClick: () => void copy() }] : []),
    ...(onRegenerate ? [{ key: "regen", label: msg("message-actions.regenerate", "Try again"), icon: busy === "regen" ? <Loader2 className="animate-spin" /> : <RefreshCw />, disabled: busy === "regen", onClick: () => void run("regen", onRegenerate, msg("message-actions.regenerated", "A new answer is on its way.")) }] : []),
    ...(onFeedback ? [
      { key: "up", label: msg("message-actions.good", "Good answer"), icon: <ThumbsUp />, pressed: feedback === "up", onClick: () => void rate("up") },
      { key: "down", label: msg("message-actions.bad", "Bad answer"), icon: <ThumbsDown />, pressed: feedback === "down", onClick: () => void rate("down") },
    ] : []),
    ...(onBranch ? [{ key: "branch", label: msg("message-actions.branch", "Branch from here"), icon: <GitBranch />, onClick: () => void run("branch", onBranch, msg("message-actions.branched", "A new conversation started from here.")) }] : []),
    ...(onShare ? [{ key: "share", label: msg("message-actions.share", "Share"), icon: <Share2 />, onClick: () => void run("share", onShare) }] : []),
  ]
  if (buttons.length === 0) return null

  function onKeyDown(e: React.KeyboardEvent) {
    const last = buttons.length - 1
    let next = active
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1
    else if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = last
    else return
    e.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div data-slot="message-actions" className={cn("grid gap-2", className)} {...props}>
      <div role="toolbar" aria-label={msg("message-actions.label", "Message actions")} onKeyDown={onKeyDown} className="flex w-fit items-center gap-0.5 rounded-lg border bg-card p-0.5">
        {buttons.map((b, i) => (
          <button
            key={b.key}
            ref={(el) => { if (el) refs.current[i] = el }}
            type="button"
            aria-label={b.label}
            title={b.label}
            aria-pressed={b.pressed}
            disabled={b.disabled}
            tabIndex={active === i ? 0 : -1}
            onFocus={() => setActive(i)}
            onClick={b.onClick}
            className={cn("flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60 motion-reduce:transition-none [&>svg]:size-4", b.pressed && "bg-accent text-foreground")}
          >
            {b.icon}
          </button>
        ))}
      </div>
      {asking && (
        <div role="group" aria-labelledby={`${id}-why`} className="grid gap-1.5">
          <p id={`${id}-why`} className="text-xs font-medium text-muted-foreground">{msg("message-actions.why", "What was wrong?")}</p>
          <div className="flex flex-wrap gap-1.5">
            {reasons.map((r) => (
              <button key={r} type="button" onClick={() => void rate("down", r)} className="h-7 rounded-full border bg-background px-3 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none">{r}</button>
            ))}
            <button type="button" onClick={() => void rate("down", "")} className="h-7 rounded-full px-3 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">{msg("message-actions.skip", "Skip")}</button>
          </div>
        </div>
      )}
      <p aria-live="polite" role={status?.error ? "alert" : undefined} className={cn("min-h-4 text-xs", status?.error ? "font-medium text-destructive" : "text-muted-foreground")}>{status?.text}</p>
    </div>
  )
}

export { MessageActions, type Feedback, type MessageActionsProps }
