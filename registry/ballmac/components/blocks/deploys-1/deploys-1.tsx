// Ballmac UI: Deploys 1. https://ui.ballmac.com/blocks/deploys-1
"use client"

import * as React from "react"
import { Check, CircleX, GitCommitHorizontal, Loader2, Rocket, Undo2, type LucideIcon } from "lucide-react"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ballmac/alert-dialog"
import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { useReturnFocus } from "@/lib/ballmac/return-focus"
import { cn } from "@/lib/utils"

type Deploys1Status = "success" | "failed" | "rolled-back" | "running"

type Deploys1Deploy = {
  id: string
  /** For example "v2.18.4". */
  version: string
  /** What changed, in a line. */
  message: string
  author: string
  /** When it happened, already formatted, such as "Today 14:02". */
  time: string
  environment: string
  status: Deploys1Status
  /** How long it took, already formatted. */
  duration?: string
  /** A short commit id. */
  commit?: string
}

type Deploys1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    deploys?: Deploys1Deploy[]
    title?: string
    /** Called after the confirmation. Reject and nothing changes, with the message. */
    onRollback?: (to: Deploys1Deploy) => void | Promise<void>
  }

const sample: Deploys1Deploy[] = [
  { id: "d1", version: "v2.18.4", message: "Retry the invoice export with backoff", author: "Priya Shah", time: "Today 14:02", environment: "production", status: "success", duration: "3 min 12 s", commit: "a41f9c2" },
  { id: "d2", version: "v2.18.3", message: "Move the retry into the shared helper", author: "Theo Nakamura", time: "Today 10:41", environment: "production", status: "failed", duration: "1 min 55 s", commit: "c93d1e0" },
  { id: "d3", version: "v2.18.2", message: "Fix the totals on the billing page", author: "Noor Haddad", time: "Yesterday 17:20", environment: "production", status: "success", duration: "3 min 04 s", commit: "7be20a4" },
  { id: "d4", version: "v2.18.1", message: "Add the assistant's refund tool", author: "Kofi Mensah", time: "Yesterday 11:08", environment: "production", status: "rolled-back", duration: "3 min 20 s", commit: "e55d018" },
  { id: "d5", version: "v2.18.0", message: "New onboarding checklist", author: "Ana Souza", time: "22 Oct 15:30", environment: "production", status: "success", duration: "3 min 31 s", commit: "19ac6f3" },
  { id: "d6", version: "v2.19.0-rc1", message: "Dark mode for the dashboard", author: "Oliver Reed", time: "Today 09:15", environment: "staging", status: "running", commit: "f08b7d9" },
  { id: "d7", version: "v2.18.4", message: "Retry the invoice export with backoff", author: "Priya Shah", time: "Today 13:20", environment: "staging", status: "success", duration: "2 min 58 s", commit: "a41f9c2" },
]

const STATUS: Record<Deploys1Status, { icon: LucideIcon; label: string }> = {
  success: { icon: Check, label: "Succeeded" },
  failed: { icon: CircleX, label: "Failed" },
  "rolled-back": { icon: Undo2, label: "Rolled back" },
  running: { icon: Loader2, label: "Running" },
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  )
}

/**
 * The deploy history of a product: each deploy with its version, what changed, who shipped it, when, and how it ended in words, one environment at a time.
 * The live version is marked, and any earlier one that succeeded can be rolled back to after a confirmation that names the versions involved.
 */
function Deploys1({ deploys: deploysProp = sample, title = "Deploys", onRollback, state = "ready", onRetry, emptyState, errorState, className, ...props }: Deploys1Props) {
  const id = React.useId()
  const [deploys, setDeploys] = React.useState(deploysProp)
  React.useEffect(() => setDeploys(deploysProp), [deploysProp])
  const envs = [...new Set(deploysProp.map((d) => d.environment))]
  const [env, setEnv] = React.useState(envs[0] ?? "production")
  const [confirm, setConfirm] = React.useState<Deploys1Deploy | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [note, setNote] = React.useState<{ ok: boolean; text: string } | null>(null)
  const ret = useReturnFocus(!!confirm)
  const view = state === "ready" && deploysProp.length === 0 ? "empty" : state
  const list = deploys.filter((d) => d.environment === env)
  const live = list.find((d) => d.status === "success")

  async function rollback(to: Deploys1Deploy) {
    setBusy(true)
    setNote(null)
    try {
      await onRollback?.(to)
      const entry: Deploys1Deploy = { id: `rb-${to.id}-${deploys.length}`, version: to.version, message: `Rolled back to ${to.version}`, author: "You", time: "Just now", environment: env, status: "success", commit: to.commit }
      setDeploys((l) => [entry, ...l.map((x) => (x.id === live?.id ? { ...x, status: "rolled-back" as const } : x))])
      setNote({ ok: true, text: `${env} is now on ${to.version}.` })
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : `The rollback to ${to.version} did not start. ${env} is unchanged.` })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section data-slot="deploys-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-pretty">What went out, who sent it, and how it ended. Go back to an earlier version when you need to.</p>
        </div>
        {view === "ready" && envs.length > 1 && (
          <div role="group" aria-label="Environment" className="bg-muted/60 inline-flex rounded-full p-0.5">
            {envs.map((e) => (
              <button key={e} type="button" aria-pressed={env === e} onClick={() => { setEnv(e); setNote(null) }} className={cn("focus-visible:ring-ring/50 rounded-full px-4 py-1.5 text-sm font-medium capitalize outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", env === e ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                {e}
              </button>
            ))}
          </div>
        )}
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading deploys" loading={<Skel />} empty={{ title: "Nothing deployed yet", description: "The first deploy to an environment will appear here.", ...emptyState }} error={{ title: "Deploys could not be loaded", description: "Nothing was rolled back or changed. Check your connection and try again.", ...errorState }}>
        <div aria-live="polite">{note && <p role={note.ok ? "status" : "alert"} className={cn("mb-3 text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}</div>
        <ol aria-label={`Deploys to ${env}, newest first`} className="grid gap-0">
          {list.map((d, i) => {
            const S = STATUS[d.status]
            const isLive = live?.id === d.id
            const canBack = d.status === "success" && !isLive && !!live
            return (
              <li key={d.id} data-status={d.status} className="relative grid grid-cols-[1.5rem_1fr] gap-4 pb-5 last:pb-0">
                <span aria-hidden="true" className="relative flex justify-center">
                  {i < list.length - 1 && <span className="bg-border absolute top-7 bottom-[-1.25rem] w-px" />}
                  <span className={cn("bg-card z-10 mt-1 flex size-6 items-center justify-center rounded-full border-2", d.status === "success" && "border-foreground", d.status === "failed" && "border-destructive text-destructive", d.status === "running" && "border-chart-1")}>
                    <S.icon className={cn("size-3", d.status === "running" && "motion-safe:animate-spin")} style={d.status === "running" ? { animationPlayState: "var(--bm-ambient-state, running)" } : undefined} />
                  </span>
                </span>
                <div className={cn("bg-card rounded-xl border p-4", isLive && "border-foreground")}>
                  <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <code className="font-mono text-sm font-semibold" dir="ltr">{d.version}</code>
                        {isLive && <span className="bg-foreground text-background inline-flex items-center gap-1 rounded-full px-2 py-px text-[11px] font-medium"><Rocket aria-hidden="true" className="size-3" /> Live</span>}
                        <span className={cn("text-xs", d.status === "failed" ? "text-destructive font-semibold" : "text-muted-foreground font-medium")}>{S.label}{d.duration ? ` · ${d.duration}` : ""}</span>
                      </p>
                      <p className="mt-1 text-sm">{d.message}</p>
                      <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 text-xs">
                        <span>{d.author} · {d.time}</span>
                        {d.commit && <span className="flex items-center gap-1 font-mono" dir="ltr"><GitCommitHorizontal aria-hidden="true" className="size-3" />{d.commit}</span>}
                      </p>
                    </div>
                    {canBack && (
                      <Button size="sm" variant="outline" onClick={() => setConfirm(d)} aria-label={`Roll back ${env} to ${d.version}`}>
                        <Undo2 aria-hidden="true" className="rtl:-scale-x-100" /> Roll back to this
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </StateView>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent {...ret}>
          <AlertDialogHeader>
            <AlertDialogTitle>Roll {env} back to {confirm?.version}?</AlertDialogTitle>
            <AlertDialogDescription>
              {env} goes from {live?.version} to {confirm?.version} ({confirm?.message.toLowerCase()}). Changes made since then stop being live until they are deployed again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction destructive disabled={busy} onClick={() => confirm && void rollback(confirm)}>Roll back</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export { Deploys1, type Deploys1Deploy, type Deploys1Props, type Deploys1Status }
