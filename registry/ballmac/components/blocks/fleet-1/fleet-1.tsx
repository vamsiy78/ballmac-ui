// Ballmac UI: Fleet 1. https://ui.ballmac.com/blocks/fleet-1
"use client"

import * as React from "react"
import { CircleAlert, Fuel, Loader2, MapPin, MessageSquare, Wrench } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Fleet1Status = "moving" | "idle" | "parked" | "service"

type Fleet1Vehicle = {
  id: string
  name: string
  plate: string
  driver?: string
  status: Fleet1Status
  /** Where it is, in words: "A4 near Reading, heading east". */
  where: string
  /** Current speed, for a moving vehicle. */
  speedKmh?: number
  /** Fuel or charge, 0 to 100. */
  level: number
  /** Distance until the next service. */
  serviceInKm: number
  /** Faults or warnings, in plain words. */
  alerts?: string[]
}

type Fleet1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    vehicles?: Fleet1Vehicle[]
    title?: string
    /** Below this percentage the level is called low. */
    lowLevel?: number
    /** Service due within this many kilometres is called out. */
    serviceSoonKm?: number
    /** Called to send the driver a message. Reject and the message says it was not sent. */
    onMessage?: (vehicle: Fleet1Vehicle, text: string) => void | Promise<void>
    /** Called to book a service. */
    onBookService?: (vehicle: Fleet1Vehicle) => void | Promise<void>
  }

const sample: Fleet1Vehicle[] = [
  { id: "v1", name: "Van 12", plate: "KX71 OPD", driver: "Marcus Bell", status: "moving", where: "A4 near Reading, heading east", speedKmh: 86, level: 62, serviceInKm: 4100 },
  { id: "v2", name: "Van 07", plate: "KX70 FRM", driver: "Aisha Rahman", status: "moving", where: "Dock Road, Bristol", speedKmh: 24, level: 11, serviceInKm: 380, alerts: ["Tyre pressure low on the rear left"] },
  { id: "v3", name: "Truck 03", plate: "LM21 TTB", driver: "Piotr Nowak", status: "idle", where: "Kiln Street depot, engine running", level: 48, serviceInKm: 9200 },
  { id: "v4", name: "Van 02", plate: "KX69 AAC", status: "parked", where: "Yard, bay 4", level: 90, serviceInKm: 1200 },
  { id: "v5", name: "Van 09", plate: "KX71 HJL", status: "service", where: "Ridge Garage, booked until Friday", level: 35, serviceInKm: 0, alerts: ["Brake pads being replaced"] },
  { id: "v6", name: "Truck 01", plate: "LM19 CCD", driver: "Mei Tanaka", status: "moving", where: "M5 junction 15, heading north", speedKmh: 92, level: 27, serviceInKm: 640 },
]

const STATUS: Record<Fleet1Status, string> = { moving: "Moving", idle: "Idle", parked: "Parked", service: "In service" }
const num = (n: number) => n.toLocaleString("en-US")

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-3 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  )
}

/**
 * A fleet at a glance: each vehicle with its state in words (moving, idle, parked, in service), where it is, who is driving, its fuel or charge and the distance
 * to its next service. Anything that needs attention (a fault, a low level, a service due soon) is written out and sorted first. Choose a vehicle to message
 * the driver or book a service.
 */
function Fleet1({ vehicles = sample, title = "Fleet", lowLevel = 15, serviceSoonKm = 1000, onMessage, onBookService, state = "ready", onRetry, emptyState, errorState, className, ...props }: Fleet1Props) {
  const id = React.useId()
  const [filter, setFilter] = React.useState<Fleet1Status | "all">("all")
  const [sel, setSel] = React.useState<string | null>(null)
  const [text, setText] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [note, setNote] = React.useState<{ ok: boolean; text: string } | null>(null)
  const view = state === "ready" && vehicles.length === 0 ? "empty" : state
  const issues = (v: Fleet1Vehicle) => [...(v.alerts ?? []), ...(v.level < lowLevel ? [`Low ${"level"}: ${v.level}%`] : []), ...(v.status !== "service" && v.serviceInKm <= serviceSoonKm ? [`Service due in ${num(v.serviceInKm)} km`] : [])]
  const shown = vehicles.filter((v) => filter === "all" || v.status === filter).sort((a, b) => issues(b).length - issues(a).length)
  const count = (s: Fleet1Status | "all") => (s === "all" ? vehicles.length : vehicles.filter((v) => v.status === s).length)
  const chosen = vehicles.find((v) => v.id === sel)
  const attention = vehicles.filter((v) => issues(v).length > 0).length

  async function run(work: () => void | Promise<void>, ok: string, after?: () => void) {
    setBusy(true)
    setNote(null)
    try {
      await work()
      after?.()
      setNote({ ok: true, text: ok })
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : "That did not go through." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section data-slot="fleet-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p aria-live="polite" className="text-muted-foreground mt-2 max-w-xl text-pretty">{attention ? <><strong className="text-foreground">{attention} {attention === 1 ? "vehicle needs" : "vehicles need"} attention.</strong> They are listed first.</> : "Nothing needs attention."}</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the fleet" loading={<Skel />} empty={{ title: "No vehicles yet", description: "Add a vehicle and it will appear here with where it is and how it is doing.", ...emptyState }} error={{ title: "The fleet could not be loaded", description: "Nothing was sent or changed. Check your connection and try again.", ...errorState }}>
        <div role="group" aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
          {(["all", "moving", "idle", "parked", "service"] as const).map((k) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={cn("focus-visible:ring-ring/50 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", filter === k ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
              {k === "all" ? "All" : STATUS[k]} <span className={cn("tabular-nums", filter === k ? "opacity-70" : "text-muted-foreground")}>{count(k)}</span>
            </button>
          ))}
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {shown.map((v) => {
            const is = issues(v)
            const low = v.level < lowLevel
            const on = sel === v.id
            return (
              <li key={v.id}>
                <button type="button" aria-pressed={on} onClick={() => { setSel(on ? null : v.id); setNote(null); setText("") }} className={cn("bg-card focus-visible:ring-ring/50 flex h-full w-full flex-col gap-3 rounded-xl border p-4 text-start outline-none transition-colors hover:bg-accent/30 focus-visible:ring-[3px] motion-reduce:transition-none", on && "border-foreground", is.length > 0 && !on && "border-chart-3/70")}>
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block font-medium">{v.name} <span className="text-muted-foreground font-mono text-xs font-normal" dir="ltr">{v.plate}</span></span>
                      <span className="text-muted-foreground block text-xs">{v.driver ?? "No driver"}</span>
                    </span>
                    <span className="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium">{STATUS[v.status]}{v.status === "moving" && v.speedKmh !== undefined ? ` · ${v.speedKmh} km/h` : ""}</span>
                  </span>
                  <span className="text-muted-foreground flex items-start gap-1.5 text-xs"><MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />{v.where}</span>
                  <span className="grid gap-1">
                    <span className="flex items-center justify-between text-xs"><span className="flex items-center gap-1.5"><Fuel aria-hidden="true" className="size-3.5" /> Level</span><span className={cn("tabular-nums", low && "text-destructive font-semibold")}>{v.level}%{low ? " · low" : ""}</span></span>
                    <span role="meter" aria-label={`${v.name} level`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v.level} aria-valuetext={`${v.level} percent${low ? ", low" : ""}`} className="bg-muted block h-1.5 overflow-hidden rounded-full"><span className={cn("block h-full rounded-full", low ? "bg-destructive" : "bg-foreground")} style={{ width: `${v.level}%` }} /></span>
                  </span>
                  {is.length > 0 && (
                    <span className="grid gap-1 text-xs font-medium">
                      {is.map((i) => (
                        <span key={i} className="flex items-center gap-1.5"><CircleAlert aria-hidden="true" className="text-chart-3 size-3.5 shrink-0" />{i}</span>
                      ))}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <div aria-live="polite" className="bg-card mt-4 min-h-[5.5rem] rounded-xl border p-4">
          {chosen ? (
            <div className="grid gap-3">
              <p className="font-medium">{chosen.name} <span className="text-muted-foreground font-normal">· next service in {num(chosen.serviceInKm)} km</span></p>
              {note && <p role={note.ok ? "status" : "alert"} className={cn("text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}
              <div className="flex flex-wrap items-center gap-2">
                {chosen.driver && (
                  <>
                    <label className="sr-only" htmlFor={`${id}-msg`}>Message for {chosen.driver}</label>
                    <input id={`${id}-msg`} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${chosen.driver}`} className="bg-background focus-visible:ring-ring/50 h-9 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]" />
                    <Button size="sm" disabled={!text.trim() || busy} onClick={() => void run(() => onMessage?.(chosen, text.trim()), `Sent to ${chosen.driver}.`, () => setText(""))}>{busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : <MessageSquare aria-hidden="true" />} Send</Button>
                  </>
                )}
                {chosen.status !== "service" && (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => void run(() => onBookService?.(chosen), `A service is requested for ${chosen.name}.`)}><Wrench aria-hidden="true" /> Book a service</Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Select a vehicle to message the driver or book a service.</p>
          )}
        </div>
      </StateView>
    </section>
  )
}

export { Fleet1, type Fleet1Props, type Fleet1Status, type Fleet1Vehicle }
