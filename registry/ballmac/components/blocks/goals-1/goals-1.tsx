// Ballmac UI: Goals 1. https://ui.ballmac.com/blocks/goals-1
"use client"

import * as React from "react"
import { Check, CircleAlert, CircleCheck, ClockAlert, Loader2, Pencil, Target, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { Input } from "@/components/ballmac/input"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Goals1KeyResult = {
  id: string
  title: string
  /** Where it started, where it should end, and where it is now. Target below start means lower is better. */
  start: number
  target: number
  current: number
  /** "%", "users", "$", shown after the numbers. Use prefix for a leading symbol. */
  unit?: string
  prefix?: string
}

type Goals1Objective = { id: string; title: string; owner: string; team: string; keyResults: Goals1KeyResult[] }

type Goals1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    objectives?: Goals1Objective[]
    title?: string
    /** "Q4 2026". */
    period?: string
    /** ISO dates the period starts and ends. */
    range?: [string, string]
    /** An ISO date for "today", used for pace. The block never reads the clock. */
    today?: string
    locale?: string
    /** Called with a new current value. Return a promise; reject and the old value comes back with a message. */
    onUpdate?: (objective: Goals1Objective, keyResult: Goals1KeyResult, value: number) => void | Promise<void>
  }

const sample: Goals1Objective[] = [
  {
    id: "o1", title: "Make onboarding something people finish", owner: "Priya Shah", team: "Product",
    keyResults: [
      { id: "k1", title: "Raise setup completion", start: 48, target: 80, current: 71, unit: "%" },
      { id: "k2", title: "Cut time to first project", start: 22, target: 8, current: 11, unit: " min" },
      { id: "k3", title: "Teams invited in week one", start: 1200, target: 3000, current: 2640 },
    ],
  },
  {
    id: "o2", title: "Grow revenue from existing customers", owner: "Sam Okafor", team: "Growth",
    keyResults: [
      { id: "k4", title: "Expansion revenue", start: 0, target: 400, current: 150, unit: "k", prefix: "$" },
      { id: "k5", title: "Customers on yearly plans", start: 31, target: 50, current: 36, unit: "%" },
      { id: "k6", title: "Reduce monthly churn", start: 3.4, target: 2, current: 3.1, unit: "%" },
    ],
  },
  {
    id: "o3", title: "Be the fastest product in our category", owner: "Theo Nakamura", team: "Engineering",
    keyResults: [
      { id: "k7", title: "Median page load", start: 2400, target: 900, current: 1050, unit: " ms" },
      { id: "k8", title: "Errors per 1,000 sessions", start: 14, target: 3, current: 4, unit: "" },
    ],
  },
]

const DAY = 86_400_000
const toT = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const clamp = (n: number) => Math.max(0, Math.min(1, n))
const frac = (k: Goals1KeyResult) => (k.target === k.start ? (k.current >= k.target ? 1 : 0) : clamp((k.current - k.start) / (k.target - k.start)))

const statusMeta = {
  done: { label: "Done", icon: CircleCheck, chip: "bg-chart-2/15 border-chart-2/30" },
  track: { label: "On track", icon: CircleCheck, chip: "bg-chart-2/10 border-chart-2/30" },
  risk: { label: "At risk", icon: ClockAlert, chip: "bg-amber-500/15 border-amber-500/40" },
  behind: { label: "Behind", icon: CircleAlert, chip: "bg-destructive/10 border-destructive/40" },
}
type Status = keyof typeof statusMeta
// Against where it should be today: within 10 points is on track, within 25 is at risk, further is behind.
const statusOf = (progress: number, expected: number): Status => (progress >= 0.999 ? "done" : progress >= expected - 0.1 ? "track" : progress >= expected - 0.25 ? "risk" : "behind")

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-5">
      <Skeleton className="h-36 rounded-3xl" />
      {[0, 1].map((i) => (
        <Skeleton key={i} className="h-64 rounded-2xl" />
      ))}
    </div>
  )
}

function Bar({ value, expected, status }: { value: number; expected: number; status: Status }) {
  const fill = { done: "bg-chart-2", track: "bg-chart-2", risk: "bg-amber-500", behind: "bg-destructive" }[status]
  return (
    <div className="bg-muted relative h-2.5 overflow-hidden rounded-full">
      <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none", fill)} style={{ width: `${value * 100}%` }} />
      <span aria-hidden="true" className="bg-foreground/60 absolute inset-y-0 w-0.5" style={{ insetInlineStart: `${expected * 100}%` }} />
    </div>
  )
}

/**
 * Objectives and key results for a quarter. Each key result shows where it started, where it is and where it should end, with a mark on its bar
 * for where it should be today, so on track, at risk and behind are judged against the calendar and written in words. Update a number in place and
 * the objective, the status and the quarter's overall progress all follow; a save that fails puts the old number back with the reason.
 */
function Goals1({ objectives: objectivesProp = sample, title = "Goals", period = "Q4 2026", range = ["2026-10-01", "2026-12-31"], today = "2026-11-12", locale = "en", onUpdate, state = "ready", onRetry, emptyState, errorState, className, ...props }: Goals1Props) {
  const id = React.useId()
  const [objs, setObjs] = React.useState<Goals1Objective[]>(objectivesProp)
  React.useEffect(() => setObjs(objectivesProp), [objectivesProp])
  const list = state === "empty" ? [] : objs
  const [team, setTeam] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState("")
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<{ id: string; text: string } | null>(null)
  const n = (x: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(x)

  const expected = clamp((toT(today) - toT(range[0])) / (toT(range[1]) - toT(range[0]) || DAY))
  const daysLeft = Math.max(0, Math.round((toT(range[1]) - toT(today)) / DAY))
  const teams = [...new Set(list.map((o) => o.team))]
  const shown = list.filter((o) => !team || o.team === team)
  const progressOf = (o: Goals1Objective) => (o.keyResults.length ? o.keyResults.reduce((s, k) => s + frac(k), 0) / o.keyResults.length : 0)
  const overall = shown.length ? shown.reduce((s, o) => s + progressOf(o), 0) / shown.length : 0
  const counts = (["done", "track", "risk", "behind"] as Status[]).map((s) => [s, shown.filter((o) => statusOf(progressOf(o), expected) === s).length] as const)
  const fmt = (k: Goals1KeyResult, v: number) => `${k.prefix ?? ""}${n(v)}${k.unit ?? ""}`

  async function save(o: Goals1Objective, k: Goals1KeyResult) {
    const v = Number(draft.replace(",", "."))
    if (!Number.isFinite(v) || draft.trim() === "") return setError({ id: k.id, text: "Enter a number." })
    setError(null)
    setBusy(k.id)
    const prev = k.current
    setObjs((x) => x.map((y) => (y.id === o.id ? { ...y, keyResults: y.keyResults.map((z) => (z.id === k.id ? { ...z, current: v } : z)) } : y)))
    setEditing(null)
    try {
      await onUpdate?.(o, { ...k, current: v }, v)
    } catch (e) {
      setObjs((x) => x.map((y) => (y.id === o.id ? { ...y, keyResults: y.keyResults.map((z) => (z.id === k.id ? { ...z, current: prev } : z)) } : y)))
      setError({ id: k.id, text: e instanceof Error ? e.message : `The update was not saved, so ${k.title} is back to ${fmt(k, prev)}.` })
    } finally {
      setBusy(null)
    }
  }

  const content = !list.length ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Target className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No goals for this period yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">{emptyState?.description ?? "Set an objective and the results that would show it worked. Progress is measured from there."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <>
      <div className="relative isolate overflow-hidden rounded-3xl border">
        <CoverArt seed={period} variant="waves" className="absolute inset-0 -z-20 opacity-50" />
        <div aria-hidden="true" className="from-background via-background/90 to-background/50 absolute inset-0 -z-10 bg-gradient-to-r rtl:bg-gradient-to-l" />
        <div className="grid gap-6 p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:p-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              <svg aria-hidden="true" viewBox="0 0 100 100" className="size-28 -rotate-90 rtl:rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-muted" />
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 * (1 - overall)} className="stroke-foreground transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-semibold tabular-nums">{Math.round(overall * 100)}%</span>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">{period}</p>
              <p className="text-lg font-semibold tracking-tight">Overall progress</p>
              <p className="text-muted-foreground text-sm tabular-nums">
                {Math.round(expected * 100)}% of the period gone · {daysLeft} {daysLeft === 1 ? "day" : "days"} left
              </p>
            </div>
          </div>
          <ul aria-label="Objectives by status" className="flex flex-wrap gap-2 sm:justify-end">
            {counts.map(([s, c]) => (
              <li key={s} className={cn("flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium", statusMeta[s].chip)}>
                {React.createElement(statusMeta[s].icon, { "aria-hidden": true, className: "size-4" })}
                <span className="tabular-nums">{c}</span> {statusMeta[s].label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {teams.length > 1 ? (
        <div role="group" aria-label="Filter by team" className="mt-6 flex flex-wrap gap-2">
          {[null, ...teams].map((t) => (
            <button key={t ?? "all"} type="button" aria-pressed={team === t} onClick={() => setTeam(t)} className={cn("focus-visible:ring-ring/50 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", team === t ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
              {t ?? "All teams"}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="mt-6 grid gap-5">
        {shown.map((o) => {
          const p = progressOf(o)
          const st = statusOf(p, expected)
          const M = statusMeta[st]
          return (
            <li key={o.id} className="bg-card rounded-2xl border p-5 sm:p-6">
              <article aria-labelledby={`${id}-${o.id}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 id={`${id}-${o.id}`} className="text-lg font-semibold tracking-tight text-balance">
                      {o.title}
                    </h2>
                    <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                      <span aria-hidden="true" className="relative flex size-5 items-center justify-center overflow-hidden rounded-full border text-[9px] font-semibold">
                        <CoverArt seed={o.owner} variant="mesh" className="absolute inset-0" />
                        <span className="relative">{o.owner.split(" ").map((w) => w[0]).join("")}</span>
                      </span>
                      {o.owner} · {o.team}
                    </div>
                  </div>
                  <p className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium", M.chip)}>
                    <M.icon aria-hidden="true" className="size-4" />
                    {M.label}
                    <span className="tabular-nums">· {Math.round(p * 100)}%</span>
                  </p>
                </div>
                <div className="mt-4">
                  <Bar value={p} expected={expected} status={st} />
                </div>

                <ul className="mt-5 grid gap-4">
                  {o.keyResults.map((k) => {
                    const kf = frac(k)
                    const ks = statusOf(kf, expected)
                    const isEdit = editing === k.id
                    return (
                      <li key={k.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <p className="text-sm font-medium">{k.title}</p>
                          <p className="text-muted-foreground flex items-center gap-2 text-sm tabular-nums">
                            {isEdit ? (
                              <span className="flex items-center gap-1.5">
                                <Input type="number" inputMode="decimal" step="any" autoFocus aria-label={`New value for ${k.title}`} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void save(o, k) } if (e.key === "Escape") setEditing(null) }} className="h-8 w-24 text-end" />
                                <Button size="icon" variant="outline" aria-label="Save value" onClick={() => void save(o, k)}>
                                  <Check aria-hidden="true" />
                                </Button>
                                <Button size="icon" variant="ghost" aria-label="Cancel" onClick={() => setEditing(null)}>
                                  <X aria-hidden="true" />
                                </Button>
                              </span>
                            ) : (
                              <>
                                <span>
                                  <span className="text-foreground font-semibold">{fmt(k, k.current)}</span> of {fmt(k, k.target)}
                                </span>
                                <Button size="icon" variant="ghost" aria-label={`Update ${k.title}`} disabled={busy === k.id} onClick={() => { setEditing(k.id); setDraft(String(k.current)); setError(null) }}>
                                  {busy === k.id ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Pencil aria-hidden="true" />}
                                </Button>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="mt-2">
                          <Bar value={kf} expected={expected} status={ks} />
                        </div>
                        <p className="text-muted-foreground mt-1.5 text-xs">
                          {statusMeta[ks].label}, {Math.round(kf * 100)}% of the way from {fmt(k, k.start)}
                          {k.target < k.start ? " (lower is better)" : ""}
                        </p>
                        {error?.id === k.id ? (
                          <p role="alert" className="text-destructive mt-1.5 text-sm">
                            {error.text}
                          </p>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </article>
            </li>
          )
        })}
      </ul>
      <p className="text-muted-foreground mt-5 flex items-center gap-2 text-xs">
        <span aria-hidden="true" className="bg-foreground/60 inline-block h-3 w-0.5" />
        The mark on each bar is where it should be today.
      </p>
    </>
  )

  return (
    <section data-slot="goals-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="mb-6 text-3xl font-semibold tracking-[-0.035em] text-balance">
        {title}
      </h1>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading goals" loading={<Skel />} error={{ title: errorState?.title ?? "Goals could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Goals1, type Goals1Props, type Goals1Objective, type Goals1KeyResult }
