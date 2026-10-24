// Ballmac UI: Kitchen 1. https://ui.ballmac.com/blocks/kitchen-1
"use client"

import * as React from "react"
import { Check, Clock, TriangleAlert, Undo2 } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Kitchen1Item = {
  qty: number
  name: string
  /** Changes to the dish, such as "no onions" or "sauce on the side". */
  mods?: string[]
  /** An allergy to take care of, such as "Peanuts". Always shown in words. */
  allergy?: string
}

type Kitchen1Ticket = {
  id: string
  /** Order number shown large, for example "128". */
  number: string
  /** Where it is going: "Table 12", "Delivery", "Pickup". */
  channel: string
  /** The station that makes it, matching one of `stations`. */
  station: string
  items: Kitchen1Item[]
  /** Seconds since it was sent to the kitchen. The parent keeps this up to date. */
  elapsed: number
  /** Seconds it should be ready within. */
  target: number
}

type Kitchen1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    tickets?: Kitchen1Ticket[]
    stations?: string[]
    title?: string
    /** Called when a ticket is bumped, meaning that station has finished it. */
    onBump?: (ticket: Kitchen1Ticket) => void | Promise<void>
    /** Called when the last bumped ticket is brought back. */
    onRecall?: (ticket: Kitchen1Ticket) => void | Promise<void>
  }

const stations = ["Grill", "Fry", "Cold"]
const sample: Kitchen1Ticket[] = [
  { id: "t1", number: "126", channel: "Table 4", station: "Grill", elapsed: 842, target: 720, items: [{ qty: 2, name: "Smash burger", mods: ["no pickles"] }, { qty: 1, name: "Grilled halloumi", allergy: "Milk" }] },
  { id: "t2", number: "127", channel: "Delivery", station: "Grill", elapsed: 410, target: 720, items: [{ qty: 1, name: "Chicken skewers", mods: ["extra hot"] }] },
  { id: "t3", number: "128", channel: "Table 12", station: "Grill", elapsed: 95, target: 720, items: [{ qty: 3, name: "Smash burger" }, { qty: 1, name: "Veggie burger", mods: ["vegan bun"] }] },
  { id: "t4", number: "126", channel: "Table 4", station: "Fry", elapsed: 842, target: 480, items: [{ qty: 2, name: "Fries", mods: ["salt only"] }, { qty: 1, name: "Onion rings" }] },
  { id: "t5", number: "129", channel: "Pickup", station: "Fry", elapsed: 180, target: 480, items: [{ qty: 2, name: "Fries" }] },
  { id: "t6", number: "127", channel: "Delivery", station: "Cold", elapsed: 390, target: 420, items: [{ qty: 1, name: "House salad", mods: ["dressing on the side"], allergy: "Peanuts" }] },
]

const mmss = (s: number) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, Math.floor(s)) % 60).padStart(2, "0")}`
type Level = "ok" | "soon" | "late"
const levelOf = (t: Kitchen1Ticket): Level => (t.elapsed > t.target ? "late" : t.elapsed >= t.target * 0.8 ? "soon" : "ok")

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid gap-3">
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ))}
    </div>
  )
}

/**
 * A kitchen display: a column per station, the oldest ticket first, each with the order number, where it is going, every item with its changes, and the
 * time it has waited. Late and nearly-late tickets say so in words, allergies are always spelled out, and Bump clears a ticket with a one-step Recall.
 * It keeps no clock of its own: pass `elapsed` and update it as often as you like.
 */
function Kitchen1({ tickets: ticketsProp = sample, stations: cols = stations, title = "Kitchen", onBump, onRecall, state = "ready", onRetry, emptyState, errorState, className, ...props }: Kitchen1Props) {
  const id = React.useId()
  const [bumped, setBumped] = React.useState<string[]>([])
  const [note, setNote] = React.useState<{ ok: boolean; text: string } | null>(null)
  const view = state === "ready" && ticketsProp.length === 0 ? "empty" : state
  const live = ticketsProp.filter((t) => !bumped.includes(t.id))
  const last = bumped.length ? ticketsProp.find((t) => t.id === bumped[bumped.length - 1]) : undefined
  const late = live.filter((t) => levelOf(t) === "late").length

  async function bump(t: Kitchen1Ticket) {
    setNote(null)
    setBumped((b) => [...b, t.id])
    try {
      await onBump?.(t)
    } catch (e) {
      setBumped((b) => b.filter((x) => x !== t.id))
      setNote({ ok: false, text: e instanceof Error ? e.message : `Order ${t.number} could not be bumped, so it is still on the screen.` })
    }
  }
  async function recall() {
    if (!last) return
    setBumped((b) => b.slice(0, -1))
    try {
      await onRecall?.(last)
    } catch (e) {
      setBumped((b) => [...b, last.id])
      setNote({ ok: false, text: e instanceof Error ? e.message : `Order ${last.number} could not be brought back.` })
    }
  }

  return (
    <section data-slot="kitchen-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
            {title}
          </h1>
          <p aria-live="polite" className="text-muted-foreground mt-2 tabular-nums">
            {live.length} {live.length === 1 ? "ticket" : "tickets"} open{late ? <> · <strong className="text-foreground">{late} late</strong></> : ""}
          </p>
        </div>
        {view === "ready" && (
          <Button variant="outline" disabled={!last} onClick={() => void recall()}>
            <Undo2 aria-hidden="true" className="rtl:-scale-x-100" /> Recall {last ? `order ${last.number}` : "last bump"}
          </Button>
        )}
      </header>
      {note && <p role="alert" className="text-destructive mb-4 text-sm font-medium">{note.text}</p>}
      <StateView state={view} onRetry={onRetry} label="Loading tickets" loading={<Skel />} empty={{ title: "No tickets", description: "New orders appear here as soon as they are sent to the kitchen.", ...emptyState }} error={{ title: "Tickets could not be loaded", description: "Nothing was bumped. Check the connection and try again.", ...errorState }}>
        <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(16rem, 1fr))` }}>
          {cols.map((s) => {
            const mine = live.filter((t) => t.station === s).sort((a, b) => b.elapsed - a.elapsed)
            return (
              <section key={s} aria-label={`${s} station`} className="min-w-0">
                <h2 className="bg-muted/50 mb-3 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold">
                  {s}
                  <span className="text-muted-foreground font-mono text-xs tabular-nums">{mine.length}</span>
                </h2>
                <ul className="grid gap-3">
                  {mine.map((t) => {
                    const lv = levelOf(t)
                    return (
                      <li key={t.id} data-level={lv} className={cn("bg-card rounded-xl border p-4", lv === "late" && "border-destructive border-2", lv === "soon" && "border-chart-3")}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-2xl leading-none font-semibold tracking-tight tabular-nums"><span className="sr-only">Order </span>{t.number}</p>
                            <p className="text-muted-foreground mt-1 text-sm">{t.channel}</p>
                          </div>
                          <p className={cn("flex items-center gap-1.5 text-sm tabular-nums", lv === "late" ? "text-destructive font-semibold" : lv === "soon" ? "text-foreground font-medium" : "text-muted-foreground")}>
                            {lv === "ok" ? <Clock aria-hidden="true" className="size-4" /> : <TriangleAlert aria-hidden="true" className="size-4" />}
                            {mmss(t.elapsed)}
                            {lv !== "ok" && <span className="text-xs">{lv === "late" ? "Late" : "Due soon"}</span>}
                          </p>
                        </div>
                        <ul className="mt-3 grid gap-2 border-t pt-3">
                          {t.items.map((it, i) => (
                            <li key={i} className="text-sm">
                              <p className="font-medium"><span className="tabular-nums">{it.qty}×</span> {it.name}</p>
                              {it.mods?.map((m) => (
                                <p key={m} className="text-muted-foreground ps-5 text-[13px]">{m}</p>
                              ))}
                              {it.allergy && (
                                <p className="mt-1 ms-5 flex w-fit items-center gap-1.5 rounded-md border border-destructive px-2 py-0.5 text-xs font-semibold text-destructive">
                                  <TriangleAlert aria-hidden="true" className="size-3.5" /> Allergy: {it.allergy}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                        <Button className="mt-4 w-full" size="lg" aria-label={`Bump order ${t.number} at ${s}`} onClick={() => void bump(t)}>
                          <Check aria-hidden="true" /> Bump
                        </Button>
                      </li>
                    )
                  })}
                </ul>
                {mine.length === 0 && <p className="text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm">All clear.</p>}
              </section>
            )
          })}
        </div>
      </StateView>
    </section>
  )
}

export { Kitchen1, type Kitchen1Item, type Kitchen1Props, type Kitchen1Ticket }
