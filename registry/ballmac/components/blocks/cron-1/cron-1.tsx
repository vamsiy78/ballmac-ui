// Ballmac UI: Cron 1. https://ui.ballmac.com/blocks/cron-1
"use client"

import * as React from "react"
import { CircleCheck, CircleX, Clock, Loader2, Play } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ballmac/alert-dialog"
import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { Switch } from "@/components/ballmac/switch"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { cn } from "@/lib/utils"

type Cron1Job = {
  id: string
  name: string
  /** A five-field cron expression, for example "0 9 * * 1-5". */
  schedule: string
  /** Time zone the schedule is read in, such as "UTC". */
  timezone?: string
  enabled: boolean
  owner?: string
  /** What happened last time. */
  last?: { status: "success" | "failed" | "running"; at: string; duration?: string }
  /** The next few times it will run, already formatted. */
  next?: string[]
}

type Cron1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    jobs?: Cron1Job[]
    title?: string
    /** Called when a job is switched on or off. Reject and it goes back with the message. */
    onToggle?: (job: Cron1Job, enabled: boolean) => void | Promise<void>
    /** Called when someone confirms "Run now". */
    onRunNow?: (job: Cron1Job) => void | Promise<void>
  }

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const two = (n: number) => String(n).padStart(2, "0")

/**
 * Turns the common five-field cron expressions into a sentence, and says "A custom schedule" for the rest instead of guessing. Handles every N minutes or
 * hours, daily, weekdays, one weekday, and monthly on a day. Fixed text, so the server and the browser agree.
 */
function describeCron(expr: string): string {
  const f = expr.trim().split(/\s+/)
  if (f.length !== 5) return "A custom schedule"
  const [min, hour, dom, mon, dow] = f
  const at = (h: string, m: string) => `${two(Number(h))}:${two(Number(m))}`
  const num = /^\d+$/
  if (mon !== "*") return "A custom schedule"
  let m = min.match(/^\*\/(\d+)$/)
  if (m && hour === "*" && dom === "*" && dow === "*") return Number(m[1]) === 1 ? "Every minute" : `Every ${m[1]} minutes`
  m = hour.match(/^\*\/(\d+)$/)
  if (m && num.test(min) && dom === "*" && dow === "*") return `Every ${m[1]} hours at :${two(Number(min))}`
  if (min === "0" && hour === "*" && dom === "*" && dow === "*") return "Every hour"
  if (num.test(min) && num.test(hour) && dom === "*") {
    if (dow === "*") return `Every day at ${at(hour, min)}`
    if (dow === "1-5") return `Weekdays at ${at(hour, min)}`
    if (dow === "0,6" || dow === "6,0") return `Weekends at ${at(hour, min)}`
    if (num.test(dow)) return `Every ${DAYS[Number(dow) % 7]} at ${at(hour, min)}`
  }
  if (num.test(min) && num.test(hour) && num.test(dom) && dow === "*") return `On day ${dom} of every month at ${at(hour, min)}`
  return "A custom schedule"
}

const sample: Cron1Job[] = [
  { id: "c1", name: "Send the weekly digest", schedule: "0 9 * * 1", timezone: "UTC", enabled: true, owner: "Growth", last: { status: "success", at: "Mon 09:00", duration: "4 min 12 s" }, next: ["Mon 27 Oct, 09:00", "Mon 3 Nov, 09:00", "Mon 10 Nov, 09:00"] },
  { id: "c2", name: "Clean up expired sessions", schedule: "*/15 * * * *", timezone: "UTC", enabled: true, owner: "Platform", last: { status: "success", at: "14:45", duration: "3 s" }, next: ["15:00", "15:15", "15:30"] },
  { id: "c3", name: "Rebuild the search index", schedule: "30 2 * * *", timezone: "UTC", enabled: true, owner: "Search", last: { status: "failed", at: "Today 02:30", duration: "11 min" }, next: ["Tomorrow 02:30", "Sat 25 Oct, 02:30"] },
  { id: "c4", name: "Back up the database", schedule: "0 */6 * * *", timezone: "UTC", enabled: true, owner: "Platform", last: { status: "running", at: "12:00" }, next: ["18:00", "Tomorrow 00:00"] },
  { id: "c5", name: "Send invoices", schedule: "0 8 1 * *", timezone: "UTC", enabled: false, owner: "Finance", last: { status: "success", at: "1 Oct, 08:00", duration: "6 min" }, next: [] },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  )
}

/**
 * The scheduled jobs of a product: each with its schedule in plain words (and the cron expression beside it), a switch, what happened last time written out,
 * the next runs, and a Run now button that asks first. A switch that fails to save goes back with the reason.
 */
function Cron1({ jobs: jobsProp = sample, title = "Scheduled jobs", onToggle, onRunNow, state = "ready", onRetry, emptyState, errorState, className, ...props }: Cron1Props) {
  const id = React.useId()
  const [jobs, setJobs] = React.useState<Cron1Job[]>(jobsProp)
  React.useEffect(() => setJobs(jobsProp), [jobsProp])
  const [confirm, setConfirm] = React.useState<Cron1Job | null>(null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<{ id: string; ok: boolean; text: string } | null>(null)
  const ret = useReturnFocus(!!confirm)
  const view = state === "ready" && jobs.length === 0 ? "empty" : state

  async function toggle(j: Cron1Job, enabled: boolean) {
    setBusy(j.id)
    setNote(null)
    setJobs((l) => l.map((x) => (x.id === j.id ? { ...x, enabled } : x)))
    try {
      await onToggle?.(j, enabled)
    } catch (e) {
      setJobs((l) => l.map((x) => (x.id === j.id ? j : x)))
      setNote({ id: j.id, ok: false, text: e instanceof Error ? e.message : `${j.name} could not be changed, so it was put back as it was.` })
    } finally {
      setBusy(null)
    }
  }
  async function runNow(j: Cron1Job) {
    setBusy(j.id)
    setNote(null)
    try {
      await onRunNow?.(j)
      setJobs((l) => l.map((x) => (x.id === j.id ? { ...x, last: { status: "running", at: "now" } } : x)))
      setNote({ id: j.id, ok: true, text: `${j.name} started.` })
    } catch (e) {
      setNote({ id: j.id, ok: false, text: e instanceof Error ? e.message : `${j.name} could not be started.` })
    } finally {
      setBusy(null)
    }
  }

  return (
    <section data-slot="cron-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-pretty">Everything that runs on a timer, when it runs next, and how the last run went.</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading scheduled jobs" loading={<Skel />} empty={{ title: "No scheduled jobs", description: "Jobs that run on a schedule, like digests and backups, will be listed here.", ...emptyState }} error={{ title: "Scheduled jobs could not be loaded", description: "Nothing was changed or started. Check your connection and try again.", ...errorState }}>
        <ul className="grid gap-3">
          {jobs.map((j) => {
            const l = j.last
            return (
              <li key={j.id} data-enabled={j.enabled} className={cn("bg-card rounded-xl border p-4 sm:p-5", !j.enabled && "bg-muted/30")}>
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                  <div className="min-w-0">
                    <p className="font-medium">{j.name}</p>
                    <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 text-sm">
                      <Clock aria-hidden="true" className="size-3.5" />
                      {describeCron(j.schedule)}
                      <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs" dir="ltr">{j.schedule}</code>
                      {j.timezone && <span className="text-xs">{j.timezone}</span>}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      {l ? (
                        <span className={cn("inline-flex items-center gap-1.5", l.status === "failed" && "text-destructive font-medium")}>
                          {l.status === "success" ? <CircleCheck aria-hidden="true" className="size-3.5" /> : l.status === "failed" ? <CircleX aria-hidden="true" className="size-3.5" /> : <Loader2 aria-hidden="true" className="size-3.5 motion-safe:animate-spin" style={{ animationPlayState: "var(--bm-ambient-state, running)" }} />}
                          {l.status === "success" ? "Last run succeeded" : l.status === "failed" ? "Last run failed" : "Running now"} · {l.at}
                          {l.duration && ` · ${l.duration}`}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Never run</span>
                      )}
                      {j.owner && <span className="text-muted-foreground">Owner: {j.owner}</span>}
                    </p>
                    {j.enabled && j.next && j.next.length > 0 && <p className="text-muted-foreground mt-1 text-xs">Next: {j.next.slice(0, 3).join(" · ")}</p>}
                    {!j.enabled && <p className="text-muted-foreground mt-1 text-xs">Switched off. It will not run until it is turned back on.</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" disabled={busy === j.id || l?.status === "running"} onClick={() => setConfirm(j)} aria-label={`Run ${j.name} now`}>
                      <Play aria-hidden="true" className="rtl:-scale-x-100" /> Run now
                    </Button>
                    <Switch aria-label={`${j.name} is on`} checked={j.enabled} disabled={busy === j.id} onCheckedChange={(v) => void toggle(j, v)} />
                  </div>
                </div>
                {note?.id === j.id && <p role={note.ok ? "status" : "alert"} className={cn("mt-3 text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}
              </li>
            )
          })}
        </ul>
      </StateView>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent {...ret}>
          <AlertDialogHeader>
            <AlertDialogTitle>Run {confirm?.name} now?</AlertDialogTitle>
            <AlertDialogDescription>It starts straight away, in addition to its schedule ({confirm ? describeCron(confirm.schedule).toLowerCase() : ""}).</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirm && void runNow(confirm)}>Run now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export { Cron1, describeCron, type Cron1Job, type Cron1Props }
