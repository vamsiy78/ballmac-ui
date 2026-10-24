// Ballmac UI: Plan Tracker. https://ui.ballmac.com/components/plan-tracker
"use client"

import * as React from "react"
import { Ban, Check, CircleAlert, CircleDashed, Loader2, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"
import { useLoopsPaused } from "@/lib/ballmac/motion"

type PlanStatus = "todo" | "doing" | "done" | "skipped" | "blocked"

type PlanStep = {
  id: string
  title: string
  status: PlanStatus
  /** "added" for a step the agent put in after the plan was made. */
  origin?: "planned" | "added"
  /** How long it was expected to take, in minutes. */
  estimate?: number
  /** How long it has taken so far, in minutes. */
  actual?: number
  /** A line under the title: what it is doing, why it was skipped, what blocks it. */
  note?: string
}

type PlanTrackerProps = Omit<React.ComponentProps<"section">, "title"> & {
  steps: PlanStep[]
  /** Heading. */
  title?: string
}

const STATUS = {
  todo: { icon: CircleDashed, label: "To do" },
  doing: { icon: Loader2, label: "In progress" },
  done: { icon: Check, label: "Done" },
  skipped: { icon: Ban, label: "Skipped" },
  blocked: { icon: CircleAlert, label: "Blocked" },
} as const

/** 0.4 → "under 1 min", 3 → "3 min", 4.5 → "4.5 min". */
function formatMinutes(m: number) {
  if (m < 1) return "under 1 min"
  return `${+m.toFixed(1)} min`
}

/** Minutes the plan still needs: steps not started, plus what is left of the one in progress. Steps with no estimate count as nothing. */
function remainingMinutes(steps: PlanStep[]) {
  return steps.reduce((n, s) => {
    if (s.status === "todo") return n + (s.estimate ?? 0)
    if (s.status === "doing") return n + Math.max(0, (s.estimate ?? 0) - (s.actual ?? 0))
    return n
  }, 0)
}

/**
 * An agent's plan against what actually happened: every step with its state in words, how long it was expected to take and how long it has taken, a bar
 * of the whole plan, and an honest note when the plan changed (steps the agent added, steps it skipped). A step that runs well over its estimate says
 * by how much. It is a plain list, so it reads in order and needs no keyboard handling of its own.
 */
function PlanTracker({ steps, title, className, ...props }: PlanTrackerProps) {
  const msg = useMessages()
  const paused = useLoopsPaused()
  const id = React.useId()
  title ??= msg("plan-tracker.title", "Plan")
  const skipped = steps.filter((s) => s.status === "skipped").length
  const added = steps.filter((s) => s.origin === "added").length
  const done = steps.filter((s) => s.status === "done").length
  const counted = steps.length - skipped
  const left = remainingMinutes(steps)
  const finished = counted > 0 && done === counted
  const spoken = msg("plan-tracker.spoken", "{done} of {total} steps done", { done, total: counted })

  return (
    <section data-slot="plan-tracker" aria-labelledby={`${id}-t`} className={cn("bg-card text-card-foreground grid gap-4 rounded-xl border p-4 sm:p-5", className)} {...props}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 id={`${id}-t`} className="text-sm font-semibold">{title}</h3>
        <p className="text-xs tabular-nums text-muted-foreground">
          {spoken}
          {!finished && left > 0 ? ` · ${msg("plan-tracker.left", "about {time} left", { time: formatMinutes(left) })}` : ""}
          {finished ? ` · ${msg("plan-tracker.complete", "complete")}` : ""}
        </p>
      </div>

      <div role="progressbar" aria-labelledby={`${id}-t`} aria-valuemin={0} aria-valuemax={counted} aria-valuenow={done} aria-valuetext={spoken} className="flex h-1.5 gap-0.5">
        {steps.map((s) => (
          <span key={s.id} aria-hidden="true" className={cn("h-full flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none", s.status === "done" && "bg-foreground", s.status === "doing" && "bg-chart-1", s.status === "blocked" && "bg-destructive", s.status === "todo" && "bg-muted", s.status === "skipped" && "bg-[repeating-linear-gradient(135deg,var(--muted-foreground)_0_2px,transparent_2px_5px)] opacity-40", s.status === "doing" && !paused && "animate-pulse")} />
        ))}
      </div>

      {(added > 0 || skipped > 0) && (
        <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{msg("plan-tracker.changed", "The plan changed")}</span>
          {added > 0 && <span>{msg("plan-tracker.added", "{count} added", { count: added })}</span>}
          {skipped > 0 && <span>{msg("plan-tracker.skipped", "{count} skipped", { count: skipped })}</span>}
        </p>
      )}

      <ol className="grid gap-1">
        {steps.map((s, i) => {
          const S = STATUS[s.status]
          const over = s.estimate !== undefined && s.actual !== undefined && s.actual > s.estimate * 1.25 && s.actual - s.estimate >= 0.5
          return (
            <li key={s.id} data-status={s.status} className={cn("grid grid-cols-[1.5rem_1fr_auto] items-start gap-x-3 rounded-lg px-2 py-2", s.status === "doing" && "bg-accent/50",)}>
              <span aria-hidden="true" className={cn("mt-0.5 flex size-6 items-center justify-center rounded-full border text-[11px] tabular-nums", s.status === "done" && "border-foreground bg-foreground text-background", s.status === "doing" && "border-foreground", s.status === "blocked" && "border-destructive text-destructive", (s.status === "todo" || s.status === "skipped") && "text-muted-foreground")}>
                {s.status === "todo" ? i + 1 : <S.icon className={cn("size-3.5", s.status === "doing" && !paused && "animate-spin")} />}
              </span>
              <div className="min-w-0">
                <p className={cn("text-sm leading-snug text-pretty", s.status === "skipped" && "text-muted-foreground line-through", s.status === "todo" && "text-foreground/80")}>
                  <span className="sr-only">{msg(`plan-tracker.status.${s.status}`, S.label)}: </span>
                  {s.title}
                  {s.origin === "added" && <span className="ms-2 inline-flex items-center gap-1 rounded-full border px-1.5 py-px align-middle text-[10px] font-medium text-muted-foreground"><Plus aria-hidden="true" className="size-2.5" />{msg("plan-tracker.addedTag", "Added by the agent")}</span>}
                </p>
                {s.note && <p className={cn("mt-0.5 text-xs leading-snug text-pretty", s.status === "blocked" ? "font-medium text-destructive" : "text-muted-foreground")}>{s.note}</p>}
                {(s.status === "doing" || s.status === "blocked") && <p className="mt-1 text-[11px] font-medium text-foreground">{msg(`plan-tracker.status.${s.status}`, S.label)}</p>}
              </div>
              <p className="text-end text-xs tabular-nums text-muted-foreground">
                {s.actual !== undefined && s.status !== "todo" && s.status !== "skipped" ? (
                  <>
                    <span className={cn(over && "font-medium text-destructive")}>{formatMinutes(s.actual)}</span>
                    {s.estimate !== undefined && <span> / {formatMinutes(s.estimate)}</span>}
                    {over && s.estimate !== undefined && <span className="block font-medium text-destructive">{msg("plan-tracker.over", "over by {time}", { time: formatMinutes(s.actual - s.estimate) })}</span>}
                  </>
                ) : s.estimate !== undefined && s.status !== "skipped" ? (
                  <span>{msg("plan-tracker.expected", "expected {time}", { time: formatMinutes(s.estimate) })}</span>
                ) : null}
              </p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export { PlanTracker, formatMinutes, remainingMinutes, type PlanStatus, type PlanStep, type PlanTrackerProps }
