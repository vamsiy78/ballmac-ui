// Ballmac UI: Escalation Card. https://ui.ballmac.com/components/escalation-card
"use client"

import * as React from "react"
import { BellOff, Clock, HandHelping, Loader2, Send, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type Sentiment = "calm" | "frustrated" | "angry" | "unknown"

type EscalationMessage = {
  from: "customer" | "agent"
  text: string
  /** When it was sent, already formatted, such as "2:11 pm". */
  time?: string
}

type EscalationCardProps = Omit<React.ComponentProps<"article">, "title"> & {
  customer: string
  /** Where the conversation is happening, such as "Chat" or "Email". */
  channel: string
  /** Why the agent is handing it to a person, in a sentence. */
  reason: string
  sentiment?: Sentiment
  /** How long they have been waiting, already formatted, such as "4 min". */
  waiting?: string
  /** How long they have waited and how long they should wait at most, in minutes. With both, a meter shows how close the reply is to being late. */
  waitedMinutes?: number
  slaMinutes?: number
  /** What the agent understood so far, as short points. */
  summary?: string[]
  /** The last few messages. */
  messages?: EscalationMessage[]
  /** A reply the agent suggests, which the person can edit before sending. */
  suggestedReply?: string
  /** Called when the person takes the conversation over. */
  onTakeOver?: () => void | Promise<void>
  /** Called to snooze it for a while. */
  onSnooze?: () => void | Promise<void>
  /** Called with the (possibly edited) reply when the person sends it. */
  onSendReply?: (reply: string) => void | Promise<void>
}

const SENTIMENT: Record<Sentiment, string> = { calm: "Calm", frustrated: "Frustrated", angry: "Angry", unknown: "Unknown" }

/**
 * The moment an AI agent hands a conversation to a person: who is waiting and for how long, why it was handed over, how the customer seems to feel (in words),
 * what the agent understood, the last messages, and a suggested reply the person can edit and send. Take over and Snooze report back, and a failure is said plainly.
 */
function EscalationCard({ customer, channel, reason, sentiment = "unknown", waiting, waitedMinutes, slaMinutes, summary = [], messages = [], suggestedReply = "", onTakeOver, onSnooze, onSendReply, className, ...props }: EscalationCardProps) {
  const msg = useMessages()
  const uid = React.useId()
  const [reply, setReply] = React.useState(suggestedReply)
  const [busy, setBusy] = React.useState<"take" | "snooze" | "send" | null>(null)
  const [result, setResult] = React.useState<{ ok: boolean; text: string } | null>(null)
  const [done, setDone] = React.useState<string | null>(null)

  async function run(kind: "take" | "snooze" | "send", work: () => void | Promise<void>, ok: string) {
    setBusy(kind)
    setResult(null)
    try {
      await work()
      setDone(kind)
      setResult({ ok: true, text: ok })
    } catch (e) {
      setResult({ ok: false, text: e instanceof Error ? e.message : msg("escalation-card.failed", "That did not go through. Nothing was changed.") })
    } finally {
      setBusy(null)
    }
  }
  const sentimentText = msg(`escalation-card.sentiment.${sentiment}`, SENTIMENT[sentiment])
  const finished = done !== null && done !== "send"

  return (
    <article data-slot="escalation-card" data-sentiment={sentiment} aria-labelledby={`${uid}-t`} className={cn("grid w-full gap-4 rounded-xl border bg-card p-4 text-card-foreground sm:p-5", sentiment === "angry" && "border-destructive/50", className)} {...props}>
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h3 id={`${uid}-t`} className="text-base font-semibold tracking-tight">{customer}</h3>
          <p className="text-xs text-muted-foreground">{channel}</p>
        </div>
        <p className="flex flex-wrap items-center gap-2 text-xs">
          <span className={cn("rounded-full border px-2.5 py-0.5 font-medium", sentiment === "angry" && "border-destructive/60 text-destructive")}>
            <span className="sr-only">{msg("escalation-card.feels", "Seems")} </span>{sentimentText}
          </span>
          {waiting && (
            <span className="flex items-center gap-1.5 tabular-nums text-muted-foreground">
              <Clock aria-hidden="true" className="size-3.5" /> {msg("escalation-card.waiting", "Waiting {time}", { time: waiting })}
            </span>
          )}
        </p>
      </header>

      {waitedMinutes !== undefined && slaMinutes !== undefined && slaMinutes > 0 && (() => {
        const late = waitedMinutes > slaMinutes
        const text = late
          ? msg("escalation-card.late", "Late by {count} min", { count: Math.round(waitedMinutes - slaMinutes) })
          : msg("escalation-card.left", "{count} min left to reply", { count: Math.max(0, Math.round(slaMinutes - waitedMinutes)) })
        const hot = waitedMinutes >= slaMinutes * 0.8
        return (
          <div className="grid gap-1.5">
            <div role="meter" aria-label={msg("escalation-card.sla", "Time to reply")} aria-valuemin={0} aria-valuemax={slaMinutes} aria-valuenow={Math.min(waitedMinutes, slaMinutes)} aria-valuetext={text} className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full", hot ? "bg-destructive" : "bg-foreground/70")} style={{ width: `${Math.min(100, (waitedMinutes / slaMinutes) * 100)}%` }} />
            </div>
            <p className={cn("text-xs tabular-nums", hot ? "font-medium text-destructive" : "text-muted-foreground")}>{text}</p>
          </div>
        )
      })()}

      <p className="flex gap-2 rounded-lg bg-muted/50 px-3 py-2.5 text-[13px] leading-snug">
        <HandHelping aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span><span className="font-medium">{msg("escalation-card.why", "Why a person is needed:")}</span> {reason}</span>
      </p>

      {summary.length > 0 && (
        <section aria-label={msg("escalation-card.summary", "What the agent understood")}>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Sparkles aria-hidden="true" className="size-3.5" /> {msg("escalation-card.summary", "What the agent understood")}</p>
          <ul className="mt-2 grid gap-1.5 text-[13px] leading-snug">
            {summary.map((s) => (
              <li key={s} className="flex gap-2"><span aria-hidden="true" className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-foreground" />{s}</li>
            ))}
          </ul>
        </section>
      )}

      {messages.length > 0 && (
        <section aria-label={msg("escalation-card.messages", "Last messages")}>
          <ul className="grid gap-2">
            {messages.map((m, i) => (
              <li key={i} className={cn("max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-snug", m.from === "customer" ? "justify-self-start bg-muted" : "justify-self-end border bg-background")}>
                <span className="mb-0.5 block text-[11px] font-medium text-muted-foreground">
                  {m.from === "customer" ? customer : msg("escalation-card.agent", "Agent")}{m.time ? ` · ${m.time}` : ""}
                </span>
                {m.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      {suggestedReply !== "" && !finished && (
        <div className="grid gap-1.5">
          <label htmlFor={`${uid}-reply`} className="text-xs font-medium text-muted-foreground">{msg("escalation-card.reply", "Suggested reply, edit before sending")}</label>
          <textarea id={`${uid}-reply`} value={reply} onChange={(e) => setReply(e.target.value)} rows={4} className="min-h-24 w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
        </div>
      )}

      {!finished && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
          <button type="button" disabled={busy !== null} onClick={() => void run("snooze", () => onSnooze?.(), msg("escalation-card.snoozed", "Snoozed. It will come back if the customer writes again."))} className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-background px-3.5 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none">
            <BellOff aria-hidden="true" className="size-4" /> {msg("escalation-card.snooze", "Snooze")}
          </button>
          {suggestedReply !== "" && (
            <button type="button" disabled={busy !== null || !reply.trim()} onClick={() => void run("send", () => onSendReply?.(reply.trim()), msg("escalation-card.sent", "Reply sent to {customer}.", { customer }))} className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-background px-3.5 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none">
              {busy === "send" ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4 rtl:-scale-x-100" />} {msg("escalation-card.send", "Send reply")}
            </button>
          )}
          <button type="button" disabled={busy !== null} onClick={() => void run("take", () => onTakeOver?.(), msg("escalation-card.taken", "You have taken over from the agent."))} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none">
            {busy === "take" && <Loader2 aria-hidden="true" className="size-4 animate-spin" />} {msg("escalation-card.take", "Take over")}
          </button>
        </div>
      )}
      <p aria-live="polite" role={result && !result.ok ? "alert" : undefined} className={cn("text-sm", result && !result.ok ? "font-medium text-destructive" : "text-muted-foreground")}>{result?.text}</p>
    </article>
  )
}

export { EscalationCard, type EscalationCardProps, type EscalationMessage, type Sentiment }
