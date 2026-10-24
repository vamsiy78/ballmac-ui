// Ballmac UI: Parallel Attempts. https://ui.ballmac.com/components/parallel-attempts
"use client"

import * as React from "react"
import { Check, CircleAlert, CircleDashed, CircleStop, Clock, Coins, FileDiff, Loader2, Star, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages, type Msg } from "@/lib/ballmac/i18n"

type AttemptStatus = "running" | "done" | "failed" | "stopped"

type Attempt = {
  id: string
  /** Name of the attempt, for example "Attempt A". */
  label: string
  /** The model or setup that produced it. */
  model?: string
  status: AttemptStatus
  /** What this attempt did or produced, in a sentence or two. */
  summary: string
  /** Lines added. */
  added?: number
  /** Lines removed. */
  removed?: number
  /** Files changed. */
  files?: number
  /** Time taken, already formatted, such as "2 min 4 s". */
  duration?: string
  /** Cost, already formatted, such as "$0.31". */
  cost?: string
  /** 0 to 100 while it is running. */
  progress?: number
  /** Tests that passed out of those that ran, for a code change. Shown as a bar and in words. */
  tests?: { passed: number; total: number }
}

const STATUS: Record<AttemptStatus, { icon: LucideIcon; fallback: string; tone: string }> = {
  running: { icon: Loader2, fallback: "Running", tone: "text-foreground" },
  done: { icon: Check, fallback: "Done", tone: "text-foreground" },
  failed: { icon: CircleAlert, fallback: "Failed", tone: "text-destructive" },
  stopped: { icon: CircleStop, fallback: "Stopped", tone: "text-muted-foreground" },
}

function statusText(msg: Msg, status: AttemptStatus) {
  return msg(`parallel-attempts.status.${status}`, STATUS[status].fallback)
}

const num = (n: number) => n.toLocaleString("en-US")

type ParallelAttemptsProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** The attempts to compare. */
  attempts: Attempt[]
  /** The chosen attempt id. Controlled. */
  value?: string | null
  /** The chosen attempt id for uncontrolled use. */
  defaultValue?: string | null
  /** Called when a finished attempt is picked. */
  onValueChange?: (id: string) => void
  /** Marks one attempt as the suggested one. */
  recommended?: string
  /** Text for the suggestion badge. */
  recommendedLabel?: string
  /** Called when the person confirms the picked attempt. Adds the confirm button. */
  onChoose?: (id: string) => void
  /** Text for the confirm button, which gets the attempt's name added. */
  chooseLabel?: string
  /** Heading read by assistive technology. */
  label?: string
  /** Show a line above the cards: how many attempts, and how many are done, running or failed. On by default. */
  summary?: boolean
}

/**
 * Several runs of the same task side by side, to compare and pick one. Each card is a native radio, so the arrow keys, Space and
 * the browser's own group behaviour work without extra code. Only finished attempts can be picked.
 */
function ParallelAttempts({
  attempts,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  recommended,
  recommendedLabel,
  onChoose,
  chooseLabel,
  label,
  summary = true,
  className,
  ...props
}: ParallelAttemptsProps) {
  const msg = useMessages()
  const name = React.useId()
  label ??= msg("parallel-attempts.label", "Attempts")
  recommendedLabel ??= msg("parallel-attempts.recommended", "Suggested")
  const [inner, setInner] = React.useState<string | null>(defaultValue)
  const value = valueProp !== undefined ? valueProp : inner
  const picked = attempts.find((a) => a.id === value && a.status === "done")

  function pick(id: string) {
    if (valueProp === undefined) setInner(id)
    onValueChange?.(id)
  }

  const count = (st: AttemptStatus) => attempts.filter((a) => a.status === st).length

  return (
    <div data-slot="parallel-attempts" className={cn("grid w-full gap-4", className)} {...props}>
      {summary && attempts.length > 0 && (
        <p data-slot="parallel-attempts-summary" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
          <span className="font-semibold text-foreground">{msg("parallel-attempts.count", "{count} attempts", { count: attempts.length })}</span>
          {count("done") > 0 && <span>{msg("parallel-attempts.doneCount", "{count} done", { count: count("done") })}</span>}
          {count("running") > 0 && <span>{msg("parallel-attempts.runningCount", "{count} running", { count: count("running") })}</span>}
          {count("failed") > 0 && <span className="font-medium text-destructive">{msg("parallel-attempts.failedCount", "{count} failed", { count: count("failed") })}</span>}
          {count("stopped") > 0 && <span>{msg("parallel-attempts.stoppedCount", "{count} stopped", { count: count("stopped") })}</span>}
        </p>
      )}
      <fieldset className="min-w-0">
        <legend className="sr-only">{label}</legend>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
          {attempts.map((a) => {
            const s = STATUS[a.status]
            const Icon = s.icon
            const selectable = a.status === "done"
            const total = (a.added ?? 0) + (a.removed ?? 0)
            const addedShare = total > 0 ? ((a.added ?? 0) / total) * 100 : 0
            return (
              <label
                key={a.id}
                data-status={a.status}
                className={cn(
                  "group/attempt relative flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground transition-[border-color,background-color,box-shadow] duration-150 motion-reduce:transition-none",
                  selectable ? "cursor-pointer hover:bg-accent/40" : "cursor-default opacity-90",
                  "has-[:checked]:border-foreground has-[:checked]:bg-accent/40 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50"
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={a.id}
                  checked={value === a.id}
                  disabled={!selectable}
                  onChange={() => pick(a.id)}
                  className="peer sr-only"
                  aria-describedby={`${name}-${a.id}`}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="truncate">{a.label}</span>
                      {recommended === a.id && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium">
                          <Star aria-hidden="true" className="size-3" /> {recommendedLabel}
                        </span>
                      )}
                    </p>
                    {a.model && <p className="truncate font-mono text-[11px] text-muted-foreground">{a.model}</p>}
                  </div>
                  <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-xs font-medium", s.tone)}>
                    <Icon aria-hidden="true" className={cn("size-3.5", a.status === "running" && "motion-safe:animate-spin")} style={a.status === "running" ? { animationPlayState: "var(--bm-ambient-state, running)" } : undefined} />
                    {statusText(msg, a.status)}
                  </span>
                </div>

                <p id={`${name}-${a.id}`} className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                  {a.summary}
                </p>

                {a.status === "running" && typeof a.progress === "number" && (
                  <div role="progressbar" aria-label={msg("parallel-attempts.progress", "{label} progress", { label: a.label })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(a.progress)} className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-foreground transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${Math.min(100, Math.max(0, a.progress))}%` }} />
                  </div>
                )}

                {total > 0 && (
                  <div className="grid gap-1.5">
                    <div aria-hidden="true" className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                      <span className="bg-chart-2" style={{ width: `${addedShare}%` }} />
                      <span className="bg-destructive/70" style={{ width: `${100 - addedShare}%` }} />
                    </div>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-xs tabular-nums">
                      <span>{msg("parallel-attempts.added", "{count} added", { count: `+${num(a.added ?? 0)}` })}</span>
                      <span>{msg("parallel-attempts.removed", "{count} removed", { count: `−${num(a.removed ?? 0)}` })}</span>
                      {typeof a.files === "number" && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <FileDiff aria-hidden="true" className="size-3" />
                          {msg("parallel-attempts.files", "{count} files", { count: num(a.files) })}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {a.tests && a.tests.total > 0 && (
                  <div className="grid gap-1.5">
                    <div role="meter" aria-label={msg("parallel-attempts.testsMeter", "{label} tests passing", { label: a.label })} aria-valuemin={0} aria-valuemax={a.tests.total} aria-valuenow={a.tests.passed} aria-valuetext={msg("parallel-attempts.tests", "{passed} of {total} tests pass", { passed: a.tests.passed, total: a.tests.total })} className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", a.tests.passed === a.tests.total ? "bg-chart-2" : "bg-destructive/70")} style={{ width: `${(a.tests.passed / a.tests.total) * 100}%` }} />
                    </div>
                    <p className={cn("text-xs tabular-nums", a.tests.passed < a.tests.total ? "font-medium text-destructive" : "text-muted-foreground")}>{msg("parallel-attempts.tests", "{passed} of {total} tests pass", { passed: a.tests.passed, total: a.tests.total })}</p>
                  </div>
                )}

                {(a.duration || a.cost) && (
                  <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-0.5 border-t pt-3 text-xs text-muted-foreground tabular-nums">
                    {a.duration && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock aria-hidden="true" className="size-3.5" />
                        {a.duration}
                      </span>
                    )}
                    {a.cost && (
                      <span className="inline-flex items-center gap-1.5">
                        <Coins aria-hidden="true" className="size-3.5" />
                        {a.cost}
                      </span>
                    )}
                  </p>
                )}

                {value === a.id && selectable && (
                  <span aria-hidden="true" className="absolute end-3 bottom-3 flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                    <Check className="size-3" />
                  </span>
                )}
                {!selectable && a.status !== "running" && <CircleDashed aria-hidden="true" className="sr-only" />}
              </label>
            )
          })}
        </div>
      </fieldset>

      {onChoose && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-[13px] text-muted-foreground">
            {picked ? msg("parallel-attempts.picked", "{label} is selected.", { label: picked.label }) : msg("parallel-attempts.hint", "Pick a finished attempt to continue with.")}
          </p>
          <button
            type="button"
            disabled={!picked}
            onClick={() => picked && onChoose(picked.id)}
            className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
          >
            {picked ? (chooseLabel ?? msg("parallel-attempts.choose", "Continue with {label}", { label: picked.label })).replace("{label}", picked.label) : (chooseLabel ?? msg("parallel-attempts.chooseNone", "Continue"))}
          </button>
        </div>
      )}
    </div>
  )
}

export { ParallelAttempts, type Attempt, type AttemptStatus, type ParallelAttemptsProps }
