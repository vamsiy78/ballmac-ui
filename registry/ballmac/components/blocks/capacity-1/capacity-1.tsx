// Ballmac UI: Capacity 1. https://ui.ballmac.com/blocks/capacity-1
"use client"

import * as React from "react"
import { Check, CircleAlert, Clock, Loader2, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Capacity1Resource = {
  id: string
  name: string
  /** What it is measured in, for example "GB" or "connections". */
  unit: string
  used: number
  limit: number
  /** How much it grows by each day, in the same unit. Zero or less means it is not growing. */
  perDay: number
  /** Where it lives, such as "Production database". */
  where?: string
}

type Capacity1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    resources?: Capacity1Resource[]
    title?: string
    /** Runway of this many days or fewer is urgent. */
    urgentDays?: number
    /** Runway of this many days or fewer needs planning. */
    planDays?: number
    /** Called when someone asks for more. Reject and the message says it was not sent. */
    onRequest?: (resource: Capacity1Resource) => void | Promise<void>
  }

const sample: Capacity1Resource[] = [
  { id: "r1", name: "Database storage", unit: "GB", used: 842, limit: 1000, perDay: 11.5, where: "Production database" },
  { id: "r2", name: "Object storage", unit: "TB", used: 18.2, limit: 40, perDay: 0.09, where: "User uploads" },
  { id: "r3", name: "Database connections", unit: "connections", used: 410, limit: 500, perDay: 3.2, where: "Primary" },
  { id: "r4", name: "Log retention", unit: "GB", used: 3300, limit: 5000, perDay: 0, where: "Observability" },
  { id: "r5", name: "Queue throughput", unit: "msg/s", used: 8900, limit: 10000, perDay: 140, where: "Email and webhooks" },
]

type Level = "urgent" | "plan" | "ok" | "steady"
/** Days until the limit is reached at the current growth, or null when it is not growing. */
const runway = (r: Capacity1Resource) => (r.perDay > 0 ? Math.max(0, (r.limit - r.used) / r.perDay) : null)
const levelOf = (r: Capacity1Resource, urgent: number, plan: number): Level => {
  const d = runway(r)
  return d === null ? "steady" : d <= urgent ? "urgent" : d <= plan ? "plan" : "ok"
}
const num = (n: number) => (n >= 100 ? Math.round(n) : +n.toFixed(1)).toLocaleString("en-US")

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  )
}

/**
 * How long until each resource runs out: how full it is, how fast it grows, and the days of runway left at that pace, written as words ("Full in about 14
 * days"). The ones that will fill soonest come first, and each has a button to ask for more. A resource that is not growing says so instead of a number.
 */
function Capacity1({ resources = sample, title = "Capacity", urgentDays = 14, planDays = 60, onRequest, state = "ready", onRetry, emptyState, errorState, className, ...props }: Capacity1Props) {
  const id = React.useId()
  const [asked, setAsked] = React.useState<string[]>([])
  const [busy, setBusy] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<{ id: string; ok: boolean; text: string } | null>(null)
  const view = state === "ready" && resources.length === 0 ? "empty" : state
  const order: Level[] = ["urgent", "plan", "ok", "steady"]
  const sorted = [...resources].sort((a, b) => order.indexOf(levelOf(a, urgentDays, planDays)) - order.indexOf(levelOf(b, urgentDays, planDays)) || (runway(a) ?? Infinity) - (runway(b) ?? Infinity))
  const urgent = resources.filter((r) => levelOf(r, urgentDays, planDays) === "urgent").length

  async function request(r: Capacity1Resource) {
    setBusy(r.id)
    setNote(null)
    try {
      await onRequest?.(r)
      setAsked((a) => [...a, r.id])
      setNote({ id: r.id, ok: true, text: `Requested more ${r.name.toLowerCase()}. The team will confirm.` })
    } catch (e) {
      setNote({ id: r.id, ok: false, text: e instanceof Error ? e.message : "The request was not sent." })
    } finally {
      setBusy(null)
    }
  }

  return (
    <section data-slot="capacity-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-pretty">How full each resource is, and how many days are left at the current pace.</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading capacity" loading={<Skel />} empty={{ title: "No resources tracked", description: "Add a resource with its limit and its growth, and its runway will be worked out here.", ...emptyState }} error={{ title: "Capacity could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <p aria-live="polite" className="text-muted-foreground mb-4 text-sm">
          {urgent ? <><strong className="text-foreground">{urgent} {urgent === 1 ? "resource fills" : "resources fill"} within {urgentDays} days.</strong> They are listed first.</> : `Nothing fills within ${urgentDays} days.`}
        </p>
        <ul className="grid gap-3">
          {sorted.map((r) => {
            const lv = levelOf(r, urgentDays, planDays)
            const days = runway(r)
            const pct = Math.min(100, (r.used / r.limit) * 100)
            const Icon = lv === "urgent" ? CircleAlert : lv === "plan" ? TriangleAlert : lv === "ok" ? Check : Clock
            const words = days === null ? "Not growing" : days < 1 ? "Full within a day" : `Full in about ${Math.round(days)} ${Math.round(days) === 1 ? "day" : "days"}`
            return (
              <li key={r.id} data-level={lv} className={cn("bg-card rounded-xl border p-4 sm:p-5", lv === "urgent" && "border-destructive/50")}>
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                  <div className="min-w-0">
                    <p className="font-medium">{r.name}</p>
                    {r.where && <p className="text-muted-foreground text-xs">{r.where}</p>}
                  </div>
                  <p className={cn("flex items-center gap-1.5 text-sm tabular-nums", lv === "urgent" ? "text-destructive font-semibold" : lv === "plan" ? "text-foreground font-medium" : "text-muted-foreground")}>
                    <Icon aria-hidden="true" className="size-4" /> {words}
                  </p>
                </div>
                <div role="meter" aria-label={`${r.name} used`} aria-valuemin={0} aria-valuemax={r.limit} aria-valuenow={r.used} aria-valuetext={`${num(r.used)} of ${num(r.limit)} ${r.unit}, ${Math.round(pct)} percent. ${words}.`} className="bg-muted mt-3 h-2.5 overflow-hidden rounded-full">
                  <div className={cn("h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", lv === "urgent" ? "bg-destructive" : lv === "plan" ? "bg-chart-3" : "bg-foreground")} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                  <p className="text-muted-foreground text-xs tabular-nums">{num(r.used)} of {num(r.limit)} {r.unit} · {Math.round(pct)}% used{r.perDay > 0 ? ` · grows ${num(r.perDay)} ${r.unit} a day` : ""}</p>
                  {lv !== "steady" && lv !== "ok" && !asked.includes(r.id) && (
                    <Button size="sm" variant={lv === "urgent" ? "default" : "outline"} disabled={busy === r.id} onClick={() => void request(r)} aria-label={`Ask for more ${r.name.toLowerCase()}`}>
                      {busy === r.id && <Loader2 aria-hidden="true" className="animate-spin" />} Ask for more
                    </Button>
                  )}
                </div>
                {note?.id === r.id && <p role={note.ok ? "status" : "alert"} className={cn("mt-2 text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}
              </li>
            )
          })}
        </ul>
      </StateView>
    </section>
  )
}

export { Capacity1, runway, type Capacity1Props, type Capacity1Resource }
