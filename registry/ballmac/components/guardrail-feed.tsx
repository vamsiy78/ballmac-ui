// Ballmac UI: Guardrail Feed. https://ui.ballmac.com/components/guardrail-feed
"use client"

import * as React from "react"
import { Ban, Check, ChevronDown, EyeOff, Flag, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type GuardAction = "allowed" | "blocked" | "redacted" | "flagged"

type GuardEvent = {
  id: string
  /** When it happened, already formatted, such as "2:14:08 pm". */
  time: string
  /** The rule that fired, for example "No customer emails in replies". */
  rule: string
  action: GuardAction
  /** What was checked, for example "Draft reply to ticket 4821". */
  target: string
  /** Why the rule fired, in a sentence. */
  reason?: string
  /** The part that matched, shown in the opened row. */
  match?: string
}

const ACTIONS: Record<GuardAction, { icon: LucideIcon; fallback: string; tone: string }> = {
  blocked: { icon: Ban, fallback: "Blocked", tone: "border-destructive/50 text-destructive" },
  redacted: { icon: EyeOff, fallback: "Redacted", tone: "border-chart-3/60 text-foreground" },
  flagged: { icon: Flag, fallback: "Flagged", tone: "border-chart-5/60 text-foreground" },
  allowed: { icon: Check, fallback: "Allowed", tone: "text-muted-foreground" },
}
const ORDER: GuardAction[] = ["blocked", "redacted", "flagged", "allowed"]

type GuardrailFeedProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** Checks in the order to show them, newest first. */
  events: GuardEvent[]
  /** Heading. */
  title?: string
  /** The id of the row that is open at first. */
  defaultOpenId?: string
}

/**
 * A feed of what an agent's guardrails did: every check with the rule, the action and what was checked, counts by action that double as filters, and
 * rows that open to show why and the part that matched. Actions are words and icons, never colour alone.
 */
function GuardrailFeed({ events, title, defaultOpenId, className, ...props }: GuardrailFeedProps) {
  const msg = useMessages()
  const uid = React.useId()
  title ??= msg("guardrail-feed.title", "Guardrail activity")
  const [filter, setFilter] = React.useState<GuardAction | "all">("all")
  const [open, setOpen] = React.useState<string | null>(defaultOpenId ?? null)
  const count = (a: GuardAction) => events.filter((e) => e.action === a).length
  const shown = filter === "all" ? events : events.filter((e) => e.action === filter)

  return (
    <section data-slot="guardrail-feed" aria-labelledby={`${uid}-t`} className={cn("grid w-full min-w-0 gap-4 rounded-xl border bg-card p-4 text-card-foreground sm:p-5", className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={`${uid}-t`} className="text-sm font-medium text-foreground">{title}</h3>
        <div role="group" aria-label={msg("guardrail-feed.filter", "Filter by action")} className="flex max-w-full flex-wrap gap-1.5">
          {(["all", ...ORDER] as const).map((k) => {
            const n = k === "all" ? events.length : count(k)
            return (
              <button
                key={k}
                type="button"
                aria-pressed={filter === k}
                disabled={k !== "all" && n === 0}
                onClick={() => setFilter(k)}
                className={cn("h-8 rounded-full border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none", filter === k ? "border-foreground bg-foreground text-background" : "hover:bg-accent")}
              >
                {k === "all" ? msg("guardrail-feed.all", "All") : msg(`guardrail-feed.${k}`, ACTIONS[k].fallback)} <span className={cn("tabular-nums", filter === k ? "opacity-70" : "text-muted-foreground")}>{n}</span>
              </button>
            )
          })}
        </div>
      </div>

      <p aria-live="polite" className="text-xs text-muted-foreground tabular-nums">
        {msg("guardrail-feed.count", "{count} checks shown", { count: shown.length })}
      </p>

      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">{msg("guardrail-feed.empty", "Nothing here yet.")}</p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-lg border">
          {shown.map((e) => {
            const a = ACTIONS[e.action]
            const Icon = a.icon
            const isOpen = open === e.id
            const hasMore = Boolean(e.reason || e.match)
            return (
              <li key={e.id} data-action={e.action}>
                <button
                  type="button"
                  disabled={!hasMore}
                  aria-expanded={hasMore ? isOpen : undefined}
                  aria-controls={hasMore ? `${uid}-${e.id}` : undefined}
                  onClick={() => setOpen(isOpen ? null : e.id)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-start text-[13px] outline-none transition-colors hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset disabled:cursor-default disabled:hover:bg-transparent motion-reduce:transition-none"
                >
                  <span className={cn("inline-flex w-[5.5rem] shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium", a.tone)}>
                    <Icon aria-hidden="true" className="size-3" />
                    {msg(`guardrail-feed.${e.action}`, a.fallback)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground sm:truncate">{e.rule}</span>
                    <span className="block text-xs text-muted-foreground sm:truncate">{e.target}</span>
                    <time className="mt-0.5 block font-mono text-[11px] text-muted-foreground tabular-nums sm:hidden" dir="ltr">{e.time}</time>
                  </span>
                  <time className="hidden shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums sm:block" dir="ltr">{e.time}</time>
                  {hasMore && <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} />}
                </button>
                {hasMore && isOpen && (
                  <div id={`${uid}-${e.id}`} className="grid min-w-0 gap-2 border-t bg-muted/30 px-3 py-3 text-[13px]">
                    {e.reason && <p className="leading-relaxed text-foreground">{e.reason}</p>}
                    {e.match && (
                      <p className="rounded-md border bg-background px-3 py-2 font-mono text-xs [overflow-wrap:anywhere] text-muted-foreground" dir="ltr">
                        {e.match}
                      </p>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export { GuardrailFeed, type GuardAction, type GuardEvent, type GuardrailFeedProps }
