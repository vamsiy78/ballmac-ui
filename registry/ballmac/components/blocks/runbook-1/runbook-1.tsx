// Ballmac UI: Runbook 1. https://ui.ballmac.com/blocks/runbook-1
"use client"

import * as React from "react"
import { CircleCheck, Clipboard, ClipboardCheck, Clock, Loader2, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Runbook1Step = {
  id: string
  title: string
  /** What to do and why, in a sentence or two. */
  body: string
  /** A command to run. Shown as code with a copy button; it never runs by itself. */
  command?: string
  /** A warning to read before doing the step. */
  caution?: string
  /** About how many minutes the step takes. */
  minutes?: number
}

type Runbook1Data = {
  title: string
  /** What it is for, such as "The primary database is out of connections". */
  when: string
  steps: Runbook1Step[]
}

type Runbook1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    runbook?: Runbook1Data | null
    /** Step ids that are already done. */
    defaultDone?: string[]
    /** Called when a step is ticked or unticked. Reject and the tick goes back with the message. */
    onStepChange?: (stepId: string, done: boolean) => void | Promise<void>
    /** Called when every step is done and the person finishes the runbook. */
    onComplete?: () => void | Promise<void>
  }

const sample: Runbook1Data = {
  title: "Database is out of connections",
  when: "Use this when the primary database refuses new connections and the API returns 503.",
  steps: [
    { id: "s1", title: "Confirm it is the connection limit", body: "Check that the count is at the limit before changing anything. If it is not, this is the wrong runbook.", command: "psql -c \"select count(*), max_conn from pg_stat_activity, (select setting::int max_conn from pg_settings where name='max_connections') s group by 2;\"", minutes: 2 },
    { id: "s2", title: "Find what is holding connections", body: "Look for one client with a very large share, or for idle-in-transaction sessions that never finish.", command: "psql -c \"select client_addr, state, count(*) from pg_stat_activity group by 1,2 order by 3 desc limit 10;\"", minutes: 3 },
    { id: "s3", title: "End idle-in-transaction sessions", body: "These can be ended safely. Their open transactions are rolled back.", caution: "This rolls back work that was never committed. Do not run it while a migration is in progress.", command: "psql -c \"select pg_terminate_backend(pid) from pg_stat_activity where state='idle in transaction' and now()-state_change > interval '5 minutes';\"", minutes: 2 },
    { id: "s4", title: "Restart the client that leaked connections", body: "If one service holds most of them, restart it so it opens a fresh pool. Start with one instance and watch the count.", minutes: 5 },
    { id: "s5", title: "Post an update and watch for ten minutes", body: "Tell the channel what you did, and keep an eye on the connection count and the API error rate before closing the incident.", minutes: 10 },
  ],
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      <Skeleton className="h-20 rounded-xl" />
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  )
}

/**
 * A runbook someone follows under pressure: the steps in order with a tick for each, the next step marked, commands to copy (never run for you), cautions read
 * out before the step, and a count of the minutes left. Finishing is only possible when every step is ticked.
 */
function Runbook1({ runbook = sample, defaultDone = [], onStepChange, onComplete, state = "ready", onRetry, emptyState, errorState, className, ...props }: Runbook1Props) {
  const id = React.useId()
  const [done, setDone] = React.useState<string[]>(defaultDone)
  const [copied, setCopied] = React.useState<string | null>(null)
  const [error, setError] = React.useState<{ id: string; text: string } | null>(null)
  const [finished, setFinished] = React.useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = React.useState(false)
  const view = state === "ready" && !runbook ? "empty" : state
  const steps = runbook?.steps ?? []
  const next = steps.find((s) => !done.includes(s.id))
  const left = steps.filter((s) => !done.includes(s.id)).reduce((n, s) => n + (s.minutes ?? 0), 0)

  async function tick(s: Runbook1Step, on: boolean) {
    setError(null)
    setFinished(null)
    setDone((d) => (on ? [...d, s.id] : d.filter((x) => x !== s.id)))
    try {
      await onStepChange?.(s.id, on)
    } catch (e) {
      setDone((d) => (on ? d.filter((x) => x !== s.id) : [...d, s.id]))
      setError({ id: s.id, text: e instanceof Error ? e.message : "That did not save, so the step is as it was." })
    }
  }
  async function copy(s: Runbook1Step) {
    try {
      await navigator.clipboard.writeText(s.command ?? "")
      setCopied(s.id)
      window.setTimeout(() => setCopied((c) => (c === s.id ? null : c)), 2000)
    } catch {
      setError({ id: s.id, text: "The command could not be copied. Select it and copy it by hand." })
    }
  }
  async function complete() {
    setBusy(true)
    setFinished(null)
    try {
      await onComplete?.()
      setFinished({ ok: true, text: "Runbook finished. Remember to post a final update." })
    } catch (e) {
      setFinished({ ok: false, text: e instanceof Error ? e.message : "The runbook could not be finished." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section data-slot="runbook-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-3xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={view} onRetry={onRetry} label="Loading the runbook" loading={<Skel />} empty={{ title: "No runbook for this", description: "Write a runbook for this alert and it will open here with its steps.", ...emptyState }} error={{ title: "The runbook could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {runbook && (
          <>
            <header className="mb-6">
              <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">{runbook.title}</h1>
              <p className="text-muted-foreground mt-2 max-w-xl text-pretty">{runbook.when}</p>
            </header>
            <div className="bg-card mb-5 grid gap-2.5 rounded-xl border p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <p className="font-medium tabular-nums">{done.length} of {steps.length} steps done</p>
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs tabular-nums"><Clock aria-hidden="true" className="size-3.5" /> {left > 0 ? `About ${left} min left` : "No time left on the steps"}</p>
              </div>
              <div role="meter" aria-label="Steps done" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done.length} aria-valuetext={`${done.length} of ${steps.length} steps done`} className="bg-muted h-2 overflow-hidden rounded-full">
                <div className="bg-foreground h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${steps.length ? (done.length / steps.length) * 100 : 0}%` }} />
              </div>
            </div>

            <ol className="grid gap-3">
              {steps.map((s, i) => {
                const isDone = done.includes(s.id)
                const isNext = next?.id === s.id
                return (
                  <li key={s.id} data-done={isDone || undefined} aria-current={isNext ? "step" : undefined} className={cn("bg-card rounded-xl border p-4 sm:p-5", isNext && "border-foreground shadow-[0_0_0_1px_var(--foreground)]", isDone && "bg-muted/30")}>
                    <div className="flex items-start gap-3">
                      <input id={`${id}-${s.id}`} type="checkbox" checked={isDone} onChange={(e) => void tick(s, e.target.checked)} className="accent-foreground mt-1 size-5 shrink-0 cursor-pointer" />
                      <div className="min-w-0 flex-1">
                        <label htmlFor={`${id}-${s.id}`} className="flex cursor-pointer flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-muted-foreground font-mono text-xs tabular-nums">{i + 1}</span>
                          <span className={cn("font-medium", isDone && "text-muted-foreground line-through")}>{s.title}</span>
                          {isNext && <span className="bg-foreground text-background rounded-full px-2 py-px text-[11px] font-medium">Next</span>}
                          {s.minutes !== undefined && <span className="text-muted-foreground text-xs">· about {s.minutes} min</span>}
                        </label>
                        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">{s.body}</p>
                        {s.caution && (
                          <p className="mt-3 flex gap-2 rounded-lg border border-chart-3/60 bg-chart-3/10 px-3 py-2 text-sm">
                            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                            <span><strong>Careful:</strong> {s.caution}</span>
                          </p>
                        )}
                        {s.command && (
                          <div className="mt-3 overflow-hidden rounded-lg border">
                            <div className="bg-muted/50 flex items-center justify-between gap-2 border-b px-3 py-1.5">
                              <span className="text-muted-foreground text-xs">Command</span>
                              <button type="button" onClick={() => void copy(s)} aria-label={`Copy the command for step ${i + 1}`} className="focus-visible:ring-ring/50 hover:bg-accent text-muted-foreground hover:text-foreground flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none">
                                {copied === s.id ? <ClipboardCheck aria-hidden="true" className="size-3.5" /> : <Clipboard aria-hidden="true" className="size-3.5" />} {copied === s.id ? "Copied" : "Copy"}
                              </button>
                            </div>
                            <pre dir="ltr" tabIndex={0} aria-label={`Command for step ${i + 1}`} className="focus-visible:ring-ring/50 overflow-x-auto px-3 py-2.5 font-mono text-xs leading-relaxed outline-none focus-visible:ring-[3px] focus-visible:ring-inset">{s.command}</pre>
                          </div>
                        )}
                        {error?.id === s.id && <p role="alert" className="text-destructive mt-2 text-sm font-medium">{error.text}</p>}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>

            <div className="bg-background/90 sticky bottom-3 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 shadow-lg backdrop-blur">
              <p aria-live="polite" role={finished && !finished.ok ? "alert" : undefined} className={cn("flex items-center gap-2 text-sm", finished && !finished.ok && "text-destructive font-medium")}>
                {finished?.ok && <CircleCheck aria-hidden="true" className="size-4" />}
                {finished ? finished.text : next ? <>Next: <strong>{next.title}</strong></> : "Every step is done."}
              </p>
              <Button disabled={!!next || busy || finished?.ok === true} onClick={() => void complete()}>
                {busy && <Loader2 aria-hidden="true" className="animate-spin" />} Finish runbook
              </Button>
            </div>
          </>
        )}
      </StateView>
    </section>
  )
}

export { Runbook1, type Runbook1Data, type Runbook1Props, type Runbook1Step }
