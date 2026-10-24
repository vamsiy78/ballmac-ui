// Ballmac UI: Agent Queue. https://ui.ballmac.com/components/agent-queue
"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, Loader2, Pause, Play, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"
import { useLoopsPaused } from "@/lib/ballmac/motion"

type QueuePriority = "high" | "normal" | "low"

type QueueTask = {
  id: string
  title: string
  /** "running" tasks occupy a slot. "queued" ones wait in order. "paused" ones keep their place but do not start. */
  state: "running" | "queued" | "paused"
  priority?: QueuePriority
  /** 0 to 100 for a running task. */
  progress?: number
  /** Time left or start time, already formatted, such as "about 3 min" or "starts after #2". */
  eta?: string
  /** Which agent has it, or will take it. */
  agent?: string
}

type AgentQueueProps = Omit<React.ComponentProps<"section">, "title" | "onPause" | "onCancel"> & {
  tasks: QueueTask[]
  /** How many tasks may run at once. */
  slots?: number
  title?: string
  /** Called to move a waiting task to a new place among the waiting ones (0 is first). Reject and it goes back with the message. */
  onMove?: (id: string, toIndex: number) => void | Promise<void>
  /** Called to pause a task, or resume it when `paused` is false. */
  onPause?: (id: string, paused: boolean) => void | Promise<void>
  /** Called to cancel a task, after it has been confirmed. */
  onCancel?: (id: string) => void | Promise<void>
  /** Called when the priority of a waiting task is changed. */
  onPriority?: (id: string, priority: QueuePriority) => void | Promise<void>
}

const PRIORITIES: QueuePriority[] = ["high", "normal", "low"]
const PRIORITY_LABEL: Record<QueuePriority, string> = { high: "High", normal: "Normal", low: "Low" }

const iconButton = "flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none"

/**
 * What an agent has on its plate: the tasks running now (one per slot), and the ones waiting in the order they will start. Waiting tasks can be moved up and
 * down with real buttons (so it works from the keyboard and with a screen reader), given a priority, paused and cancelled. A cancel asks "Cancel this task?" first.
 * A move is shown at once and put back with the reason if it fails, and every change is announced.
 */
function AgentQueue({ tasks, slots = 3, title, onMove, onPause, onCancel, onPriority, className, ...props }: AgentQueueProps) {
  const msg = useMessages()
  const paused = useLoopsPaused()
  const id = React.useId()
  title ??= msg("agent-queue.title", "Queue")
  const [override, setOverride] = React.useState<string[] | null>(null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [confirm, setConfirm] = React.useState<string | null>(null)
  const [error, setError] = React.useState<{ id: string; text: string } | null>(null)
  const [announce, setAnnounce] = React.useState("")

  const running = tasks.filter((t) => t.state === "running")
  const base = tasks.filter((t) => t.state !== "running")
  const waiting = React.useMemo(() => {
    if (!override) return base
    const byId = new Map(base.map((t) => [t.id, t]))
    const ordered = override.map((x) => byId.get(x)).filter((t): t is QueueTask => !!t)
    return [...ordered, ...base.filter((t) => !override.includes(t.id))]
  }, [base, override])
  // A new list from the parent replaces any local order.
  const key = tasks.map((t) => `${t.id}:${t.state}`).join("|")
  React.useEffect(() => setOverride(null), [key])

  const label = (t: QueueTask) => msg(`agent-queue.priority.${t.priority ?? "normal"}`, PRIORITY_LABEL[t.priority ?? "normal"])

  async function run(taskId: string, fn: () => void | Promise<void>, ok: string, undo?: () => void) {
    setBusy(taskId)
    setError(null)
    try {
      await fn()
      setAnnounce(ok)
    } catch (e) {
      undo?.()
      setError({ id: taskId, text: e instanceof Error ? e.message : msg("agent-queue.failed", "That did not work. Nothing was changed.") })
    } finally {
      setBusy(null)
    }
  }
  function move(t: QueueTask, delta: number) {
    const ids = waiting.map((x) => x.id)
    const from = ids.indexOf(t.id)
    const to = from + delta
    if (to < 0 || to >= ids.length) return
    const next = [...ids]
    next.splice(to, 0, next.splice(from, 1)[0])
    setOverride(next)
    void run(t.id, () => onMove?.(t.id, to), msg("agent-queue.moved", "{title} moved to position {position}", { title: t.title, position: to + 1 }), () => setOverride(ids))
  }

  return (
    <section data-slot="agent-queue" aria-labelledby={`${id}-t`} className={cn("bg-card text-card-foreground grid gap-4 rounded-xl border p-4 sm:p-5", className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 id={`${id}-t`} className="text-sm font-semibold">{title}</h3>
        <p className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1" role="img" aria-label={msg("agent-queue.slotsLabel", "{busy} of {slots} slots in use", { busy: running.length, slots })}>
            {Array.from({ length: slots }, (_, i) => (
              <span key={i} aria-hidden="true" className={cn("size-2 rounded-full", i < running.length ? "bg-chart-2" : "bg-muted")} />
            ))}
          </span>
          <span className="tabular-nums">{msg("agent-queue.running", "{count} running", { count: running.length })}</span>
          <span className="tabular-nums">{msg("agent-queue.waiting", "{count} waiting", { count: waiting.length })}</span>
        </p>
      </div>

      {running.length > 0 && (
        <div className="grid gap-2">
          <h4 className="text-xs font-medium text-muted-foreground">{msg("agent-queue.runningNow", "Running now")}</h4>
          <ul className="grid gap-2">
            {running.map((t) => (
              <li key={t.id} className="grid gap-2 rounded-lg border px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Loader2 aria-hidden="true" className={cn("size-4 shrink-0 text-muted-foreground", !paused && "animate-spin")} />
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{t.title}</p>
                  {t.agent && <span className="hidden shrink-0 rounded-full border px-2 py-px text-[11px] text-muted-foreground sm:inline">{t.agent}</span>}
                  {onPause && (
                    <button type="button" aria-label={msg("agent-queue.pause", "Pause {title}", { title: t.title })} disabled={busy === t.id} onClick={() => void run(t.id, () => onPause(t.id, true), msg("agent-queue.paused", "{title} paused", { title: t.title }))} className={iconButton}>
                      <Pause aria-hidden="true" className="size-4" />
                    </button>
                  )}
                </div>
                {typeof t.progress === "number" && (
                  <div className="flex items-center gap-3">
                    <div role="progressbar" aria-label={t.title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(t.progress)} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-foreground transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${Math.min(100, Math.max(0, t.progress))}%` }} />
                    </div>
                    <span className="w-9 text-end font-mono text-xs tabular-nums text-muted-foreground">{Math.round(t.progress)}%</span>
                    {t.eta && <span className="hidden text-xs text-muted-foreground sm:inline">{t.eta}</span>}
                  </div>
                )}
                {error?.id === t.id && <p role="alert" className="text-sm font-medium text-destructive">{error.text}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-2">
        <h4 className="text-xs font-medium text-muted-foreground">{msg("agent-queue.upNext", "Up next")}</h4>
        {waiting.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">{msg("agent-queue.empty", "Nothing is waiting.")}</p>
        ) : (
          <ol className="grid gap-2">
            {waiting.map((t, i) => (
              <li key={t.id} data-state={t.state} className={cn("grid gap-2 rounded-lg border px-3 py-2.5", t.state === "paused" && "bg-muted/40")}>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[11px] tabular-nums text-muted-foreground">{i + 1}</span>
                  <p className="min-w-0 flex-1 text-sm">
                    <span className={cn("font-medium", t.state === "paused" && "text-muted-foreground")}>{t.title}</span>
                    {t.state === "paused" && <span className="ms-2 rounded-full border px-2 py-px align-middle text-[11px] text-muted-foreground">{msg("agent-queue.pausedChip", "Paused")}</span>}
                  </p>
                  {t.agent && <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{t.agent}</span>}
                  <div className="flex shrink-0 items-center">
                    {onMove && (
                      <>
                        <button type="button" aria-label={msg("agent-queue.up", "Move {title} up", { title: t.title })} disabled={i === 0 || busy === t.id} onClick={() => move(t, -1)} className={iconButton}><ArrowUp aria-hidden="true" className="size-4" /></button>
                        <button type="button" aria-label={msg("agent-queue.down", "Move {title} down", { title: t.title })} disabled={i === waiting.length - 1 || busy === t.id} onClick={() => move(t, 1)} className={iconButton}><ArrowDown aria-hidden="true" className="size-4" /></button>
                      </>
                    )}
                    {onPause && (
                      <button type="button" aria-label={t.state === "paused" ? msg("agent-queue.resume", "Resume {title}", { title: t.title }) : msg("agent-queue.pause", "Pause {title}", { title: t.title })} disabled={busy === t.id} onClick={() => void run(t.id, () => onPause(t.id, t.state !== "paused"), t.state === "paused" ? msg("agent-queue.resumed", "{title} resumed", { title: t.title }) : msg("agent-queue.paused", "{title} paused", { title: t.title }))} className={iconButton}>
                        {t.state === "paused" ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
                      </button>
                    )}
                    {onCancel && (
                      <button type="button" aria-label={msg("agent-queue.cancel", "Cancel {title}", { title: t.title })} disabled={busy === t.id} onClick={() => setConfirm(confirm === t.id ? null : t.id)} className={iconButton}><X aria-hidden="true" className="size-4" /></button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 ps-8 text-xs text-muted-foreground">
                  {onPriority ? (
                    <label className="flex items-center gap-1.5">
                      <span>{msg("agent-queue.priority", "Priority")}</span>
                      <select value={t.priority ?? "normal"} disabled={busy === t.id} aria-label={msg("agent-queue.priorityFor", "Priority of {title}", { title: t.title })} onChange={(e) => void run(t.id, () => onPriority(t.id, e.target.value as QueuePriority), msg("agent-queue.priorityDone", "{title} is now {priority} priority", { title: t.title, priority: msg(`agent-queue.priority.${e.target.value}`, PRIORITY_LABEL[e.target.value as QueuePriority]).toLowerCase() }))} className="h-7 rounded-md border bg-background px-1.5 text-xs text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                        {PRIORITIES.map((p) => <option key={p} value={p}>{msg(`agent-queue.priority.${p}`, PRIORITY_LABEL[p])}</option>)}
                      </select>
                    </label>
                  ) : (
                    t.priority && <span>{msg("agent-queue.priorityText", "{priority} priority", { priority: label(t) })}</span>
                  )}
                  {t.eta && <span>{t.eta}</span>}
                </div>
                {confirm === t.id && (
                  <div role="group" aria-label={msg("agent-queue.confirmLabel", "Confirm cancelling {title}", { title: t.title })} className="ms-8 flex flex-wrap items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm">
                    <span>{msg("agent-queue.confirm", "Cancel this task?")}</span>
                    <button type="button" onClick={() => { setConfirm(null); void run(t.id, () => onCancel?.(t.id), msg("agent-queue.cancelled", "{title} cancelled", { title: t.title })) }} className="h-7 rounded-md bg-foreground px-2.5 text-xs font-medium text-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">{msg("agent-queue.yes", "Yes, cancel it")}</button>
                    <button type="button" onClick={() => setConfirm(null)} className="h-7 rounded-md border bg-background px-2.5 text-xs font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">{msg("agent-queue.keep", "Keep it")}</button>
                  </div>
                )}
                {error?.id === t.id && <p role="alert" className="ps-8 text-sm font-medium text-destructive">{error.text}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
      <p aria-live="polite" className="sr-only">{announce}</p>
    </section>
  )
}

export { AgentQueue, type AgentQueueProps, type QueuePriority, type QueueTask }
