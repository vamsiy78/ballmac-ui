// Ballmac UI: Agent Plan. https://ui.ballmac.com/components/agent-plan
"use client"

import * as React from "react"
import { AlertCircle, Check, ChevronRight, Circle, Loader2, MinusCircle, RotateCw } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { useMessages } from "@/lib/ballmac/i18n"

type PlanStatus = "pending" | "running" | "done" | "failed" | "skipped"

type PlanStep = {
  /** Unique id within the plan. */
  id: string
  /** What the agent does in this step. */
  title: string
  /** One line of context under the title. */
  description?: string
  /** Current state of the step. */
  status: PlanStatus
  /** How long it took or has taken, already formatted, such as "4.2s". */
  duration?: string
  /** Extra content shown when the step is expanded: output, logs, a diff. */
  detail?: React.ReactNode
  /** Why the step failed. Shown in words under the title. */
  error?: string
  /** Nested steps. */
  steps?: PlanStep[]
}

const STATUS_WORD: Record<PlanStatus, string> = {
  pending: "Pending",
  running: "Running",
  done: "Done",
  failed: "Failed",
  skipped: "Skipped",
}

/** Every step, parents before their substeps. */
function flatten(steps: PlanStep[]): PlanStep[] {
  return steps.flatMap((s) => [s, ...(s.steps ? flatten(s.steps) : [])])
}

type AgentPlanProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** The plan's steps, in order. Steps can nest one more level through `steps`. */
  steps: PlanStep[]
  /** Heading of the plan. */
  title?: string
  /** A sentence about the goal, under the heading. */
  description?: string
  /** Ids of expanded steps (controlled). */
  expanded?: string[]
  /** Called with the new list of expanded step ids. */
  onExpandedChange?: (expanded: string[]) => void
  /** Called when the retry button of a failed step is pressed. The button only shows when this is set. */
  onRetry?: (step: PlanStep) => void
  /** Content on the right of the heading, such as a Stop button. */
  actions?: React.ReactNode
}

function StatusIcon({ status, reduce }: { status: PlanStatus; reduce: boolean | null }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background transition-colors duration-200 motion-reduce:transition-none",
        status === "done" && "border-transparent bg-foreground text-background",
        status === "running" && "border-foreground",
        status === "failed" && "border-destructive text-destructive",
        status === "skipped" && "border-dashed text-muted-foreground",
        status === "pending" && "text-muted-foreground"
      )}
    >
      {status === "done" && (
        <motion.span
          initial={reduce ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="flex"
        >
          <Check className="size-3.5" strokeWidth={3} />
        </motion.span>
      )}
      {status === "running" && <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />}
      {status === "failed" && <AlertCircle className="size-3.5" />}
      {status === "skipped" && <MinusCircle className="size-3.5" />}
      {status === "pending" && <Circle className="size-1.5 fill-current" />}
    </span>
  )
}

function AgentPlan({
  steps,
  title,
  description,
  expanded: expandedProp,
  onExpandedChange,
  onRetry,
  actions,
  className,
  ...props
}: AgentPlanProps) {
  const msg = useMessages()
  title ??= msg("agent-plan.title", "Plan")
  const reduce = useReducedMotion()
  const baseId = React.useId()
  const everyStep = React.useMemo(() => flatten(steps), [steps])
  // Progress counts the units of work: steps without substeps.
  const all = React.useMemo(() => everyStep.filter((s) => !s.steps || s.steps.length === 0), [everyStep])
  const [internal, setInternal] = React.useState<string[]>(() =>
    everyStep.filter((s) => s.detail && (s.status === "running" || s.status === "failed")).map((s) => s.id)
  )
  const expanded = expandedProp ?? internal
  const total = all.length
  const done = all.filter((s) => s.status === "done").length
  const failed = all.filter((s) => s.status === "failed").length
  const current = everyStep.find((s) => s.status === "running")
  const finished = total > 0 && all.every((s) => s.status === "done" || s.status === "skipped")

  function toggle(id: string) {
    const next = expanded.includes(id) ? expanded.filter((x) => x !== id) : [...expanded, id]
    setInternal(next)
    onExpandedChange?.(next)
  }

  const summary = finished
    ? "Plan complete"
    : current
      ? `Working on: ${current.title}`
      : failed
        ? `${failed} step${failed === 1 ? "" : "s"} failed`
        : `${done} of ${total} steps done`

  function renderStep(step: PlanStep, depth: number, isLast: boolean) {
    const open = expanded.includes(step.id)
    const expandable = !!step.detail
    const panelId = `${baseId}-${step.id}`
    const body = (
      <>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <span
              className={cn(
                "text-sm leading-6 font-medium",
                step.status === "pending" || step.status === "skipped" ? "text-muted-foreground" : "text-foreground",
                step.status === "skipped" && "line-through decoration-muted-foreground/60"
              )}
            >
              {step.title}
            </span>
            {(step.status === "running" || step.status === "failed") && (
              <span
                className={cn(
                  "rounded-full border px-1.5 py-px text-[11px] leading-4 font-medium text-foreground",
                  step.status === "failed" && "border-destructive/40 bg-destructive/10"
                )}
              >
                {STATUS_WORD[step.status]}
              </span>
            )}
            {step.duration && (
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{step.duration}</span>
            )}
          </span>
          {step.description && <span className="text-[13px] leading-5 text-muted-foreground">{step.description}</span>}
        </span>
        {expandable && (
          <ChevronRight
            aria-hidden="true"
            className={cn(
              "mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
              open ? "rotate-90" : "rtl:rotate-180"
            )}
          />
        )}
      </>
    )
    return (
      <li key={step.id} data-status={step.status} className="relative flex gap-3 pb-4 last:pb-0">
        {!isLast && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-6 bottom-0 start-3 -ms-px w-0.5 rounded-full",
              step.status === "done" ? "bg-foreground/80" : "bg-border"
            )}
          />
        )}
        <StatusIcon status={step.status} reduce={reduce} />
        <div className="min-w-0 flex-1">
          {expandable ? (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => toggle(step.id)}
              className="-my-px flex w-full items-start gap-2 rounded-md text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <span className="sr-only">{`${STATUS_WORD[step.status]}:`}</span>{" "}
              {body}
            </button>
          ) : (
            <div className="flex items-start gap-2">
              <span className="sr-only">{`${STATUS_WORD[step.status]}:`}</span>{" "}
              {body}
            </div>
          )}
          {step.error && step.status === "failed" && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-[13px] text-foreground">
              <AlertCircle aria-hidden="true" className="size-3.5 shrink-0 text-destructive" />
              <span className="min-w-0 flex-1">{step.error}</span>
              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(step)}
                  aria-label={msg("agent-plan.retry", "Retry {title}", { title: step.title })}
                  className="inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2 text-xs font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <RotateCw aria-hidden="true" className="size-3" />
                  {msg("agent-plan.retry", "Retry")}
                </button>
              )}
            </div>
          )}
          <AnimatePresence initial={false}>
            {expandable && open && (
              <motion.div
                id={panelId}
                key="detail"
                initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-[13px] leading-5 text-foreground">
                  {step.detail}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {step.steps && step.steps.length > 0 && (
            <ol className="mt-3 list-none">{step.steps.map((s, i) => renderStep(s, depth + 1, i === step.steps!.length - 1))}</ol>
          )}
        </div>
      </li>
    )
  }

  return (
    <section
      data-slot="agent-plan"
      aria-label={title}
      className={cn("w-full rounded-xl border bg-card p-4 text-card-foreground sm:p-5", className)}
      {...props}
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </header>
      <div className="mb-4 flex items-center gap-3">
        <div
          role="progressbar"
          aria-label={msg("agent-plan.progress", "{title} progress", { title })}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          aria-valuetext={`${done} of ${total} steps done`}
          className="flex h-1.5 flex-1 gap-0.5 overflow-hidden rounded-full"
        >
          {all.map((s) => (
            <span
              key={s.id}
              aria-hidden="true"
              className={cn(
                "h-full flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none",
                s.status === "done" && "bg-foreground",
                s.status === "running" && "animate-pulse bg-foreground/50 motion-reduce:animate-none",
                s.status === "failed" && "bg-destructive",
                (s.status === "pending" || s.status === "skipped") && "bg-muted"
              )}
            />
          ))}
        </div>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {done}/{total}
        </span>
      </div>
      <ol className="list-none">{steps.map((s, i) => renderStep(s, 0, i === steps.length - 1))}</ol>
      <p className="sr-only" role="status" aria-live="polite">
        {summary}
      </p>
    </section>
  )
}

export { AgentPlan, type AgentPlanProps, type PlanStep, type PlanStatus }
