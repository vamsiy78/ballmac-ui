// Ballmac UI: Handoff Card. https://ui.ballmac.com/components/handoff-card
"use client"

import * as React from "react"
import { ArrowRight, CircleHelp, CornerUpLeft, FileText, Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type HandoffAgent = {
  name: string
  /** What it is for, for example "Writes the code". */
  role?: string
}

type HandoffContext = {
  /** What was passed, for example "The plan". */
  label: string
  /** More about it, in a few words. */
  detail?: string
  /** Size or length, already formatted, such as "1.2k tokens". */
  size?: string
}

type HandoffStatus = "pending" | "accepted" | "returned"

const STATUS: Record<HandoffStatus, string> = { pending: "Waiting to be picked up", accepted: "Accepted", returned: "Sent back" }

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

type HandoffCardProps = Omit<React.ComponentProps<"article">, "title"> & {
  /** The agent handing the work over. */
  from: HandoffAgent
  /** The agent receiving it. */
  to: HandoffAgent
  /** What the work is. */
  title: string
  /** Everything passed along. */
  context?: HandoffContext[]
  /** Questions the sender could not settle. */
  questions?: string[]
  /** Rules the receiver must keep to, shown as chips. */
  constraints?: string[]
  status?: HandoffStatus
  /** Text for the status, if you want your own words. */
  statusLabel?: string
  /** Time or place of the handoff, already formatted, such as "2:14 pm". */
  at?: string
  /** Buttons or other actions under the card. */
  actions?: React.ReactNode
}

/**
 * The packet one agent passes to another: who to who, what the work is, what context travels with it, the questions still open and the rules to
 * keep. It is a plain server-friendly card, so a transcript or a dashboard can render a hundred of them.
 */
function HandoffCard({ from, to, title, context = [], questions = [], constraints = [], status = "pending", statusLabel, at, actions, className, ...props }: HandoffCardProps) {
  const id = React.useId()
  const msg = useMessages()
  return (
    <article data-slot="handoff-card" data-status={status} aria-labelledby={`${id}-t`} className={cn("grid w-full gap-4 rounded-xl border bg-card p-4 text-card-foreground sm:p-5", className)} {...props}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{initials(from.name)}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">{from.name}</span>
            {from.role && <span className="block truncate text-xs text-muted-foreground">{from.role}</span>}
          </span>
        </div>
        <ArrowRight aria-label={msg("handoff-card.handsOver", "hands over to")} role="img" className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
        <div className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">{initials(to.name)}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">{to.name}</span>
            {to.role && <span className="block truncate text-xs text-muted-foreground">{to.role}</span>}
          </span>
        </div>
        <p className="ms-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-2 py-0.5 font-medium text-foreground">{statusLabel ?? msg(`handoff-card.status.${status}`, STATUS[status])}</span>
          {at && <time className="tabular-nums">{at}</time>}
        </p>
      </div>

      <h3 id={`${id}-t`} className="text-base leading-snug font-semibold tracking-tight text-balance">
        {title}
      </h3>

      {context.length > 0 && (
        <section aria-label={msg("handoff-card.context", "Context passed")}>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileText aria-hidden="true" className="size-3.5" /> {msg("handoff-card.context", "Context passed")}
          </p>
          <ul className="mt-2 divide-y rounded-lg border">
            {context.map((c) => (
              <li key={c.label} className="flex items-baseline justify-between gap-3 px-3 py-2 text-[13px]">
                <span className="min-w-0">
                  <span className="font-medium text-foreground">{c.label}</span>
                  {c.detail && <span className="text-muted-foreground"> · {c.detail}</span>}
                </span>
                {c.size && <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{c.size}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {questions.length > 0 && (
        <section aria-label={msg("handoff-card.questions", "Open questions")}>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <CircleHelp aria-hidden="true" className="size-3.5" /> {msg("handoff-card.questions", "Open questions")}
          </p>
          <ul className="mt-2 grid gap-1.5 text-[13px] leading-snug">
            {questions.map((q) => (
              <li key={q} className="flex gap-2">
                <CornerUpLeft aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground rtl:-scale-x-100" />
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}

      {constraints.length > 0 && (
        <section aria-label={msg("handoff-card.rules", "Rules to keep")}>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Lock aria-hidden="true" className="size-3.5" /> {msg("handoff-card.rules", "Rules to keep")}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {constraints.map((c) => (
              <li key={c} className="rounded-full border bg-background px-2.5 py-1 text-xs">{c}</li>
            ))}
          </ul>
        </section>
      )}

      {actions && <div className="flex flex-wrap justify-end gap-2 border-t pt-4">{actions}</div>}
    </article>
  )
}

export { HandoffCard, type HandoffAgent, type HandoffCardProps, type HandoffContext, type HandoffStatus }
