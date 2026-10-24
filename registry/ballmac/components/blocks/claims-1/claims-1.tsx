// Ballmac UI: Claims 1. https://ui.ballmac.com/blocks/claims-1
"use client"

import * as React from "react"
import { Check, CircleAlert, FileText, Loader2 } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

const STAGES = ["Received", "In review", "Assessed", "Decided", "Paid"] as const
type Claims1Stage = (typeof STAGES)[number]

type Claims1Request = { id: string; text: string; /** Set once the customer has answered. */ answer?: string }
type Claims1Claim = {
  id: string
  /** For example "CLM-20418". */
  number: string
  title: string
  stage: Claims1Stage
  /** Set when a claim was turned down. The stages after "Decided" are then not reached. */
  declined?: boolean
  amount: number
  updated: string
  /** What the insurer needs from the customer before it can go on. */
  requests?: Claims1Request[]
}

type Claims1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    claims?: Claims1Claim[]
    title?: string
    currency?: string
    /** Called with the answer to a request. Reject and the request stays open with the message. */
    onAnswer?: (claimId: string, requestId: string, answer: string) => void | Promise<void>
  }

const claims: Claims1Claim[] = [
  { id: "c1", number: "CLM-20418", title: "Water damage in the kitchen", stage: "In review", amount: 4200, updated: "Today, 09:12", requests: [{ id: "r1", text: "A photo of the burst pipe and the damaged cabinets." }, { id: "r2", text: "The plumber's invoice or quote.", answer: "Uploaded invoice from Hale Plumbing, 14 Oct." }] },
  { id: "c2", number: "CLM-19877", title: "Cracked windscreen", stage: "Paid", amount: 380, updated: "6 Oct" },
  { id: "c3", number: "CLM-19302", title: "Stolen bicycle", stage: "Decided", declined: true, amount: 1100, updated: "28 Sep" },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="grid gap-2.5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

/**
 * An insurance claim tracker: each claim and where it is, a clear line of stages, and the things still needed from the customer with a place to answer.
 * A declined claim stops its line at the decision and says so; stages are written as words, never only drawn.
 */
function Claims1({ claims: list = claims, title = "Your claims", currency = "USD", onAnswer, state = "ready", onRetry, emptyState, errorState, className, ...props }: Claims1Props) {
  const id = React.useId()
  const [sel, setSel] = React.useState(list[0]?.id ?? "")
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [done, setDone] = React.useState<Record<string, string>>({})
  const [busy, setBusy] = React.useState<string | null>(null)
  const [err, setErr] = React.useState<{ key: string; text: string } | null>(null)
  const view = state === "ready" && list.length === 0 ? "empty" : state
  const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)
  const claim = list.find((c) => c.id === sel) ?? list[0]
  const open = (c: Claims1Claim) => (c.requests ?? []).filter((r) => !r.answer && !done[`${c.id}:${r.id}`]).length

  async function send(c: Claims1Claim, r: Claims1Request) {
    const key = `${c.id}:${r.id}`
    const text = (answers[key] ?? "").trim()
    if (!text) { setErr({ key, text: "Write your answer first." }); return }
    setBusy(key)
    setErr(null)
    try {
      await onAnswer?.(c.id, r.id, text)
      setDone((d) => ({ ...d, [key]: text }))
    } catch (e) {
      setErr({ key, text: e instanceof Error ? e.message : "Your answer was not sent. It is still here." })
    } finally {
      setBusy(null)
    }
  }

  return (
    <section data-slot="claims-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="mb-8 text-3xl font-semibold tracking-[-0.035em] text-balance">{title}</h1>
      <StateView state={view} onRetry={onRetry} label="Loading your claims" loading={<Skel />} empty={{ title: "No claims yet", description: "When you make a claim, you can follow it here.", ...emptyState }} error={{ title: "Your claims could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {claim && (
          <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <ul aria-label="Claims" className="grid content-start gap-2.5">
              {list.map((c) => {
                const n = open(c)
                return (
                  <li key={c.id}>
                    <button type="button" aria-pressed={c.id === claim.id} onClick={() => { setSel(c.id); setErr(null) }} className={cn("bg-card focus-visible:ring-ring/50 w-full rounded-xl border p-3.5 text-start outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", c.id === claim.id ? "border-foreground bg-accent/40" : "hover:bg-accent/30")}>
                      <span className="text-muted-foreground block font-mono text-xs">{c.number}</span>
                      <span className="mt-0.5 block text-sm font-medium">{c.title}</span>
                      <span className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 text-xs">
                        <span>{c.declined ? "Declined" : c.stage}</span>
                        {n > 0 && <span className="text-foreground inline-flex items-center gap-1 font-medium"><CircleAlert aria-hidden="true" className="size-3" />{n} {n === 1 ? "thing" : "things"} needed</span>}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <article aria-labelledby={`${id}-claim`} className="bg-card min-w-0 rounded-2xl border p-5 sm:p-6">
              <p className="text-muted-foreground font-mono text-xs">{claim.number}</p>
              <h2 id={`${id}-claim`} className="mt-1 text-xl font-semibold tracking-tight">{claim.title}</h2>
              <p className="text-muted-foreground mt-1 text-sm tabular-nums">Claimed {money(claim.amount)} · updated {claim.updated}</p>

              <ol aria-label="Progress" className="mt-6 grid grid-cols-5 gap-1.5">
                {STAGES.map((s, i) => {
                  const at = STAGES.indexOf(claim.stage)
                  const reached = i <= at
                  const lost = claim.declined && i === at
                  const cut = claim.declined && i > at
                  return (
                    <li key={s} aria-current={i === at ? "step" : undefined} className="min-w-0">
                      <span aria-hidden="true" className={cn("block h-1.5 rounded-full", cut ? "bg-muted/60" : lost ? "bg-destructive" : reached ? "bg-foreground" : "bg-muted")} />
                      <span className={cn("mt-2 block text-xs leading-tight", i === at ? "font-semibold" : "text-muted-foreground")}>
                        {lost ? "Declined" : s}
                        <span className="sr-only">{cut ? " (not reached)" : reached && i < at ? " (done)" : i === at ? " (now)" : " (to come)"}</span>
                      </span>
                    </li>
                  )
                })}
              </ol>
              {claim.declined && <p className="bg-muted mt-4 rounded-lg p-3 text-sm">This claim was declined. If you disagree, reply to the decision letter within 30 days.</p>}

              <h3 className="mt-8 mb-3 text-sm font-semibold">What we need from you</h3>
              {(claim.requests ?? []).length === 0 ? (
                <p className="text-muted-foreground flex items-center gap-2 text-sm"><Check aria-hidden="true" className="size-4" />Nothing needed from you right now.</p>
              ) : (
                <ul className="grid gap-3">
                  {(claim.requests ?? []).map((r) => {
                    const key = `${claim.id}:${r.id}`
                    const answer = r.answer ?? done[key]
                    return (
                      <li key={r.id} className="rounded-xl border p-3.5">
                        <p className="flex items-start gap-2 text-sm font-medium"><FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{r.text}</p>
                        {answer ? (
                          <p className="text-muted-foreground mt-2 flex items-start gap-2 ps-6 text-sm"><Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" /><span><span className="sr-only">Your answer: </span>{answer}</span></p>
                        ) : (
                          <div className="mt-3 ps-6">
                            <label htmlFor={`${id}-${key}`} className="sr-only">Your answer to: {r.text}</label>
                            <textarea id={`${id}-${key}`} rows={2} value={answers[key] ?? ""} onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })} aria-invalid={err?.key === key} aria-describedby={err?.key === key ? `${id}-${key}-err` : undefined} placeholder="Say what you are sending, or paste a link" className="bg-background focus-visible:ring-ring/50 aria-[invalid=true]:border-destructive w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]" />
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <Button size="sm" disabled={busy === key} onClick={() => void send(claim, r)}>{busy === key && <Loader2 aria-hidden="true" className="animate-spin" />} Send answer</Button>
                              {err?.key === key && <p id={`${id}-${key}-err`} role="alert" className="text-destructive text-sm font-medium">{err.text}</p>}
                            </div>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </article>
          </div>
        )}
      </StateView>
    </section>
  )
}

export { Claims1, STAGES as CLAIM_STAGES, type Claims1Claim, type Claims1Props, type Claims1Request, type Claims1Stage }
