// Ballmac UI: SLO 1. https://ui.ballmac.com/blocks/slo-1
"use client"

import * as React from "react"
import { CircleAlert, Flame, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react"

import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Slo1Item = {
  id: string
  /** For example "Checkout availability". */
  name: string
  service: string
  /** The goal, as a percentage, such as 99.9. */
  target: number
  /** How it is doing over the window, as a percentage, such as 99.94. */
  current: number
  /** Length of the window in days. */
  windowDays: number
  /** How fast the error budget is being used compared with a steady pace: 1 is exactly on pace. */
  burn: number
  /** Daily results over the window, oldest first, as percentages. */
  series: number[]
}

type Slo1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    slos?: Slo1Item[]
    title?: string
  }

const sample: Slo1Item[] = [
  { id: "s1", name: "Checkout availability", service: "Payments", target: 99.9, current: 99.94, windowDays: 30, burn: 0.6, series: [100, 100, 99.98, 100, 99.9, 100, 100, 99.95, 100, 100, 99.99, 100, 100, 99.97] },
  { id: "s2", name: "Search latency under 300 ms", service: "Search", target: 99.5, current: 99.62, windowDays: 30, burn: 1.4, series: [99.8, 99.6, 99.5, 99.2, 99.4, 99.1, 99.3, 99.4, 99.0, 99.2, 99.5, 99.3, 99.1, 99.3] },
  { id: "s3", name: "API success rate", service: "Platform", target: 99.95, current: 99.71, windowDays: 30, burn: 4.8, series: [99.99, 99.98, 99.9, 99.8, 99.7, 99.6, 99.7, 99.5, 99.6, 99.7, 99.8, 99.7, 99.6, 99.7] },
  { id: "s4", name: "Image processing within 10 s", service: "Media", target: 99, current: 99.62, windowDays: 30, burn: 0.3, series: [99.4, 99.7, 99.6, 99.8, 99.5, 99.6, 99.7, 99.6, 99.5, 99.7, 99.6, 99.8, 99.6, 99.7] },
]

/** How much of the error budget is left, as a percentage that can go below zero when the target is missed. */
function budgetLeft(s: Slo1Item) {
  const allowed = 100 - s.target
  return allowed > 0 ? (1 - (100 - s.current) / allowed) * 100 : 0
}
type Level = "healthy" | "watch" | "burning" | "breached"
function levelOf(s: Slo1Item): Level {
  const left = budgetLeft(s)
  if (left <= 0) return "breached"
  if (s.burn >= 2 || left < 25) return "burning"
  if (s.burn > 1 || left < 50) return "watch"
  return "healthy"
}
const LEVELS: Record<Level, { icon: LucideIcon; label: string; tone: string }> = {
  healthy: { icon: ShieldCheck, label: "Healthy", tone: "text-foreground" },
  watch: { icon: TriangleAlert, label: "Keep an eye on it", tone: "text-foreground" },
  burning: { icon: Flame, label: "Burning budget fast", tone: "text-foreground font-medium" },
  breached: { icon: CircleAlert, label: "Target missed", tone: "text-destructive font-medium" },
}

function Spark({ values, target }: { values: number[]; target: number }) {
  const lo = Math.min(...values, target)
  const hi = Math.max(...values, 100)
  const y = (v: number) => 28 - ((v - lo) / Math.max(hi - lo, 0.001)) * 26
  const pts = values.map((v, i) => `${(i / Math.max(values.length - 1, 1)) * 100},${y(v)}`).join(" ")
  return (
    <svg aria-hidden="true" viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full overflow-visible" style={{ direction: "ltr" }}>
      <line x1="0" x2="100" y1={y(target)} y2={y(target)} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-muted-foreground/60" vectorEffect="non-scaling-stroke" />
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  )
}

const pct = (n: number) => `${+n.toFixed(2)}%`

/**
 * Service level objectives as cards: the goal, how it is going, how much of the error budget is left in percent and in minutes, how fast it is being used,
 * and a small chart with the target drawn on it. Anything burning budget fast or past its target is put first and written out. Filter by service.
 */
function Slo1({ slos = sample, title = "Service level objectives", state = "ready", onRetry, emptyState, errorState, className, ...props }: Slo1Props) {
  const id = React.useId()
  const [service, setService] = React.useState("all")
  const view = state === "ready" && slos.length === 0 ? "empty" : state
  const services = [...new Set(slos.map((s) => s.service))]
  const order: Level[] = ["breached", "burning", "watch", "healthy"]
  const shown = slos.filter((s) => service === "all" || s.service === service).sort((a, b) => order.indexOf(levelOf(a)) - order.indexOf(levelOf(b)))
  const atRisk = slos.filter((s) => levelOf(s) === "breached" || levelOf(s) === "burning").length

  return (
    <section data-slot="slo-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-pretty">How reliable each service has been against the promise made for it, and how much room for failure is left.</p>
        </div>
        {view === "ready" && services.length > 1 && (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Service</span>
            <select value={service} onChange={(e) => setService(e.target.value)} className="bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]">
              <option value="all">All services</option>
              {services.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading objectives" loading={<Skel />} empty={{ title: "No objectives yet", description: "Set a target for a service, and its error budget will be tracked here.", ...emptyState }} error={{ title: "The objectives could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <p aria-live="polite" className="text-muted-foreground mb-4 text-sm">
          {atRisk ? <><strong className="text-foreground">{atRisk} {atRisk === 1 ? "objective needs" : "objectives need"} attention.</strong> They are listed first.</> : "Every objective is on track."}
        </p>
        <ul className="grid gap-4 sm:grid-cols-2">
          {shown.map((s) => {
            const left = budgetLeft(s)
            const lv = levelOf(s)
            const L = LEVELS[lv]
            const Icon = L.icon
            const minutes = s.windowDays * 24 * 60 * ((100 - s.target) / 100)
            const minutesLeft = Math.max(0, (minutes * Math.max(left, 0)) / 100)
            return (
              <li key={s.id} data-level={lv} className={cn("bg-card flex flex-col gap-4 rounded-xl border p-5", lv === "breached" && "border-destructive/50")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold tracking-tight">{s.name}</p>
                    <p className="text-muted-foreground text-xs">{s.service} · target {pct(s.target)} over {s.windowDays} days</p>
                  </div>
                  <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-xs", L.tone)}>
                    <Icon aria-hidden="true" className="size-3.5" />
                    {L.label}
                  </span>
                </div>
                <p className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight tabular-nums">{pct(s.current)}</span>
                  <span className="text-muted-foreground text-xs">now</span>
                </p>
                <div>
                  <div role="meter" aria-label={`Error budget left for ${s.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.round(left))} aria-valuetext={left <= 0 ? "No error budget left" : `${Math.round(left)} percent of the error budget left, about ${Math.round(minutesLeft)} of ${Math.round(minutes)} minutes`} className="bg-muted h-2 overflow-hidden rounded-full">
                    <div className={cn("h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", lv === "breached" ? "bg-destructive" : lv === "burning" ? "bg-chart-3" : "bg-foreground")} style={{ width: `${Math.min(100, Math.max(0, left))}%` }} />
                  </div>
                  <p className="text-muted-foreground mt-1.5 text-xs tabular-nums">{left <= 0 ? "No error budget left." : `${Math.round(left)}% of the error budget left, about ${Math.round(minutesLeft)} of ${Math.round(minutes)} minutes.`}</p>
                </div>
                <div className="text-muted-foreground"><Spark values={s.series} target={s.target} /></div>
                <p className="text-xs tabular-nums">
                  {s.burn > 1 ? <span className="text-foreground font-medium">Using budget {+s.burn.toFixed(1)}× faster than a steady pace.</span> : <span className="text-muted-foreground">Using budget at {+s.burn.toFixed(1)}× a steady pace.</span>}
                </p>
              </li>
            )
          })}
        </ul>
      </StateView>
    </section>
  )
}

export { Slo1, budgetLeft, type Slo1Item, type Slo1Props }
