// Ballmac UI: Matrix 1. https://ui.ballmac.com/blocks/matrix-1
"use client"

import * as React from "react"
import { BookOpenCheck, CalendarClock } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { HeatGrid } from "@/components/ballmac/heat-grid"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Matrix1Service = { id: string; name: string; team: string }
type Matrix1Region = { id: string; label: string }
type Matrix1Incident = { when: string; summary: string }

type Matrix1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    services?: Matrix1Service[]
    regions?: Matrix1Region[]
    /** Availability over the last 30 days as a percentage, by service then region. null means the service does not run there. */
    availability?: (number | null)[][]
    /** The most recent incident for a service in a region, keyed "serviceId:regionId". */
    incidents?: Record<string, Matrix1Incident>
    title?: string
    /** Availability at or above this is good; between this and `warnBelow` is a warning; below `warnBelow` is a problem. */
    goodFrom?: number
    warnBelow?: number
    /** Called when someone opens the runbook for the selected service and region. */
    onOpenRunbook?: (serviceId: string, regionId: string) => void
  }

const services: Matrix1Service[] = [
  { id: "api", name: "API", team: "Platform" },
  { id: "auth", name: "Sign-in", team: "Platform" },
  { id: "pay", name: "Payments", team: "Billing" },
  { id: "search", name: "Search", team: "Discovery" },
  { id: "media", name: "Media", team: "Discovery" },
  { id: "ai", name: "Assistant", team: "AI" },
]
const regions: Matrix1Region[] = [
  { id: "us", label: "US East" },
  { id: "eu", label: "Europe" },
  { id: "ap", label: "Asia Pacific" },
  { id: "sa", label: "South America" },
]
const availability: (number | null)[][] = [
  [99.99, 99.98, 99.95, 99.92],
  [99.99, 99.99, 99.97, 99.9],
  [99.97, 99.82, 99.93, null],
  [99.94, 99.91, 99.2, 99.88],
  [99.9, 99.96, 99.86, 99.4],
  [99.6, 99.1, 98.4, null],
]
const incidents: Record<string, Matrix1Incident> = {
  "pay:eu": { when: "17 Oct", summary: "Card payments failed for 38 minutes after a certificate expired on the European gateway." },
  "search:ap": { when: "21 Oct", summary: "The index fell behind by two hours and results were stale." },
  "ai:ap": { when: "22 Oct", summary: "Model calls from Asia Pacific timed out for most of an afternoon." },
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
    </div>
  )
}

/**
 * Service health by region at a glance: availability over the last thirty days for every service in every region, each cell good, warning or problem in words
 * and an icon as well as a tint. Pick a cell for the last incident there and a button to open its runbook; filter the rows by team.
 */
function Matrix1({ services: svc = services, regions: reg = regions, availability: values = availability, incidents: inc = incidents, title = "Service health", goodFrom = 99.9, warnBelow = 99, onOpenRunbook, state = "ready", onRetry, emptyState, errorState, className, ...props }: Matrix1Props) {
  const id = React.useId()
  const [team, setTeam] = React.useState("all")
  const [cell, setCell] = React.useState<[number, number] | null>(null)
  const view = state === "ready" && svc.length === 0 ? "empty" : state
  const teams = [...new Set(svc.map((s) => s.team))]
  const rows = svc.map((s, i) => ({ s, i })).filter(({ s }) => team === "all" || s.team === team)
  const shownValues = rows.map(({ i }) => values[i] ?? [])
  const sel = cell ? { service: rows[cell[0]]?.s, region: reg[cell[1]], value: shownValues[cell[0]]?.[cell[1]] } : null
  const problems = rows.flatMap(({ s, i }) => reg.map((r, c) => ({ s, r, v: values[i]?.[c] ?? null }))).filter((x) => x.v !== null && x.v < warnBelow)
  const key = sel?.service && sel.region ? `${sel.service.id}:${sel.region.id}` : ""

  return (
    <section data-slot="matrix-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-pretty">Availability over the last 30 days, for every service in every region.</p>
        </div>
        {view === "ready" && teams.length > 1 && (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Team</span>
            <select value={team} onChange={(e) => { setTeam(e.target.value); setCell(null) }} className="bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]">
              <option value="all">All teams</option>
              {teams.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        )}
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading service health" loading={<Skel />} empty={{ title: "No services yet", description: "Register a service and its availability will appear here, region by region.", ...emptyState }} error={{ title: "Service health could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <p aria-live="polite" className="text-muted-foreground mb-4 text-sm">
          {problems.length ? <><strong className="text-foreground">{problems.length} {problems.length === 1 ? "combination is" : "combinations are"} below {warnBelow}%.</strong> {problems.map((p) => `${p.s.name} in ${p.r.label}`).join(", ")}.</> : `Everything is at or above ${warnBelow}%.`}
        </p>
        <HeatGrid
          rowLabel="Service"
          columnLabel="Region"
          rows={rows.map(({ s }) => ({ id: s.id, label: s.name }))}
          columns={reg}
          values={shownValues}
          format={(v) => `${v}%`}
          tone={(v) => (v >= goodFrom ? "good" : v >= warnBelow ? "warn" : "bad")}
          selected={cell}
          onSelectedChange={setCell}
        />
        <div aria-live="polite" className="bg-card mt-4 min-h-[5.5rem] rounded-xl border p-4">
          {sel?.service && sel.region ? (
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{sel.service.name} in {sel.region.label} <span className="text-muted-foreground font-normal">· {sel.service.team}</span></p>
                <p className="text-muted-foreground mt-0.5 text-sm tabular-nums">{sel.value === null || sel.value === undefined ? "This service does not run in this region." : `${sel.value}% available over 30 days`}</p>
                {inc[key] ? (
                  <p className="mt-2 flex max-w-xl gap-2 text-sm"><CalendarClock aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span><span className="font-medium">Last incident, {inc[key].when}:</span> {inc[key].summary}</span></p>
                ) : sel.value !== null && sel.value !== undefined ? (
                  <p className="text-muted-foreground mt-2 text-sm">No incident recorded here in the last 30 days.</p>
                ) : null}
              </div>
              {sel.value !== null && sel.value !== undefined && (
                <Button size="sm" variant="outline" onClick={() => onOpenRunbook?.(sel.service!.id, sel.region.id)}>
                  <BookOpenCheck aria-hidden="true" /> Open runbook
                </Button>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Select a cell for the last incident there. The arrow keys move between cells.</p>
          )}
        </div>
      </StateView>
    </section>
  )
}

export { Matrix1, type Matrix1Incident, type Matrix1Props, type Matrix1Region, type Matrix1Service }
