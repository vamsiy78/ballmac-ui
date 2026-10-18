// Ballmac UI: Timesheet 1. https://ui.ballmac.com/blocks/timesheet-1
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, CircleAlert, CircleCheck, Clock, Loader2, Plus, Send, Trash2 } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Timesheet1Project = { id: string; name: string; client?: string; /** Minutes by ISO date. */ entries: Record<string, number> }

type Timesheet1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    projects?: Timesheet1Project[]
    /** Projects that can be added as a row. */
    available?: { id: string; name: string; client?: string }[]
    /** ISO date of the Monday of the week shown first. */
    weekStart?: string
    /** Hours a full day is, for the daily bars. */
    dayTarget?: number
    /** ISO dates of weeks already submitted, and so locked. */
    submittedWeeks?: string[]
    locale?: string
    title?: string
    /** Called when the person submits a week. Return a promise; reject to show the reason and stay open. */
    onSubmit?: (week: { weekStart: string; minutes: number; entries: Record<string, Record<string, number>> }) => void | Promise<void>
    onChange?: (projectId: string, date: string, minutes: number) => void
  }

const DAY = 86_400_000
const toT = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const iso = (t: number) => new Date(t).toISOString().slice(0, 10)

const sample: Timesheet1Project[] = [
  { id: "p1", name: "Website redesign", client: "Northwind", entries: { "2026-10-12": 240, "2026-10-13": 300, "2026-10-14": 270, "2026-10-15": 180, "2026-10-16": 120, "2026-10-19": 270, "2026-10-20": 240 } },
  { id: "p2", name: "Design system", client: "Internal", entries: { "2026-10-12": 120, "2026-10-13": 90, "2026-10-14": 150, "2026-10-15": 240, "2026-10-16": 180, "2026-10-19": 120 } },
  { id: "p3", name: "Customer calls", client: "Various", entries: { "2026-10-12": 60, "2026-10-14": 90, "2026-10-16": 120, "2026-10-19": 60, "2026-10-20": 90 } },
]
const sampleAvailable = [{ id: "p4", name: "Brand workshop", client: "Orbit Labs" }, { id: "p5", name: "Accessibility audit", client: "Lumen Health" }, { id: "p6", name: "Training", client: "Internal" }]

// Accepts "1.5", "1,5", "1:30", "90m" and "2h", the ways people really type time.
function parse(text: string): number | null {
  const t = text.trim().toLowerCase()
  if (!t) return 0
  let m: RegExpMatchArray | null
  if ((m = t.match(/^(\d+):(\d{1,2})$/))) return Number(m[1]) * 60 + Number(m[2])
  if ((m = t.match(/^(\d+(?:[.,]\d+)?)\s*m(?:in)?$/))) return Math.round(Number(m[1].replace(",", ".")))
  if ((m = t.match(/^(\d+(?:[.,]\d+)?)\s*h?$/))) return Math.round(Number(m[1].replace(",", ".")) * 60)
  return null
}
const show = (min: number) => (min ? `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}` : "")
const hours = (min: number) => `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ""}`

function Skel() {
  return (
    <div aria-hidden="true" className="bg-card rounded-2xl border p-5">
      <Skeleton className="h-8 w-60" />
      <Skeleton className="mt-6 h-64" />
    </div>
  )
}

/**
 * A weekly timesheet: a row for each project, a box for each day, and the totals worked out as you type. Time can be typed the way people say
 * it (1.5, 1:30, 90m, 2h). Each day has a bar against a full day and says so when it runs over, a day above 24 hours is refused, weeks can be
 * paged through, and submitting locks a week so it cannot be changed afterwards.
 */
function Timesheet1({
  projects: projectsProp = sample,
  available = sampleAvailable,
  weekStart = "2026-10-12",
  dayTarget = 8,
  submittedWeeks = [],
  locale = "en",
  title = "Timesheet",
  onSubmit,
  onChange,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Timesheet1Props) {
  const id = React.useId()
  const [rows, setRows] = React.useState<Timesheet1Project[]>(projectsProp)
  React.useEffect(() => setRows(projectsProp), [projectsProp])
  const [start, setStart] = React.useState(weekStart)
  const [locked, setLocked] = React.useState<string[]>(submittedWeeks)
  const [drafts, setDrafts] = React.useState<Record<string, string>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string>()
  const [announce, setAnnounce] = React.useState("")
  const list = state === "empty" ? [] : rows

  const days = Array.from({ length: 7 }, (_, i) => iso(toT(start) + i * DAY))
  const dayFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }), [locale])
  const numFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }), [locale])
  const isLocked = locked.includes(start)
  const target = dayTarget * 60
  const colTotal = (d: string) => list.reduce((s, p) => s + (p.entries[d] ?? 0), 0)
  const rowTotal = (p: Timesheet1Project) => days.reduce((s, d) => s + (p.entries[d] ?? 0), 0)
  const week = days.reduce((s, d) => s + colTotal(d), 0)
  const weekTarget = target * 5
  const free = available.filter((a) => !rows.some((r) => r.id === a.id))

  function commit(p: Timesheet1Project, d: string) {
    const key = `${p.id}|${d}`
    const text = drafts[key]
    if (text === undefined) return
    const min = parse(text)
    const others = colTotal(d) - (p.entries[d] ?? 0)
    setDrafts((x) => { const { [key]: _gone, ...rest } = x; return rest })
    if (min === null) return setErrors((e) => ({ ...e, [key]: "Type time like 1.5, 1:30 or 90m." }))
    if (others + min > 24 * 60) return setErrors((e) => ({ ...e, [key]: "A day has 24 hours. Take some off another project first." }))
    setErrors((e) => { const { [key]: _gone, ...rest } = e; return rest })
    setRows((rs) => rs.map((r) => (r.id === p.id ? { ...r, entries: { ...r.entries, [d]: min } } : r)))
    onChange?.(p.id, d, min)
  }
  async function submit() {
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      await onSubmit?.({ weekStart: start, minutes: week, entries: Object.fromEntries(list.map((p) => [p.id, Object.fromEntries(days.filter((d) => p.entries[d]).map((d) => [d, p.entries[d]!]))])) })
      setLocked((l) => [...l, start])
      setAnnounce(`Week of ${numFmt.format(toT(start))} submitted`)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "The week could not be submitted. Nothing was lost, so try again.")
    } finally {
      setSubmitting(false)
    }
  }
  const go = (d: number) => {
    setStart(iso(toT(start) + d * 7 * DAY))
    setDrafts({})
    setErrors({})
    setSubmitError(undefined)
  }

  const content = !list.length ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Clock className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No projects on this timesheet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">{emptyState?.description ?? "Add a project to start recording the time you spend."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="bg-card rounded-2xl border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" aria-label="Previous week" onClick={() => go(-1)}>
            <ChevronLeft aria-hidden="true" className="rtl:rotate-180" />
          </Button>
          <h2 className="min-w-48 px-3 text-center text-base font-semibold tracking-tight tabular-nums">
            {numFmt.format(toT(days[0]!))} to {numFmt.format(toT(days[6]!))}
          </h2>
          <Button variant="outline" size="icon" aria-label="Next week" onClick={() => go(1)}>
            <ChevronRight aria-hidden="true" className="rtl:rotate-180" />
          </Button>
        </div>
        <p className={cn("flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium", isLocked && "bg-chart-2/10 border-chart-2/30")}>
          {isLocked ? <CircleCheck aria-hidden="true" className="size-4" /> : <Clock aria-hidden="true" className="size-4" />}
          {isLocked ? "Submitted" : "Draft"}
        </p>
      </div>

      <div role="region" tabIndex={0} aria-label="Hours by project and day" className="focus-visible:ring-ring/50 overflow-x-auto outline-none focus-visible:ring-[3px] focus-visible:ring-inset">
        <table className="w-full min-w-[46rem] text-sm">
          <caption className="sr-only">Hours worked on each project for the week of {numFmt.format(toT(start))}</caption>
          <thead>
            <tr className="text-muted-foreground">
              <th scope="col" className="w-56 px-5 py-3 text-start font-medium">Project</th>
              {days.map((d, i) => (
                <th key={d} scope="col" className="px-1 py-3 text-center font-medium">
                  <span className="block text-xs">{dayFmt.format(toT(d))}</span>
                  <span className="text-foreground block tabular-nums">{numFmt.format(toT(d))}</span>
                </th>
              ))}
              <th scope="col" className="px-5 py-3 text-end font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y border-t">
            {list.map((p) => (
              <tr key={p.id}>
                <th scope="row" className="px-5 py-3 text-start font-normal">
                  <span className="block font-medium">{p.name}</span>
                  {p.client ? <span className="text-muted-foreground block text-xs">{p.client}</span> : null}
                </th>
                {days.map((d, i) => {
                  const key = `${p.id}|${d}`
                  const err = errors[key]
                  return (
                    <td key={d} className="px-1 py-2 text-center align-top">
                      <input
                        inputMode="decimal"
                        aria-label={`${p.name}, ${dayFmt.format(toT(d))} ${numFmt.format(toT(d))}`}
                        aria-invalid={!!err}
                        disabled={isLocked}
                        value={drafts[key] ?? show(p.entries[d] ?? 0)}
                        placeholder="0:00"
                        onChange={(e) => setDrafts((x) => ({ ...x, [key]: e.target.value }))}
                        onBlur={() => commit(p, d)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(p, d) } }}
                        className={cn("focus-visible:ring-ring/50 h-10 w-14 rounded-lg border bg-transparent text-center tabular-nums outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] disabled:opacity-60", i > 4 && "bg-muted/40", err && "border-destructive")}
                      />
                      {err ? <span role="alert" className="text-destructive mt-1 block text-[11px] leading-tight text-pretty">{err}</span> : null}
                    </td>
                  )
                })}
                <td className="px-5 py-3 text-end font-semibold tabular-nums">
                  {show(rowTotal(p)) || "0:00"}
                  {!isLocked ? (
                    <Button variant="ghost" size="icon" className="ms-1 align-middle" aria-label={`Remove ${p.name}`} onClick={() => setRows((rs) => rs.filter((r) => r.id !== p.id))}>
                      <Trash2 aria-hidden="true" />
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t">
              <th scope="row" className="px-5 py-3 text-start font-semibold">Day total</th>
              {days.map((d, i) => {
                const t = colTotal(d)
                const over = i < 5 && t > target
                return (
                  <td key={d} className="px-1 py-3 text-center">
                    <span className={cn("block font-semibold tabular-nums", t === 0 && "text-muted-foreground")}>{show(t) || "0:00"}</span>
                    <span aria-hidden="true" className="bg-muted mx-auto mt-1.5 block h-1.5 w-12 overflow-hidden rounded-full">
                      <span className={cn("block h-full rounded-full", over ? "bg-amber-500" : "bg-foreground")} style={{ width: `${Math.min(100, (t / target) * 100)}%` }} />
                    </span>
                    {over ? <span className="mt-1 block text-[11px] font-medium text-amber-700 dark:text-amber-400">+{show(t - target)} over</span> : null}
                  </td>
                )
              })}
              <td className="px-5 py-3 text-end text-base font-semibold tabular-nums">{show(week) || "0:00"}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-3">
          {!isLocked && free.length ? (
            <Select value="" onValueChange={(v) => { const a = available.find((x) => x.id === v); if (a) setRows((rs) => [...rs, { ...a, entries: {} }]) }}>
              <SelectTrigger aria-label="Add a project" className="w-52">
                <Plus aria-hidden="true" className="size-4" />
                <SelectValue placeholder="Add a project" />
              </SelectTrigger>
              <SelectContent>
                {free.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <p className="text-muted-foreground text-sm tabular-nums">
            {hours(week)} of {hours(weekTarget)}
            {week > weekTarget ? ` · ${hours(week - weekTarget)} over` : week < weekTarget ? ` · ${hours(weekTarget - week)} to go` : " · on target"}
          </p>
        </div>
        {isLocked ? (
          <p className="text-muted-foreground text-sm">This week is submitted and locked.</p>
        ) : (
          <Button onClick={() => void submit()} disabled={submitting || week === 0}>
            {submitting ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Send aria-hidden="true" className="rtl:-scale-x-100" />}
            {submitting ? "Submitting" : "Submit week"}
          </Button>
        )}
      </div>
      {submitError ? (
        <p role="alert" className="text-destructive flex items-start gap-2 border-t px-5 py-3 text-sm">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {submitError}
        </p>
      ) : null}
    </div>
  )

  return (
    <section data-slot="timesheet-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="mb-6 text-3xl font-semibold tracking-[-0.035em] text-balance">
        {title}
      </h1>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the timesheet" loading={<Skel />} error={{ title: errorState?.title ?? "The timesheet could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}

export { Timesheet1, type Timesheet1Props, type Timesheet1Project }
