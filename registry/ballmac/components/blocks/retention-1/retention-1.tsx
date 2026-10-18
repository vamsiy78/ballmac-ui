// Ballmac UI: Retention 1. https://ui.ballmac.com/blocks/retention-1
"use client"

import * as React from "react"
import { Grid3x3, TrendingDown, TrendingUp } from "lucide-react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Retention1Cohort = {
  id: string
  /** "Week of 7 September". */
  label: string
  /** People who started in this cohort. */
  size: number
  /** Share still active in each period as 0 to 100, starting with period 0 (always 100). Recent cohorts have fewer entries. */
  retention: number[]
}

type Retention1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    cohorts?: Retention1Cohort[]
    /** What one column is: "Week", "Month", "Day". */
    period?: string
    locale?: string
    /** Whether cells show a share or a number of people at first. */
    defaultMode?: "percent" | "people"
  }

const sample: Retention1Cohort[] = [
  { id: "c1", label: "Week of 3 August", size: 1420, retention: [100, 64, 51, 44, 40, 37, 35, 33, 32, 31] },
  { id: "c2", label: "Week of 10 August", size: 1380, retention: [100, 66, 53, 46, 41, 38, 36, 34, 33] },
  { id: "c3", label: "Week of 17 August", size: 1510, retention: [100, 61, 48, 41, 36, 33, 31, 30] },
  { id: "c4", label: "Week of 24 August", size: 1465, retention: [100, 68, 56, 49, 45, 42, 40] },
  { id: "c5", label: "Week of 31 August", size: 1590, retention: [100, 70, 58, 51, 47, 44] },
  { id: "c6", label: "Week of 7 September", size: 1640, retention: [100, 72, 60, 53, 49] },
  { id: "c7", label: "Week of 14 September", size: 1725, retention: [100, 71, 61, 55] },
  { id: "c8", label: "Week of 21 September", size: 1810, retention: [100, 74, 63] },
  { id: "c9", label: "Week of 28 September", size: 1760, retention: [100, 75] },
  { id: "c10", label: "Week of 5 October", size: 1890, retention: [100] },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}

const tint = (v: number) => `color-mix(in oklab, var(--chart-1) ${Math.round(6 + (v / 100) * 52)}%, transparent)`

/**
 * A cohort retention table as a heatmap: each row is a group of people who started together, each column a later period, each cell the share
 * still active, tinted by how high it is. Cells are a keyboard grid (arrows move, Home and End jump) that reads out the cell and how it compares with
 * the average for that period, and the three headline numbers above are worked out from the table.
 */
function Retention1({
  title = "Weekly retention",
  description = "How many people from each starting week came back, week by week.",
  cohorts = sample,
  period = "Week",
  locale = "en",
  defaultMode = "percent",
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Retention1Props) {
  const id = React.useId()
  const list = state === "empty" ? [] : cohorts
  const [mode, setMode] = React.useState<"percent" | "people">(defaultMode)
  const [at, setAt] = React.useState<[number, number]>([0, 1])
  const [focused, setFocused] = React.useState(false)
  const gridRef = React.useRef<HTMLDivElement>(null)
  const n = (x: number) => new Intl.NumberFormat(locale).format(x)

  const cols = Math.max(0, ...list.map((c) => c.retention.length))
  // The average of a period only counts cohorts old enough to have reached it, weighted by size.
  const avg = Array.from({ length: cols }, (_, p) => {
    const has = list.filter((c) => c.retention[p] !== undefined)
    const size = has.reduce((s, c) => s + c.size, 0)
    return size ? has.reduce((s, c) => s + c.retention[p]! * c.size, 0) / size : 0
  })
  const best = list.reduce<Retention1Cohort | null>((b, c) => (c.retention[4] !== undefined && (!b || c.retention[4]! > b.retention[4]!) ? c : b), null)
  const recent = list.filter((c) => c.retention[1] !== undefined).slice(-3)
  const oldest = list.filter((c) => c.retention[1] !== undefined).slice(0, 3)
  const mean = (cs: Retention1Cohort[]) => (cs.length ? cs.reduce((s, c) => s + c.retention[1]!, 0) / cs.length : 0)
  const trend = recent.length && oldest.length ? mean(recent) - mean(oldest) : 0

  const cell = list[at[0]]?.retention[at[1]]
  const cellCohort = list[at[0]]
  const diff = cell !== undefined ? cell - avg[at[1]]! : 0

  function key(e: React.KeyboardEvent) {
    const [r, c] = at
    const reach = (rr: number) => list[rr]?.retention.length ?? 0
    let nr = r
    let nc = c
    if (e.key === "ArrowRight") nc = Math.min(reach(r) - 1, c + 1)
    else if (e.key === "ArrowLeft") nc = Math.max(0, c - 1)
    else if (e.key === "ArrowDown") nr = Math.min(list.length - 1, r + 1)
    else if (e.key === "ArrowUp") nr = Math.max(0, r - 1)
    else if (e.key === "Home") nc = 0
    else if (e.key === "End") nc = reach(r) - 1
    else return
    e.preventDefault()
    nc = Math.min(nc, reach(nr) - 1)
    setAt([nr, nc])
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLElement>(`[data-cell="${nr}-${nc}"]`)?.focus())
  }

  const content = !list.length || !cols ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Grid3x3 className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No cohorts yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "Once people have started and a full period has passed, their retention appears here."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: `${period} 1 retention`, value: `${avg[1] !== undefined ? avg[1].toFixed(0) : "–"}%`, note: "Came back the next period" },
          { label: `${period} 4 retention`, value: avg[4] !== undefined ? `${avg[4].toFixed(0)}%` : "–", note: best ? `Best: ${best.label}, ${best.retention[4]}%` : "Not enough history yet" },
          { label: "Trend", value: `${trend >= 0 ? "+" : ""}${trend.toFixed(1)} pts`, note: `${period} 1, newest three cohorts against the oldest three`, icon: trend >= 0 ? TrendingUp : TrendingDown },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border p-5">
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              {s.icon ? <s.icon aria-hidden="true" className={cn("size-4", trend >= 0 ? "text-chart-2" : "text-destructive")} /> : null}
              {s.label}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] tabular-nums">{s.value}</p>
            <p className="text-muted-foreground mt-1 text-xs text-pretty">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-card min-w-0 rounded-2xl border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
          <p className="text-sm font-medium">Share of each cohort still active</p>
          <SegmentedControl value={mode} onValueChange={(v) => setMode(v as "percent" | "people")} aria-label="Show" size="sm">
            <SegmentedControlItem value="percent">Percent</SegmentedControlItem>
            <SegmentedControlItem value="people">People</SegmentedControlItem>
          </SegmentedControl>
        </div>
        <div className="overflow-x-auto">
          <div ref={gridRef} role="grid" aria-label="Retention by starting cohort and period" aria-colcount={cols + 1} aria-rowcount={list.length + 2} onKeyDown={key} className="w-max min-w-full p-4 sm:p-5" dir="ltr">
            <div role="row" className="mb-1.5 flex items-end gap-1.5">
              <div role="columnheader" className="text-muted-foreground w-44 shrink-0 text-xs font-medium sm:w-52">
                Cohort
              </div>
              {Array.from({ length: cols }, (_, p) => (
                <div key={p} role="columnheader" className="text-muted-foreground w-14 shrink-0 text-center text-xs font-medium sm:w-16">
                  {period} {p}
                </div>
              ))}
            </div>
            {list.map((c, r) => (
              <div key={c.id} role="row" className="mb-1.5 flex items-center gap-1.5">
                <div role="rowheader" className="w-44 shrink-0 pe-2 sm:w-52">
                  <p className="truncate text-sm font-medium">{c.label}</p>
                  <p className="text-muted-foreground text-xs tabular-nums">{n(c.size)} people</p>
                </div>
                {Array.from({ length: cols }, (_, p) => {
                  const v = c.retention[p]
                  if (v === undefined) return <div key={p} role="gridcell" aria-label="Not yet" className="h-11 w-14 shrink-0 sm:w-16" />
                  const sel = at[0] === r && at[1] === p
                  return (
                    <div
                      key={p}
                      role="gridcell"
                      data-cell={`${r}-${p}`}
                      tabIndex={sel ? 0 : -1}
                      aria-selected={sel}
                      aria-label={`${c.label}, ${period.toLowerCase()} ${p}: ${v}% still active, ${n(Math.round((c.size * v) / 100))} people`}
                      onClick={() => setAt([r, p])}
                      onFocus={() => { setAt([r, p]); setFocused(true) }}
                      onBlur={() => setFocused(false)}
                      className={cn("focus-visible:ring-ring/60 flex h-11 w-14 shrink-0 cursor-pointer items-center justify-center rounded-lg text-sm font-medium tabular-nums outline-none transition-[box-shadow] focus-visible:ring-[3px] motion-reduce:transition-none sm:w-16", sel && "ring-foreground ring-2")}
                      style={{ background: tint(v) }}
                    >
                      {mode === "percent" ? `${v}%` : n(Math.round((c.size * v) / 100))}
                    </div>
                  )
                })}
              </div>
            ))}
            <div role="row" className="mt-3 flex items-center gap-1.5 border-t pt-3">
              <div role="rowheader" className="w-44 shrink-0 pe-2 text-sm font-semibold sm:w-52">
                Average
              </div>
              {avg.map((v, p) => (
                <div key={p} role="gridcell" className="w-14 shrink-0 text-center text-sm font-semibold tabular-nums sm:w-16">
                  {v.toFixed(0)}%
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3.5 text-xs">
          <p aria-live="polite" className="text-muted-foreground text-sm text-pretty">
            {cell !== undefined && cellCohort ? (
              <>
                <span className="text-foreground font-medium">{cellCohort.label}</span>, {period.toLowerCase()} {at[1]}: {cell}% still active ({n(Math.round((cellCohort.size * cell) / 100))} of {n(cellCohort.size)}).
                {at[1] > 0 ? ` That is ${Math.abs(diff).toFixed(0)} ${Math.abs(diff).toFixed(0) === "1" ? "point" : "points"} ${diff >= 0 ? "above" : "below"} the average.` : ""}
              </>
            ) : (
              "Choose a cell to compare it with the average."
            )}
          </p>
          <div aria-hidden="true" className="text-muted-foreground flex items-center gap-2">
            0%
            <span className="h-2 w-28 rounded-full" style={{ background: "linear-gradient(90deg, color-mix(in oklab, var(--chart-1) 6%, transparent), color-mix(in oklab, var(--chart-1) 58%, transparent))" }} />
            100%
          </div>
        </div>
      </div>
      <p className="sr-only">{focused ? "Use the arrow keys to move between cells." : ""}</p>
    </div>
  )

  return (
    <section data-slot="retention-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">{description}</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading retention" loading={<Skel />} error={{ title: errorState?.title ?? "Retention could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Retention1, type Retention1Props, type Retention1Cohort }
