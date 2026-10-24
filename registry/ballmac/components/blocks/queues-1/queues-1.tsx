// Ballmac UI: Queues 1. https://ui.ballmac.com/blocks/queues-1
"use client"

import * as React from "react"
import { CircleAlert, Loader2, Pause, Play, RotateCw, Trash2, TrendingUp } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Switch } from "@/components/ballmac/switch"
import { cn } from "@/lib/utils"

type Queues1FailedJob = {
  id: string
  /** What the job was, for example "Send invoice 4812". */
  name: string
  /** The error it ended with. */
  error: string
  attempts: number
  /** When it last failed, already formatted. */
  at: string
}

type Queues1Queue = {
  id: string
  name: string
  /** Jobs waiting. */
  depth: number
  /** Jobs arriving per minute. */
  inRate: number
  /** Jobs finished per minute. */
  outRate: number
  /** How long the oldest waiting job has waited, already formatted, such as "4 min". */
  oldest: string
  paused?: boolean
  /** Recent depth, oldest first, for the small chart. */
  series: number[]
  failed: Queues1FailedJob[]
}

type Queues1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    queues?: Queues1Queue[]
    title?: string
    /** The queue whose failed jobs are open at first. */
    defaultOpenId?: string
    /** Called when a queue is paused or resumed. Reject and it goes back with the message. */
    onPause?: (queueId: string, paused: boolean) => void | Promise<void>
    /** Called to run one failed job again, or every failed job in the queue when jobId is "all". */
    onRetryJobs?: (queueId: string, jobId: string | "all") => void | Promise<void>
    /** Called to throw a failed job away. */
    onDiscard?: (queueId: string, jobId: string) => void | Promise<void>
  }

const sample: Queues1Queue[] = [
  { id: "email", name: "email", depth: 1840, inRate: 420, outRate: 180, oldest: "9 min", series: [120, 180, 260, 410, 600, 880, 1100, 1350, 1580, 1840], failed: [{ id: "j1", name: "Send invoice 4812", error: "Connection to the mail provider timed out", attempts: 3, at: "2 min ago" }, { id: "j2", name: "Send receipt 9921", error: "Recipient address was rejected: mailbox full", attempts: 5, at: "11 min ago" }] },
  { id: "images", name: "images", depth: 36, inRate: 40, outRate: 44, oldest: "2 s", series: [30, 44, 28, 51, 40, 33, 47, 39, 31, 36], failed: [] },
  { id: "export", name: "export", depth: 4, inRate: 3, outRate: 3, oldest: "12 s", series: [2, 5, 3, 4, 6, 3, 4, 2, 5, 4], failed: [{ id: "j3", name: "Export customers for Acme", error: "Out of memory after 120,000 rows", attempts: 2, at: "1 h ago" }] },
  { id: "webhooks", name: "webhooks", depth: 0, inRate: 18, outRate: 18, oldest: "none", paused: true, series: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], failed: [] },
]

function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  const pts = values.map((v, i) => `${(i / Math.max(values.length - 1, 1)) * 100},${28 - (v / max) * 26}`).join(" ")
  return (
    <svg aria-hidden="true" viewBox="0 0 100 30" preserveAspectRatio="none" className="h-7 w-24 overflow-visible" style={{ direction: "ltr" }}>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  )
}

const num = (n: number) => n.toLocaleString("en-US")

/**
 * The queues behind a product: how many jobs wait in each, how fast they arrive and finish, how long the oldest has waited, and a queue that is filling up
 * faster than it drains called out in words. Open a queue to read its failed jobs and run them again, one or all, or throw one away. A queue can be paused.
 */
function Queues1({ queues: queuesProp = sample, title = "Job queues", defaultOpenId, onPause, onRetryJobs, onDiscard, state = "ready", onRetry, emptyState, errorState, className, ...props }: Queues1Props) {
  const id = React.useId()
  const [queues, setQueues] = React.useState<Queues1Queue[]>(queuesProp)
  React.useEffect(() => setQueues(queuesProp), [queuesProp])
  const [open, setOpen] = React.useState<string | null>(defaultOpenId ?? null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<{ ok: boolean; text: string } | null>(null)
  const view = state === "ready" && queues.length === 0 ? "empty" : state
  const opened = queues.find((q) => q.id === open)

  async function run(key: string, work: () => void | Promise<void>, done: () => void, ok: string) {
    setBusy(key)
    setNote(null)
    try {
      await work()
      done()
      setNote({ ok: true, text: ok })
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : "That did not go through. Nothing was changed." })
    } finally {
      setBusy(null)
    }
  }
  const patch = (qid: string, fn: (q: Queues1Queue) => Queues1Queue) => setQueues((l) => l.map((q) => (q.id === qid ? fn(q) : q)))
  const backing = (q: Queues1Queue) => !q.paused && q.inRate > q.outRate * 1.2 && q.depth > 100

  return (
    <section data-slot="queues-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-pretty">What is waiting, how fast it moves, and what failed.</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the queues" loading={<Skel />} empty={{ title: "No queues yet", description: "When your app starts a background queue, its depth and failures will show here.", ...emptyState }} error={{ title: "The queues could not be loaded", description: "No jobs were changed. Check your connection and try again.", ...errorState }}>
        <div className="relative overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <caption className="sr-only">{title}</caption>
            <thead className="bg-muted/40 text-muted-foreground text-xs">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">Queue</th>
                <th scope="col" className="px-3 py-2.5 text-end font-medium">Waiting</th>
                <th scope="col" className="px-3 py-2.5 text-end font-medium">In / out per min</th>
                <th scope="col" className="px-3 py-2.5 text-end font-medium">Oldest</th>
                <th scope="col" className="px-3 py-2.5 text-end font-medium">Failed</th>
                <th scope="col" className="px-4 py-2.5 text-end font-medium"><span className="sr-only">Paused</span></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {queues.map((q) => {
                const on = open === q.id
                return (
                  <tr key={q.id} data-queue={q.id} className={cn(on && "bg-muted/30")}>
                    <th scope="row" className="px-4 py-3 text-start font-normal">
                      <button type="button" aria-expanded={on} aria-controls={`${id}-detail`} onClick={() => { setOpen(on ? null : q.id); setNote(null) }} className="focus-visible:ring-ring/50 -m-1 flex items-center gap-3 rounded-md p-1 text-start outline-none focus-visible:ring-[3px]">
                        <span>
                          <span className="block font-mono text-sm font-medium" dir="ltr">{q.name}</span>
                          {q.paused ? <span className="text-muted-foreground block text-xs">Paused</span> : backing(q) ? (
                            <span className="text-foreground flex items-center gap-1 text-xs font-medium"><TrendingUp aria-hidden="true" className="text-chart-3 size-3" /> Backing up</span>
                          ) : <span className="text-muted-foreground block text-xs">Keeping up</span>}
                        </span>
                        <span className="text-muted-foreground hidden sm:block"><Spark values={q.series} /></span>
                      </button>
                    </th>
                    <td className="px-3 py-3 text-end font-medium tabular-nums">{num(q.depth)}</td>
                    <td className="text-muted-foreground px-3 py-3 text-end tabular-nums">{num(q.inRate)} / {num(q.outRate)}</td>
                    <td className="text-muted-foreground px-3 py-3 text-end tabular-nums">{q.oldest}</td>
                    <td className={cn("px-3 py-3 text-end tabular-nums", q.failed.length ? "text-destructive font-medium" : "text-muted-foreground")}>{q.failed.length}</td>
                    <td className="px-4 py-3 text-end">
                      <Switch aria-label={`Pause ${q.name}`} checked={!!q.paused} disabled={busy === q.id} onCheckedChange={(paused) => void run(q.id, () => onPause?.(q.id, paused), () => patch(q.id, (x) => ({ ...x, paused })), paused ? `${q.name} is paused. Jobs keep arriving and wait.` : `${q.name} is running again.`)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div id={`${id}-detail`} aria-live="polite" className="bg-card mt-4 rounded-xl border p-4 sm:p-5">
          {note && <p role={note.ok ? "status" : "alert"} className={cn("mb-3 text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}
          {opened ? (
            opened.failed.length ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-semibold tracking-tight"><CircleAlert aria-hidden="true" className="text-destructive size-4" /> {opened.failed.length} failed in <span className="font-mono" dir="ltr">{opened.name}</span></h2>
                  <Button size="sm" disabled={busy !== null} onClick={() => void run(`${opened.id}:all`, () => onRetryJobs?.(opened.id, "all"), () => patch(opened.id, (q) => ({ ...q, depth: q.depth + q.failed.length, failed: [] })), `All ${opened.failed.length} failed jobs were put back in ${opened.name}.`)}>
                    {busy === `${opened.id}:all` ? <Loader2 aria-hidden="true" className="animate-spin" /> : <RotateCw aria-hidden="true" />} Retry all
                  </Button>
                </div>
                <ul className="mt-3 divide-y rounded-lg border">
                  {opened.failed.map((j) => (
                    <li key={j.id} className="flex flex-wrap items-start justify-between gap-3 px-3 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{j.name}</p>
                        <p className="text-destructive mt-0.5 text-xs">{j.error}</p>
                        <p className="text-muted-foreground mt-0.5 text-xs">{j.attempts} attempts · failed {j.at}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" aria-label={`Retry ${j.name}`} disabled={busy !== null} onClick={() => void run(j.id, () => onRetryJobs?.(opened.id, j.id), () => patch(opened.id, (q) => ({ ...q, depth: q.depth + 1, failed: q.failed.filter((x) => x.id !== j.id) })), `${j.name} was put back in ${opened.name}.`)}>
                          <RotateCw aria-hidden="true" /> Retry
                        </Button>
                        <Button size="sm" variant="ghost" aria-label={`Discard ${j.name}`} disabled={busy !== null} onClick={() => void run(j.id, () => onDiscard?.(opened.id, j.id), () => patch(opened.id, (q) => ({ ...q, failed: q.failed.filter((x) => x.id !== j.id) })), `${j.name} was discarded.`)}>
                          <Trash2 aria-hidden="true" /> Discard
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-muted-foreground text-sm"><span className="font-mono" dir="ltr">{opened.name}</span> has no failed jobs.</p>
            )
          ) : (
            <p className="text-muted-foreground text-sm">Select a queue to read its failed jobs. {queues.reduce((n, q) => n + q.failed.length, 0)} failed in all.</p>
          )}
        </div>
      </StateView>
    </section>
  )
}

export { Queues1, type Queues1Props, type Queues1Queue, type Queues1FailedJob }
