// Ballmac UI: Gantt 1. https://ui.ballmac.com/blocks/gantt-1
"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"
import { CalendarRange, CircleAlert, CircleCheck, CircleDashed, CirclePlay, LocateFixed } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Gantt1Status = "done" | "active" | "late" | "planned"

type Gantt1Task = {
  id: string
  name: string
  /** First day, as YYYY-MM-DD. */
  start: string
  /** Last day, as YYYY-MM-DD, included. A milestone has the same start and end. */
  end: string
  /** From 0 to 1. Decides whether it is done, and whether it is late. */
  progress?: number
  /** The section it is listed under. */
  group?: string
  /** Initials of who owns it. */
  owner?: string
  /** Ids of tasks that must finish first. Drawn as arrows. */
  dependsOn?: string[]
  /** A single day that marks a decision or a date, drawn as a diamond. */
  milestone?: boolean
}

type Gantt1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    tasks?: Gantt1Task[]
    title?: string
    description?: string
    /** Today as YYYY-MM-DD. Pass it in so the server and browser agree; it decides what is late and where the today line goes. */
    today?: string
    /** How much of the timeline fits on screen at first. */
    defaultScale?: "days" | "weeks" | "months"
    /** The task whose details are open at first. */
    defaultSelectedId?: string
    /** BCP 47 locale for dates. */
    locale?: string
    /** Called when a task is chosen. */
    onSelect?: (task: Gantt1Task) => void
  }

const DAY = 86_400_000
const toT = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))
const PX = { days: 44, weeks: 18, months: 6 } as const
const ROW = 40
const GROUP = 32

const sample: Gantt1Task[] = [
  { id: "t1", group: "Discovery", name: "User interviews", start: "2026-10-05", end: "2026-10-16", progress: 1, owner: "MA" },
  { id: "t2", group: "Discovery", name: "Legal review", start: "2026-10-05", end: "2026-10-15", progress: 0.6, owner: "JL" },
  { id: "t3", group: "Discovery", name: "Requirements", start: "2026-10-12", end: "2026-10-20", progress: 0.8, owner: "JL", dependsOn: ["t1"] },
  { id: "t4", group: "Design", name: "Wireframes", start: "2026-10-14", end: "2026-10-23", progress: 0.55, owner: "MA", dependsOn: ["t1"] },
  { id: "t5", group: "Design", name: "Visual design", start: "2026-10-26", end: "2026-11-06", progress: 0.1, owner: "MA", dependsOn: ["t4"] },
  { id: "m1", group: "Design", name: "Design review", start: "2026-11-09", end: "2026-11-09", milestone: true, dependsOn: ["t5"] },
  { id: "t6", group: "Build", name: "API and data model", start: "2026-10-19", end: "2026-11-13", progress: 0.2, owner: "PS", dependsOn: ["t3"] },
  { id: "t7", group: "Build", name: "Web app", start: "2026-11-09", end: "2026-12-04", progress: 0, owner: "TN", dependsOn: ["m1", "t6"] },
  { id: "t8", group: "Build", name: "Desktop app", start: "2026-11-16", end: "2026-12-11", progress: 0, owner: "TN", dependsOn: ["t6"] },
  { id: "t9", group: "Launch", name: "Accessibility audit", start: "2026-11-30", end: "2026-12-11", progress: 0, owner: "AK", dependsOn: ["t7"] },
  { id: "t10", group: "Launch", name: "Private beta", start: "2026-12-14", end: "2026-12-23", progress: 0, owner: "SO", dependsOn: ["t9", "t8"] },
  { id: "m2", group: "Launch", name: "Public launch", start: "2027-01-12", end: "2027-01-12", milestone: true, dependsOn: ["t10"] },
]

const statusMeta: Record<Gantt1Status, { label: string; icon: typeof CircleCheck; bar: string; fill: string; chip: string }> = {
  done: { label: "Done", icon: CircleCheck, bar: "bg-chart-2/25 border-chart-2", fill: "bg-chart-2", chip: "bg-chart-2/15 border-chart-2/30" },
  active: { label: "In progress", icon: CirclePlay, bar: "bg-chart-1/20 border-chart-1", fill: "bg-chart-1", chip: "bg-chart-1/15 border-chart-1/30" },
  late: { label: "Late", icon: CircleAlert, bar: "bg-destructive/15 border-destructive", fill: "bg-destructive", chip: "bg-destructive/10 border-destructive/30" },
  planned: { label: "Planned", icon: CircleDashed, bar: "bg-muted border-border", fill: "bg-foreground/30", chip: "bg-muted border-border" },
}

function GanttSkeleton() {
  return (
    <div className="bg-card overflow-hidden rounded-2xl border" aria-hidden="true">
      <Skeleton className="h-14 rounded-none" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex h-10 items-center gap-4 border-t px-3">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-5 rounded-md" style={{ width: `${18 + ((i * 7) % 5) * 9}%`, marginInlineStart: `${10 + ((i * 11) % 6) * 8}%` }} />
        </div>
      ))}
    </div>
  )
}

/**
 * A project timeline (Gantt chart): tasks as bars placed by their real dates with a fill for progress, milestones as diamonds, arrows for
 * what depends on what, a line for today, three zoom levels, a task column that stays put while you scroll sideways, a details panel, and
 * a table of the same data for screen readers. Late work is marked in words as well as color.
 */
function Gantt1({
  tasks: tasksProp = sample,
  title = "Product launch plan",
  description = "From the first interviews to public launch. Select a bar to see its dates and what it waits for.",
  today = "2026-10-18",
  defaultScale = "weeks",
  defaultSelectedId,
  locale = "en-US",
  onSelect,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Gantt1Props) {
  const id = React.useId()
  const reduce = useReducedMotion()
  const scroller = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState<"days" | "weeks" | "months">(defaultScale)
  const [selectedId, setSelectedId] = React.useState<string | undefined>(defaultSelectedId)
  const ready = state === "ready" || state === "empty"
  const tasks = state === "empty" ? [] : tasksProp
  const px = PX[scale]

  const dayFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" })
  const monthFmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" })
  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" })

  const model = React.useMemo(() => {
    if (!tasks.length) return null
    const todayT = toT(today)
    let min = Math.min(...tasks.map((t) => toT(t.start)), todayT) - 3 * DAY
    min -= ((new Date(min).getUTCDay() + 6) % 7) * DAY // start on a Monday
    const max = Math.max(...tasks.map((t) => toT(t.end)), todayT) + 7 * DAY
    const days = Math.round((max - min) / DAY) + 1
    const statusOf = (t: Gantt1Task): Gantt1Status => ((t.progress ?? 0) >= 1 ? "done" : toT(t.end) < todayT ? "late" : toT(t.start) <= todayT ? "active" : "planned")
    const rows: ({ kind: "group"; name: string } | { kind: "task"; task: Gantt1Task; status: Gantt1Status })[] = []
    const groups = [...new Set(tasks.map((t) => t.group ?? ""))]
    for (const g of groups) {
      if (g) rows.push({ kind: "group", name: g })
      for (const t of tasks.filter((x) => (x.group ?? "") === g)) rows.push({ kind: "task", task: t, status: statusOf(t) })
    }
    let y = 0
    const tops: Record<string, number> = {}
    const layout = rows.map((r) => {
      const top = y
      const h = r.kind === "group" ? GROUP : ROW
      y += h
      if (r.kind === "task") tops[r.task.id] = top
      return { ...r, top, h }
    })
    return { min, days, rows: layout, tops, height: y, todayT }
  }, [tasks, today])

  const x = (iso: string) => (model ? ((toT(iso) - model.min) / DAY) * px : 0)
  const jump = React.useCallback(
    (smooth = true) => {
      const el = scroller.current
      if (!el || !model) return
      const side = el.querySelector<HTMLElement>("[data-gantt-left]")?.offsetWidth ?? 224
      el.scrollTo?.({ left: Math.max(0, ((model.todayT - model.min) / DAY) * px - (el.clientWidth - side) / 3), behavior: smooth && !reduce ? "smooth" : "auto" })
    },
    [model, px, reduce]
  )
  // open around today, and again after a zoom change
  React.useEffect(() => {
    jump(false)
  }, [jump])

  const selected = tasks.find((t) => t.id === selectedId)
  const statusOf = (t: Gantt1Task) => (model?.rows.find((r) => r.kind === "task" && r.task.id === t.id) as { status: Gantt1Status } | undefined)?.status ?? "planned"
  const lengthOf = (t: Gantt1Task) => Math.round((toT(t.end) - toT(t.start)) / DAY) + 1
  const pick = (t: Gantt1Task) => {
    setSelectedId(t.id)
    onSelect?.(t)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return
    const bars = [...(scroller.current?.querySelectorAll<HTMLElement>("[data-bar]") ?? [])]
    const at = bars.indexOf(e.target as HTMLElement)
    if (at === -1) return
    e.preventDefault()
    const next = e.key === "Home" ? 0 : e.key === "End" ? bars.length - 1 : Math.max(0, Math.min(bars.length - 1, at + (e.key === "ArrowDown" ? 1 : -1)))
    bars[next]?.focus()
  }

  const months: { label: string; w: number }[] = []
  if (model) {
    let i = 0
    while (i < model.days) {
      const d = new Date(model.min + i * DAY)
      const left = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).getTime()
      const span = Math.min(model.days - i, Math.round((left - (model.min + i * DAY)) / DAY))
      months.push({ label: monthFmt.format(model.min + i * DAY), w: span * px })
      i += span
    }
  }

  const chart =
    model === null ? (
      <div className="bg-card rounded-2xl border px-6 py-16 text-center">
        <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
          <CalendarRange className="size-6" />
        </span>
        <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No tasks scheduled"}</h2>
        <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "Add tasks with start and end dates and the plan draws itself."}</p>
        {emptyState?.action}
      </div>
    ) : (
      <>
        <div
          ref={scroller}
          dir="ltr"
          tabIndex={0}
          role="region"
          aria-label="Project timeline. Scroll sideways for other dates."
          onKeyDown={onKeyDown}
          className="bg-card focus-visible:ring-ring/50 relative max-h-[42rem] overflow-auto rounded-2xl border [--gantt-left:8.5rem] outline-none focus-visible:ring-[3px] sm:[--gantt-left:14rem]"
        >
          <div className="relative" style={{ width: `calc(var(--gantt-left) + ${model.days * px}px)` }}>
            <div className="bg-card sticky top-0 z-30 flex h-14 border-b">
              <div data-gantt-left className="bg-card sticky start-0 z-40 flex shrink-0 items-end border-e px-3 pb-2 text-xs font-medium" style={{ width: "var(--gantt-left)" }}>
                <span className="text-muted-foreground">Task</span>
              </div>
              <div className="relative" style={{ width: model.days * px }}>
                <div className="flex h-7 border-b">
                  {months.map((m, i) => (
                    <div key={i} className="text-foreground/80 border-e py-1 text-xs font-medium whitespace-nowrap" style={{ width: m.w }}>
                      {/* sticky, so the name stays readable beside the task column while the month is on screen */}
                      {m.w > 70 ? (
                        <span className="sticky inline-block px-2" style={{ left: "var(--gantt-left)" }}>
                          {m.label}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="relative h-7">
                  {Array.from({ length: model.days }, (_, i) => {
                    const t = model.min + i * DAY
                    const dow = new Date(t).getUTCDay()
                    const monday = dow === 1
                    if (scale === "days")
                      return (
                        <div key={i} className={cn("text-muted-foreground absolute top-0 flex h-7 flex-col items-center justify-center text-[10px] leading-tight tabular-nums", (dow === 0 || dow === 6) && "bg-muted/50")} style={{ left: i * px, width: px }}>
                          <span className="text-foreground/80 font-medium">{new Date(t).getUTCDate()}</span>
                          <span>{weekdayFmt.format(t)}</span>
                        </div>
                      )
                    if (scale === "weeks" && monday)
                      return (
                        <div key={i} className="text-muted-foreground absolute top-0 flex h-7 items-center border-s ps-1.5 text-[10px] tabular-nums" style={{ left: i * px }}>
                          {dayFmt.format(t)}
                        </div>
                      )
                    return null
                  })}
                </div>
              </div>
            </div>

            <div className="flex">
              <div className="bg-card sticky start-0 z-20 shrink-0 border-e" style={{ width: "var(--gantt-left)" }}>
                {model.rows.map((r, i) =>
                  r.kind === "group" ? (
                    <div key={`g-${i}`} className="bg-muted/60 text-muted-foreground flex items-center px-3 text-[11px] font-semibold tracking-wide uppercase" style={{ height: r.h }}>
                      {r.name}
                    </div>
                  ) : (
                    <div key={r.task.id} className={cn("flex items-center gap-2 border-t px-3 text-sm", selectedId === r.task.id && "bg-accent/60")} style={{ height: r.h }}>
                      <span className="min-w-0 flex-1 truncate" dir="auto">
                        {r.task.name}
                      </span>
                      {r.status === "late" ? <CircleAlert aria-hidden="true" className="text-destructive size-3.5 shrink-0" /> : null}
                      {r.task.owner ? (
                        <span aria-hidden="true" className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold">
                          {r.task.owner}
                        </span>
                      ) : null}
                    </div>
                  )
                )}
              </div>

              <div className="relative" style={{ width: model.days * px, height: model.height }}>
                {Array.from({ length: model.days }, (_, i) => {
                  const t = model.min + i * DAY
                  const d = new Date(t)
                  const dow = d.getUTCDay()
                  if (scale === "days" && (dow === 0 || dow === 6)) return <div key={`w-${i}`} aria-hidden="true" className="bg-muted/40 absolute inset-y-0" style={{ left: i * px, width: px }} />
                  if (scale !== "days" && (scale === "weeks" ? dow === 1 : d.getUTCDate() === 1)) return <div key={`l-${i}`} aria-hidden="true" className="border-border/70 absolute inset-y-0 border-s" style={{ left: i * px }} />
                  return null
                })}
                {model.rows.map((r) => (r.kind === "group" ? <div key={`gb-${r.top}`} aria-hidden="true" className="bg-muted/60 absolute inset-x-0" style={{ top: r.top, height: r.h }} /> : <div key={`rb-${r.task.id}`} aria-hidden="true" className="absolute inset-x-0 border-t" style={{ top: r.top }} />))}

                <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-visible" width={model.days * px} height={model.height}>
                  {model.rows.flatMap((r) =>
                    r.kind === "task"
                      ? (r.task.dependsOn ?? []).flatMap((dep) => {
                          const from = tasks.find((t) => t.id === dep)
                          if (!from || model.tops[dep] === undefined) return []
                          const x1 = x(from.end) + px
                          const y1 = model.tops[dep]! + ROW / 2
                          const x2 = x(r.task.start)
                          const y2 = model.tops[r.task.id]! + ROW / 2
                          return [
                            <path
                              key={`${dep}-${r.task.id}`}
                              d={`M${x1} ${y1} H${x1 + 8} V${y2} H${Math.max(x2 - 5, x1 + 8)}`}
                              className={cn("fill-none stroke-[1.25]", selectedId === r.task.id || selectedId === dep ? "stroke-foreground" : "stroke-muted-foreground/50")}
                            />,
                            <path key={`a-${dep}-${r.task.id}`} d={`M${x2 - 6} ${y2 - 3.5} L${x2 - 1} ${y2} L${x2 - 6} ${y2 + 3.5} Z`} className={selectedId === r.task.id || selectedId === dep ? "fill-foreground" : "fill-muted-foreground/60"} />,
                          ]
                        })
                      : []
                  )}
                </svg>

                <div aria-hidden="true" className="bg-foreground absolute inset-y-0 z-[2] w-px" style={{ left: ((model.todayT - model.min) / DAY) * px + px / 2 }} />
                <div aria-hidden="true" className="bg-foreground text-background absolute top-1 z-[4] -translate-x-1/2 rounded px-1.5 py-px text-[10px] font-semibold" style={{ left: ((model.todayT - model.min) / DAY) * px + px / 2 }}>
                  Today
                </div>

                {model.rows.map((r) => {
                  if (r.kind !== "task") return null
                  const t = r.task
                  const S = statusMeta[r.status]
                  const pct = Math.round((t.progress ?? 0) * 100)
                  const label = `${t.name}: ${dayFmt.format(toT(t.start))}${t.milestone ? "" : ` to ${dayFmt.format(toT(t.end))}`}, ${t.milestone ? "milestone" : `${pct}% done`}, ${S.label}`
                  if (t.milestone)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        data-bar
                        aria-label={label}
                        aria-pressed={selectedId === t.id}
                        onClick={() => pick(t)}
                        className="focus-visible:ring-ring/60 group/bar absolute z-[3] flex items-center gap-2 outline-none"
                        style={{ top: r.top + ROW / 2 - 10, left: x(t.start) + px / 2 - 10, height: 20 }}
                      >
                        <span aria-hidden="true" className={cn("border-background size-5 rotate-45 rounded-[4px] border-2 transition-transform duration-150 group-hover/bar:scale-110 group-focus-visible/bar:ring-[3px] group-focus-visible/bar:ring-ring/60 motion-reduce:transition-none", S.fill, selectedId === t.id && "ring-foreground ring-2")} />
                        <span aria-hidden="true" className="text-foreground bg-card/80 absolute start-7 rounded px-1 text-xs font-medium whitespace-nowrap">
                          {t.name}
                        </span>
                      </button>
                    )
                  const w = (lengthOf(t)) * px
                  return (
                    <button
                      key={t.id}
                      type="button"
                      data-bar
                      aria-label={label}
                      aria-pressed={selectedId === t.id}
                      onClick={() => pick(t)}
                      className={cn("focus-visible:ring-ring/60 group/bar absolute z-[3] overflow-hidden rounded-md border text-start outline-none transition-[box-shadow,transform] duration-150 hover:shadow-md focus-visible:ring-[3px] motion-reduce:transition-none", S.bar, selectedId === t.id && "ring-foreground ring-2")}
                      style={{ top: r.top + 8, left: x(t.start), width: w, height: ROW - 16 }}
                    >
                      <span aria-hidden="true" className={cn("absolute inset-y-0 start-0 opacity-90", S.fill)} style={{ width: `${pct}%` }} />
                      {w > 74 ? (
                        <span aria-hidden="true" className="relative flex h-full items-center ps-2 text-[11px] font-semibold whitespace-nowrap mix-blend-normal">
                          <span className="bg-card/85 text-foreground rounded px-1 tabular-nums">{pct}%</span>
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="sr-only">
<table>
          <caption>Project schedule</caption>
          <thead>
            <tr>
              <th scope="col">Task</th>
              <th scope="col">Section</th>
              <th scope="col">Start</th>
              <th scope="col">End</th>
              <th scope="col">Progress</th>
              <th scope="col">Status</th>
              <th scope="col">Waits for</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <th scope="row">{t.name}</th>
                <td>{t.group ?? ""}</td>
                <td>{dayFmt.format(toT(t.start))}</td>
                <td>{dayFmt.format(toT(t.end))}</td>
                <td>{t.milestone ? "Milestone" : `${Math.round((t.progress ?? 0) * 100)}%`}</td>
                <td>{statusMeta[statusOf(t)].label}</td>
                <td>{(t.dependsOn ?? []).map((d) => tasks.find((x) => x.id === d)?.name).filter(Boolean).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
</div>

        <div aria-live="polite" className="bg-card mt-4 rounded-2xl border p-5">
          {selected ? (
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="text-base font-semibold tracking-tight">{selected.name}</span>
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", statusMeta[statusOf(selected)].chip)}>
                    {React.createElement(statusMeta[statusOf(selected)].icon, { "aria-hidden": true, className: "size-3.5" })}
                    {statusMeta[statusOf(selected)].label}
                  </span>
                </p>
                <p className="text-muted-foreground mt-1.5 text-sm tabular-nums">
                  {selected.milestone ? dayFmt.format(toT(selected.start)) : `${dayFmt.format(toT(selected.start))} to ${dayFmt.format(toT(selected.end))} · ${lengthOf(selected)} ${lengthOf(selected) === 1 ? "day" : "days"}`}
                  {selected.owner ? ` · ${selected.owner}` : ""}
                </p>
                {selected.dependsOn?.length ? (
                  <p className="mt-2 text-sm text-pretty">
                    <span className="text-muted-foreground">Waits for </span>
                    {selected.dependsOn.map((d) => tasks.find((t) => t.id === d)?.name).filter(Boolean).join(", ")}
                  </p>
                ) : null}
              </div>
              {!selected.milestone ? (
                <div className="w-full sm:w-56">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium tabular-nums">{Math.round((selected.progress ?? 0) * 100)}%</span>
                  </div>
                  <div role="progressbar" aria-label={`${selected.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((selected.progress ?? 0) * 100)} className="bg-muted mt-1.5 h-2 overflow-hidden rounded-full">
                    <div className={cn("h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", statusMeta[statusOf(selected)].fill)} style={{ width: `${Math.round((selected.progress ?? 0) * 100)}%` }} />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Select a bar to see its dates, who owns it and what it waits for.</p>
          )}
        </div>
      </>
    )

  return (
    <section data-slot="gantt-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6 flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="min-w-0 flex-1 basis-80">
          <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em]">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm text-pretty">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl value={scale} onValueChange={(v) => setScale(v as typeof scale)} aria-label="Zoom" size="sm" disabled={!ready || !model}>
            <SegmentedControlItem value="days">Days</SegmentedControlItem>
            <SegmentedControlItem value="weeks">Weeks</SegmentedControlItem>
            <SegmentedControlItem value="months">Months</SegmentedControlItem>
          </SegmentedControl>
          <Button variant="outline" size="sm" disabled={!ready || !model} onClick={() => jump()}>
            <LocateFixed aria-hidden="true" />
            Today
          </Button>
        </div>
      </header>
      {ready && model ? (
        <ul aria-label="Legend" className="text-muted-foreground mb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
          {(Object.keys(statusMeta) as Gantt1Status[]).map((k) => {
            const S = statusMeta[k]
            return (
              <li key={k} className="flex items-center gap-1.5">
                <S.icon aria-hidden="true" className="size-3.5" />
                {S.label}
              </li>
            )
          })}
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="bg-foreground size-2.5 rotate-45 rounded-[2px]" />
            Milestone
          </li>
        </ul>
      ) : null}
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the timeline" loading={<GanttSkeleton />} error={{ title: errorState?.title ?? "The timeline could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {chart}
      </StateView>
    </section>
  )
}

export { Gantt1, type Gantt1Props, type Gantt1Task, type Gantt1Status }
