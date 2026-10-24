// Ballmac UI: Pipeline 1. https://ui.ballmac.com/blocks/pipeline-1
"use client"

import * as React from "react"
import { Check, ChevronRight, CircleDashed, CircleX, GitCommitHorizontal, Hand, Loader2, Minus, RotateCw, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Pipeline1StageStatus = "passed" | "running" | "failed" | "waiting" | "pending" | "skipped"

type Pipeline1Stage = {
  id: string
  /** For example "Unit tests". */
  name: string
  status: Pipeline1StageStatus
  /** How long it took, already formatted, such as "1 min 12 s". */
  duration?: string
  /** Lines of output, shown when the stage is opened. */
  log?: string[]
  /** For a waiting stage: who needs to approve it. */
  approver?: string
}

type Pipeline1Run = {
  /** The branch, for example "main". */
  branch: string
  /** A short commit id. */
  commit: string
  /** The commit message. */
  message: string
  author: string
  stages: Pipeline1Stage[]
}

type Pipeline1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    run?: Pipeline1Run | null
    title?: string
    /** The stage whose log is open at first. */
    defaultOpenId?: string
    /** Called when the approval gate is approved. Reject and the stage stays waiting with the message. */
    onApprove?: (stageId: string) => void | Promise<void>
    /** Called to run a failed stage and the ones after it again. */
    onRerun?: (stageId: string) => void | Promise<void>
  }

const STATUS: Record<Pipeline1StageStatus, { icon: LucideIcon; label: string; tone: string }> = {
  passed: { icon: Check, label: "Passed", tone: "bg-foreground text-background border-foreground" },
  running: { icon: Loader2, label: "Running", tone: "border-foreground" },
  failed: { icon: CircleX, label: "Failed", tone: "bg-destructive text-white border-destructive" },
  waiting: { icon: Hand, label: "Waiting for approval", tone: "border-chart-3 border-dashed" },
  pending: { icon: CircleDashed, label: "Not started", tone: "text-muted-foreground" },
  skipped: { icon: Minus, label: "Skipped", tone: "text-muted-foreground" },
}

const sample: Pipeline1Run = {
  branch: "main",
  commit: "a41f9c2",
  message: "Retry the invoice export with backoff",
  author: "Priya Shah",
  stages: [
    { id: "build", name: "Build", status: "passed", duration: "1 min 48 s", log: ["$ pnpm install --frozen-lockfile", "Lockfile is up to date, resolution step is skipped", "$ pnpm build", "✓ Compiled successfully in 41.2s", "✓ 214 pages generated"] },
    { id: "test", name: "Tests", status: "passed", duration: "2 min 05 s", log: ["$ pnpm test", "Test Files  84 passed (84)", "Tests  612 passed (612)"] },
    { id: "staging", name: "Deploy to staging", status: "passed", duration: "38 s", log: ["Uploading 1,204 files", "Deployed to https://staging.acme.example", "Health check passed (200)"] },
    { id: "gate", name: "Approve production", status: "waiting", approver: "Priya Shah or Noor Haddad" },
    { id: "prod", name: "Deploy to production", status: "pending" },
  ],
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <Skeleton className="h-20 rounded-xl" />
      <div className="grid gap-3 md:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

/**
 * One run of a deploy pipeline: the commit, then each stage as a step with its status written out, how long it took and its log one click away. A stage that
 * needs a person shows who and an Approve button; a failed stage offers to run again from there. The log is code, so it stays left to right.
 */
function Pipeline1({ run: runProp = sample, title = "Deploy pipeline", defaultOpenId, onApprove, onRerun, state = "ready", onRetry, emptyState, errorState, className, ...props }: Pipeline1Props) {
  const id = React.useId()
  const [run, setRun] = React.useState<Pipeline1Run | null>(runProp)
  React.useEffect(() => setRun(runProp), [runProp])
  const [open, setOpen] = React.useState<string | null>(defaultOpenId ?? null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<{ id: string; text: string } | null>(null)
  const view = state === "ready" && !run ? "empty" : state
  const opened = run?.stages.find((s) => s.id === open)

  async function act(stage: Pipeline1Stage, kind: "approve" | "rerun") {
    setBusy(stage.id)
    setError(null)
    try {
      await (kind === "approve" ? onApprove?.(stage.id) : onRerun?.(stage.id))
      setRun((r) => {
        if (!r) return r
        const at = r.stages.findIndex((s) => s.id === stage.id)
        return { ...r, stages: r.stages.map((s, i) => (i === at ? { ...s, status: kind === "approve" ? "passed" : "running" } : kind === "rerun" && i > at ? { ...s, status: "pending" } : kind === "approve" && i === at + 1 ? { ...s, status: "running" } : s)) }
      })
    } catch (e) {
      setError({ id: stage.id, text: e instanceof Error ? e.message : `${stage.name} could not be ${kind === "approve" ? "approved" : "run again"}. It is as it was.` })
    } finally {
      setBusy(null)
    }
  }

  return (
    <section data-slot="pipeline-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-pretty">Every stage between a commit and production, with its log one click away.</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the pipeline" loading={<Skel />} empty={{ title: "No runs yet", description: "Push a commit and its pipeline will appear here, stage by stage.", ...emptyState }} error={{ title: "The pipeline could not be loaded", description: "Nothing was deployed or changed. Check your connection and try again.", ...errorState }}>
        {run && (
          <>
            <div className="bg-card flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border p-4">
              <GitCommitHorizontal aria-hidden="true" className="text-muted-foreground size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{run.message}</p>
                <p className="text-muted-foreground text-xs"><span className="font-mono" dir="ltr">{run.branch} · {run.commit}</span> · {run.author}</p>
              </div>
            </div>

            <ol aria-label="Stages" className="mt-4 grid gap-3 md:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ "--n": run.stages.length } as React.CSSProperties}>
              {run.stages.map((s, i) => {
                const st = STATUS[s.status]
                const Icon = st.icon
                const on = open === s.id
                return (
                  <li key={s.id} data-status={s.status} className="relative flex flex-col">
                    {(() => {
                      const inner = (
                        <>
                          <span className="flex items-center gap-2">
                            <span aria-hidden="true" className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border", st.tone)}>
                              <Icon className={cn("size-3.5", s.status === "running" && "motion-safe:animate-spin")} style={s.status === "running" ? { animationPlayState: "var(--bm-ambient-state, running)" } : undefined} />
                            </span>
                            <span className="text-muted-foreground font-mono text-[11px] tabular-nums">{i + 1}</span>
                          </span>
                          <span className="text-sm leading-snug font-medium">{s.name}</span>
                          <span className={cn("text-xs", s.status === "failed" ? "text-destructive font-medium" : "text-muted-foreground")}>
                            {st.label}
                            {s.duration && <span className="tabular-nums"> · {s.duration}</span>}
                          </span>
                        </>
                      )
                      const box = "bg-card flex w-full flex-1 flex-col gap-2.5 rounded-xl border p-4 text-start"
                      // Only a stage with a log is a button; the others are plain boxes, so nothing is focusable that does nothing.
                      return s.log?.length ? (
                        <button type="button" aria-expanded={on} aria-controls={`${id}-log`} onClick={() => setOpen(on ? null : s.id)} className={cn(box, "hover:bg-accent/40 focus-visible:ring-ring/50 outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", on && "border-foreground bg-accent/40")}>
                          {inner}
                        </button>
                      ) : (
                        <div className={box}>{inner}</div>
                      )
                    })()}
                    {s.status === "waiting" && (
                      <div className="mt-2 grid gap-1.5">
                        {s.approver && <p className="text-muted-foreground text-xs">Needs {s.approver}.</p>}
                        <Button size="sm" disabled={busy === s.id} onClick={() => void act(s, "approve")}>
                          {busy === s.id && <Loader2 aria-hidden="true" className="animate-spin" />} Approve {s.name.replace(/^Approve /i, "").toLowerCase()}
                        </Button>
                      </div>
                    )}
                    {s.status === "failed" && (
                      <Button size="sm" variant="outline" className="mt-2" disabled={busy === s.id} onClick={() => void act(s, "rerun")}>
                        <RotateCw aria-hidden="true" /> Run again from here
                      </Button>
                    )}
                    {error?.id === s.id && <p role="alert" className="text-destructive mt-2 text-xs font-medium">{error.text}</p>}
                    {i < run.stages.length - 1 && <ChevronRight aria-hidden="true" className="text-muted-foreground absolute top-9 -end-[1.15rem] hidden size-4 md:block rtl:rotate-180" />}
                  </li>
                )
              })}
            </ol>

            <div id={`${id}-log`} aria-live="polite" className="mt-4">
              {opened?.log?.length ? (
                <div className="overflow-hidden rounded-xl border">
                  <p className="bg-muted/50 text-muted-foreground border-b px-4 py-2 text-xs font-medium">{opened.name}: log</p>
                  <pre dir="ltr" className="bg-card max-h-72 overflow-auto px-4 py-3 font-mono text-xs leading-relaxed" tabIndex={0} aria-label={`${opened.name} log`}>
                    {opened.log.join("\n")}
                  </pre>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Select a stage to read its log.</p>
              )}
            </div>
          </>
        )}
      </StateView>
    </section>
  )
}

export { Pipeline1, type Pipeline1Props, type Pipeline1Run, type Pipeline1Stage, type Pipeline1StageStatus }
