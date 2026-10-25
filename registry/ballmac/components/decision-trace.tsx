// Ballmac UI: Decision Trace. https://ui.ballmac.com/components/decision-trace
"use client"

import * as React from "react"
import { Check, ChevronDown, CircleSlash, Loader2, Minus, Plus, Undo2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type DecisionOption = {
  id: string
  label: string
  /** How well it fit, from 0 to 1. */
  score: number
  /** Why it scored as it did, in a sentence. */
  reason: string
  pros?: string[]
  cons?: string[]
  /** What it would cost or take, for example "$0.04 · 2 s". */
  cost?: string
}

type DecisionTraceProps = Omit<React.ComponentProps<"section">, "title" | "children"> & {
  /** What was being decided, for example "Which tool should answer this?" */
  question: string
  options: DecisionOption[]
  /** The id the agent chose. Controlled. */
  chosen?: string
  defaultChosen?: string
  /** Who or what decided, for example "Router agent". */
  decidedBy?: string
  /** Adds "Use this instead" to the other options. Reject and the choice goes back with the reason. */
  onOverride?: (id: string) => void | Promise<void>
}

/**
 * Why an agent picked one path over the others. The options sit on a branch diagram with their scores, the chosen one is marked in words, and each one opens to show its
 * reasoning, pros and cons. A person can choose another option, which is reported and can be taken back.
 */
function DecisionTrace({ question, options, chosen: chosenProp, defaultChosen, decidedBy, onOverride, className, ...props }: DecisionTraceProps) {
  const msg = useMessages()
  const id = React.useId()
  const [inner, setInner] = React.useState(defaultChosen ?? [...options].sort((a, b) => b.score - a.score)[0]?.id)
  const chosen = chosenProp ?? inner
  const [open, setOpen] = React.useState<string | null>(chosen ?? null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<{ text: string; error?: boolean } | null>(null)
  const original = React.useRef(defaultChosen ?? [...options].sort((a, b) => b.score - a.score)[0]?.id)
  const sorted = [...options].sort((a, b) => b.score - a.score)

  async function use(o: DecisionOption) {
    const before = chosen
    setInner(o.id)
    setBusy(o.id)
    setStatus(null)
    try {
      await onOverride?.(o.id)
      setStatus({ text: msg("decision-trace.overridden", "Now using {label}", { label: o.label }) })
    } catch (e) {
      setInner(before)
      setStatus({ text: e instanceof Error ? e.message : msg("decision-trace.failed", "That did not work. The choice was not changed."), error: true })
    } finally {
      setBusy(null)
    }
  }

  return (
    <section data-slot="decision-trace" aria-labelledby={`${id}-q`} className={cn("min-w-0 rounded-xl border bg-card p-5 text-card-foreground", className)} {...props}>
      <header className="mb-5">
        <p className="text-xs font-medium text-muted-foreground">{decidedBy ?? msg("decision-trace.decision", "Decision")}</p>
        <h2 id={`${id}-q`} className="mt-0.5 text-base font-semibold tracking-[-0.02em] text-balance">{question}</h2>
      </header>

      <ol className="relative grid gap-2 ps-7">
        {/* The trunk and its branches. Decoration: each option says whether it was chosen in words. */}
        <span aria-hidden="true" className="absolute start-2.5 top-3 bottom-6 w-px bg-border" />
        {sorted.map((o) => {
          const picked = o.id === chosen
          const isOpen = open === o.id
          const pct = Math.round(o.score * 100)
          return (
            <li key={o.id} className="relative">
              <span aria-hidden="true" className={cn("absolute -start-[0.45rem] top-[1.65rem] h-px w-[0.45rem]", picked ? "bg-foreground" : "bg-border")} />
              <span aria-hidden="true" className={cn("absolute -start-[1.55rem] top-[1.1rem] flex size-[1.1rem] items-center justify-center rounded-full border-2 bg-card", picked ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground")}>
                {picked ? <Check className="size-2.5" strokeWidth={3} /> : <CircleSlash className="size-2.5" />}
              </span>
              <div className={cn("rounded-lg border transition-colors motion-reduce:transition-none", picked ? "border-foreground/40 bg-accent/40" : "bg-background")}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${id}-${o.id}`}
                    onClick={() => setOpen(isOpen ? null : o.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className={cn("text-sm", picked ? "font-semibold" : "font-medium text-foreground/90")}>{o.label}</span>
                        <span className={cn("rounded-full px-1.5 py-px text-[11px] font-medium", picked ? "bg-foreground text-background" : "border text-muted-foreground")}>
                          {picked ? msg("decision-trace.chosen", "Chosen") : msg("decision-trace.notChosen", "Not chosen")}
                        </span>
                        {o.id === original.current && !picked && <span className="text-[11px] text-muted-foreground">{msg("decision-trace.agentPick", "The agent's pick")}</span>}
                      </span>
                      <span aria-hidden="true" className="mt-2 block h-1.5 max-w-60 overflow-hidden rounded-full bg-muted">
                        <span className={cn("block h-full rounded-full", picked ? "bg-foreground" : "bg-muted-foreground/50")} style={{ width: `${pct}%` }} />
                      </span>
                    </span>
                    <span className="shrink-0 text-end">
                      <span className="block text-sm font-semibold tabular-nums">{msg("decision-trace.score", "{percent}%", { percent: pct })}</span>
                      <span className="block text-[11px] text-muted-foreground">{msg("decision-trace.fit", "fit")}</span>
                    </span>
                    <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} />
                  </button>
                </h3>
                {isOpen && (
                  <div id={`${id}-${o.id}`} className="grid gap-3 border-t px-3.5 py-3 text-sm">
                    <p className="leading-relaxed text-pretty">{o.reason}</p>
                    {(o.pros?.length || o.cons?.length) && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {o.pros?.length ? (
                          <div>
                            <p aria-hidden="true" className="mb-1.5 text-[11px] font-medium text-muted-foreground">{msg("decision-trace.pros", "In favor")}</p>
                            <ul aria-label={msg("decision-trace.pros", "In favor")} className="grid content-start gap-1.5 text-[13px]">
                              {o.pros.map((t) => (
                                <li key={t} className="flex gap-2"><Plus aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-foreground" />{t}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {o.cons?.length ? (
                          <div>
                            <p aria-hidden="true" className="mb-1.5 text-[11px] font-medium text-muted-foreground">{msg("decision-trace.cons", "Against")}</p>
                            <ul aria-label={msg("decision-trace.cons", "Against")} className="grid content-start gap-1.5 text-[13px] text-muted-foreground">
                              {o.cons.map((t) => (
                                <li key={t} className="flex gap-2"><Minus aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />{t}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {o.cost ? <p className="text-xs text-muted-foreground">{o.cost}</p> : <span />}
                      {onOverride && !picked && (
                        <button type="button" disabled={busy !== null} onClick={() => void use(o)} className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60">
                          {busy === o.id ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <Undo2 aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />}
                          {msg("decision-trace.use", "Use this instead")}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      <p aria-live="polite" role={status?.error ? "alert" : undefined} className={cn("mt-3 min-h-4 text-xs", status?.error ? "font-medium text-destructive" : "text-muted-foreground")}>{status?.text}</p>
    </section>
  )
}

export { DecisionTrace, type DecisionOption, type DecisionTraceProps }
