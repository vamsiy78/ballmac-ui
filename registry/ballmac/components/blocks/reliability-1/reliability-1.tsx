// Ballmac UI: Reliability 1. https://ui.ballmac.com/blocks/reliability-1
"use client"

import * as React from "react"
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react"

import { Gauge, type GaugeZone } from "@/components/ballmac/gauge"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { UptimeTracker, type UptimeDay } from "@/components/ballmac/uptime-tracker"
import { cn } from "@/lib/utils"

type Reliability1Service = { id: string; name: string; days: UptimeDay[]; uptime?: number }
type Reliability1Incident = { id: string; title: string; when: string; duration: string; status: "resolved" | "monitoring" | "investigating"; summary: string }
type Reliability1Budget = { id: string; label: string; value: number; target: number; description: string; /** The low end of the scale. Defaults to 0. */ min?: number; /** Zones from low to high. Defaults to At risk, Watch it and Healthy around the target. */ zones?: GaugeZone[] }

type Reliability1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    services?: Reliability1Service[]
    budgets?: Reliability1Budget[]
    incidents?: Reliability1Incident[]
  }

function make(overrides: Record<number, Partial<UptimeDay>> = {}): UptimeDay[] {
  return Array.from({ length: 60 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 7, 27 + i))
    return { date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), status: "up" as const, ...overrides[i] }
  })
}

const sampleServices: Reliability1Service[] = [
  { id: "api", name: "API", days: make({ 12: { status: "degraded", note: "Slow responses for 25 minutes" }, 33: { status: "down", note: "42 minutes of errors after a bad deploy" }, 34: { status: "degraded", note: "Recovering, queues drained" }, 51: { status: "degraded", note: "Elevated latency in one region" } }) },
  { id: "web", name: "Website", days: make({ 20: { status: "degraded", note: "CDN cache purge slowed pages" } }) },
  { id: "auth", name: "Sign in", days: make({ 41: { status: "degraded", note: "Passkey prompts were slow for 18 minutes" } }) },
  { id: "jobs", name: "Background jobs", days: make({ 5: { status: "none" }, 6: { status: "none" }, 44: { status: "down", note: "A queue worker crashed for 3 hours" }, 58: { status: "degraded", note: "Backlog of 4,000 jobs" } }) },
]

const sampleBudgets: Reliability1Budget[] = [
  { id: "a", label: "Error budget left", value: 72, target: 50, description: "For the 99.9% promise this quarter", zones: [{ to: 25, label: "At risk" }, { to: 50, label: "Watch it" }, { to: 100, label: "Healthy" }] },
  { id: "b", label: "Requests under 300 ms", value: 94, target: 95, description: "p95 latency objective", min: 80, zones: [{ to: 90, label: "At risk" }, { to: 95, label: "Watch it" }, { to: 100, label: "Healthy" }] },
  { id: "c", label: "Jobs finished on time", value: 99, target: 98, description: "Within 5 minutes of being queued", min: 90, zones: [{ to: 95, label: "At risk" }, { to: 98, label: "Watch it" }, { to: 100, label: "Healthy" }] },
]

const sampleIncidents: Reliability1Incident[] = [
  { id: "1", title: "Elevated latency in the EU region", when: "Today, 09:12", duration: "Ongoing", status: "monitoring", summary: "A database failover finished. Response times are back to normal and we are watching for a repeat." },
  { id: "2", title: "Checkout errors after a deploy", when: "Oct 3, 14:05", duration: "42 minutes", status: "resolved", summary: "A bad migration made payments return errors. We rolled back and added a check to the release step." },
  { id: "3", title: "Job queue stalled", when: "Oct 14, 02:10", duration: "3 hours", status: "resolved", summary: "A worker ran out of memory and did not restart. It now restarts itself and pages the on-call." },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}</div>
    </div>
  )
}

const STATUS = {
  resolved: { Icon: CircleCheck, word: "Resolved" },
  monitoring: { Icon: TriangleAlert, word: "Monitoring" },
  investigating: { Icon: CircleAlert, word: "Investigating" },
} as const

/**
 * A reliability page for a product: one sentence on whether things are working right now, each service's last two months day by day, how much of the error budget
 * is left, and the incidents behind the red days. Everything is said in words as well as colors.
 */
function Reliability1({ title = "Reliability", description = "How the service has held up over the last 60 days.", services = sampleServices, budgets = sampleBudgets, incidents = sampleIncidents, state = "ready", onRetry, emptyState, errorState, className, ...props }: Reliability1Props) {
  const id = React.useId()
  const view = state === "ready" && services.length === 0 ? "empty" : state
  const now = services.map((s) => ({ s, today: s.days[s.days.length - 1]?.status ?? "none" }))
  const down = now.filter((n) => n.today === "down")
  const slow = now.filter((n) => n.today === "degraded")
  const headline = down.length ? `${down.map((n) => n.s.name).join(", ")} ${down.length > 1 ? "are" : "is"} down right now` : slow.length ? `${slow.map((n) => n.s.name).join(", ")} ${slow.length > 1 ? "are" : "is"} running slowly` : "Everything is working"

  return (
    <section data-slot="reliability-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading reliability" loading={<Skel />} empty={{ title: "No services yet", description: "Add a service to start tracking its uptime.", ...emptyState }} error={{ title: "Reliability could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid gap-6">
          <p role="status" className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4 text-base font-medium">
            {down.length ? <CircleAlert aria-hidden="true" className="size-5 shrink-0" /> : slow.length ? <TriangleAlert aria-hidden="true" className="size-5 shrink-0" /> : <CircleCheck aria-hidden="true" className="size-5 shrink-0" />}
            {headline}
          </p>
          <div className="grid gap-6 rounded-xl border bg-card p-5 sm:p-6">
            {services.map((s) => <UptimeTracker key={s.id} label={s.name} days={s.days} uptime={s.uptime} startLabel="60 days ago" />)}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {budgets.map((b) => (
              <div key={b.id} className="rounded-xl border bg-card p-5">
                <Gauge label={b.label} value={b.value} min={b.min ?? 0} target={b.target} format={(v) => `${v}%`} description={b.description} zones={b.zones ?? [{ to: b.target - 10, label: "At risk" }, { to: b.target, label: "Watch it" }, { to: 100, label: "Healthy" }]} />
              </div>
            ))}
          </div>
          <div className="grid gap-3">
            <h2 className="text-sm font-semibold">Incidents</h2>
            <ul className="grid grid-cols-[minmax(0,1fr)] divide-y rounded-xl border bg-card">
              {incidents.map((i) => {
                const { Icon, word } = STATUS[i.status]
                return (
                  <li key={i.id} className="grid gap-1.5 px-5 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
                    <p className="text-xs text-muted-foreground tabular-nums">{i.when}<span className="block">{i.duration}</span></p>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        {i.title}
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-px text-[11px] font-medium"><Icon aria-hidden="true" className="size-3" />{word}</span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground text-pretty">{i.summary}</p>
                    </div>
                  </li>
                )
              })}
              {incidents.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted-foreground">No incidents in this period.</li>}
            </ul>
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Reliability1, type Reliability1Budget, type Reliability1Incident, type Reliability1Props, type Reliability1Service }
