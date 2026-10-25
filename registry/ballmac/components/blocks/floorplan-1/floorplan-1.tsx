// Ballmac UI: Floor plan 1. https://ui.ballmac.com/blocks/floorplan-1
"use client"

import * as React from "react"
import { Armchair, Clock, Loader2, Sparkles, Users } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Floorplan1Status = "free" | "seated" | "reserved" | "dirty"

type Floorplan1Table = {
  id: string
  /** For example "T4". */
  name: string
  seats: number
  /** Where the middle of the table is on the plan, as a percentage from the left and from the top. */
  x: number
  y: number
  shape?: "round" | "square" | "wide"
  status: Floorplan1Status
  /** Who is sitting here, for a seated table. */
  party?: { name: string; size: number; since: string }
  /** Who the table is held for, for a reserved table. */
  reservation?: { name: string; size: number; at: string }
}

type Floorplan1Party = { id: string; name: string; size: number; waited: string }

type Floorplan1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    tables?: Floorplan1Table[]
    /** Parties waiting for a table. */
    waiting?: Floorplan1Party[]
    title?: string
    /** Called when a waiting party or a reservation is seated. Reject and the table goes back with the message. */
    onSeat?: (tableId: string, party: { name: string; size: number }) => void | Promise<void>
    /** Called when a table is cleared (it becomes dirty) or marked clean (it becomes free). */
    onStatus?: (tableId: string, status: Floorplan1Status) => void | Promise<void>
  }

const tables: Floorplan1Table[] = [
  { id: "t1", name: "T1", seats: 2, x: 12, y: 18, shape: "round", status: "seated", party: { name: "Okafor", size: 2, since: "18:05" } },
  { id: "t2", name: "T2", seats: 2, x: 12, y: 46, shape: "round", status: "free" },
  { id: "t3", name: "T3", seats: 4, x: 12, y: 76, shape: "square", status: "reserved", reservation: { name: "Marsh", size: 4, at: "19:30" } },
  { id: "t4", name: "T4", seats: 4, x: 38, y: 24, shape: "square", status: "seated", party: { name: "Weber", size: 3, since: "18:20" } },
  { id: "t5", name: "T5", seats: 4, x: 38, y: 58, shape: "square", status: "dirty" },
  { id: "t6", name: "T6", seats: 6, x: 66, y: 22, shape: "wide", status: "free" },
  { id: "t7", name: "T7", seats: 6, x: 66, y: 56, shape: "wide", status: "seated", party: { name: "Rossi", size: 5, since: "17:50" } },
  { id: "t8", name: "T8", seats: 8, x: 84, y: 82, shape: "wide", status: "reserved", reservation: { name: "Haddad", size: 8, at: "20:00" } },
  { id: "t9", name: "Bar 1", seats: 2, x: 92, y: 20, shape: "round", status: "free" },
]
const waiting: Floorplan1Party[] = [
  { id: "w1", name: "Lopez", size: 2, waited: "12 min" },
  { id: "w2", name: "Reed", size: 5, waited: "6 min" },
  { id: "w3", name: "Tanaka", size: 3, waited: "2 min" },
]

const STATUS: Record<Floorplan1Status, { label: string; tone: string }> = {
  free: { label: "Free", tone: "bg-card" },
  seated: { label: "Seated", tone: "bg-chart-1/20 border-chart-1/60" },
  reserved: { label: "Reserved", tone: "bg-chart-3/15 border-chart-3/60 border-dashed" },
  dirty: { label: "Needs clearing", tone: "bg-muted border-dashed" },
}
const SIZE: Record<NonNullable<Floorplan1Table["shape"]>, string> = { round: "size-[4.6rem] rounded-full", square: "h-[5rem] w-[5rem] rounded-xl", wide: "h-[5rem] w-[8rem] rounded-xl" }

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <Skeleton className="aspect-[16/10] rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  )
}

/**
 * A restaurant floor plan for the host: every table where it is in the room, with its state in words (free, seated, reserved, needs clearing), who is at it and
 * since when, and the waiting list beside it. Pick a table to seat a party that fits, seat a reservation, clear it, or mark it clean. Changes show at once
 * and go back with the reason if they fail.
 */
function Floorplan1({ tables: tablesProp = tables, waiting: waitingProp = waiting, title = "Floor", onSeat, onStatus, state = "ready", onRetry, emptyState, errorState, className, ...props }: Floorplan1Props) {
  const id = React.useId()
  const [list, setList] = React.useState(tablesProp)
  React.useEffect(() => setList(tablesProp), [tablesProp])
  const [queue, setQueue] = React.useState(waitingProp)
  React.useEffect(() => setQueue(waitingProp), [waitingProp])
  const [sel, setSel] = React.useState<string | null>(null)
  const [pick, setPick] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [note, setNote] = React.useState<{ ok: boolean; text: string } | null>(null)
  const view = state === "ready" && list.length === 0 ? "empty" : state
  const t = list.find((x) => x.id === sel)
  const count = (s: Floorplan1Status) => list.filter((x) => x.status === s).length
  const fits = (tb: Floorplan1Table) => queue.filter((p) => p.size <= tb.seats)

  async function change(tb: Floorplan1Table, next: Floorplan1Table, work: () => void | Promise<void>, ok: string, after?: () => void) {
    setBusy(true)
    setNote(null)
    setList((l) => l.map((x) => (x.id === tb.id ? next : x)))
    try {
      await work()
      after?.()
      setNote({ ok: true, text: ok })
    } catch (e) {
      setList((l) => l.map((x) => (x.id === tb.id ? tb : x)))
      setNote({ ok: false, text: e instanceof Error ? e.message : `${tb.name} could not be changed, so it is as it was.` })
    } finally {
      setBusy(false)
    }
  }
  const seatParty = (tb: Floorplan1Table) => {
    const p = queue.find((x) => x.id === pick)
    if (!p) return
    void change(tb, { ...tb, status: "seated", party: { name: p.name, size: p.size, since: "now" } }, () => onSeat?.(tb.id, { name: p.name, size: p.size }), `${p.name} (${p.size}) is seated at ${tb.name}.`, () => (setQueue((q) => q.filter((x) => x.id !== p.id)), setPick("")))
  }

  return (
    <section data-slot="floorplan-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p aria-live="polite" className="text-muted-foreground mt-2 tabular-nums">{count("free")} free · {count("seated")} seated · {count("reserved")} reserved · {count("dirty")} to clear · {queue.length} waiting</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the floor" loading={<Skel />} empty={{ title: "No tables yet", description: "Add the tables of the room and they will appear on the plan.", ...emptyState }} error={{ title: "The floor could not be loaded", description: "No table was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="grid min-w-0 gap-4">
            <div role="region" tabIndex={0} aria-label="Floor plan. Scroll sideways on a small screen" className="focus-visible:ring-ring/50 relative overflow-x-auto rounded-2xl outline-none focus-visible:ring-[3px]">
            <div role="group" aria-label="Tables on the floor" className="bg-muted/30 relative aspect-[16/10] min-h-[22rem] w-full min-w-[40rem] overflow-hidden rounded-2xl border" style={{ backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
              {list.map((tb) => {
                const st = STATUS[tb.status]
                const on = sel === tb.id
                return (
                  <button
                    key={tb.id}
                    type="button"
                    data-status={tb.status}
                    aria-pressed={on}
                    aria-label={`${tb.name}, seats ${tb.seats}, ${st.label.toLowerCase()}${tb.party ? `, ${tb.party.name} party of ${tb.party.size}` : ""}${tb.reservation ? `, held for ${tb.reservation.name} at ${tb.reservation.at}` : ""}`}
                    onClick={() => { setSel(on ? null : tb.id); setPick(""); setNote(null) }}
                    className={cn("focus-visible:ring-ring/50 absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center border text-center outline-none transition-shadow focus-visible:z-10 focus-visible:ring-[3px] motion-reduce:transition-none", SIZE[tb.shape ?? "square"], st.tone, on ? "ring-foreground z-10 shadow-lg ring-2" : "hover:shadow-md")}
                    style={{ left: `${tb.x}%`, top: `${tb.y}%` }}
                  >
                    <span className="text-sm font-semibold">{tb.name}</span>
                    <span className="text-muted-foreground flex items-center gap-1 text-[11px]"><Armchair aria-hidden="true" className="size-3" />{tb.seats}</span>
                    <span className="text-[10px] leading-tight font-medium">{tb.status === "seated" && tb.party ? `${tb.party.name} · ${tb.party.since}` : tb.status === "reserved" && tb.reservation ? `${tb.reservation.name} · ${tb.reservation.at}` : st.label}</span>
                  </button>
                )
              })}
            </div>
            </div>
            <ul className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-1.5 text-xs" aria-label="Legend">
              {(Object.keys(STATUS) as Floorplan1Status[]).map((k) => (
                <li key={k} className="flex items-center gap-2"><span aria-hidden="true" className={cn("size-4 rounded border", STATUS[k].tone)} />{STATUS[k].label}</li>
              ))}
            </ul>
            <div aria-live="polite" className="bg-card min-h-[6.5rem] rounded-xl border p-4">
              {t ? (
                <div className="grid gap-2.5">
                  <p className="font-medium">{t.name} <span className="text-muted-foreground font-normal">· seats {t.seats} · {STATUS[t.status].label.toLowerCase()}</span></p>
                  {note && <p role={note.ok ? "status" : "alert"} className={cn("text-sm font-medium", !note.ok && "text-destructive")}>{note.text}</p>}
                  {t.status === "free" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-2 text-sm"><span className="sr-only">Party to seat at {t.name}</span>
                        <select aria-label={`Party to seat at ${t.name}`} value={pick} onChange={(e) => setPick(e.target.value)} className="bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]">
                          <option value="">{fits(t).length ? "Choose a waiting party" : "Nobody waiting fits"}</option>
                          {fits(t).map((p) => <option key={p.id} value={p.id}>{p.name}, {p.size}, waited {p.waited}</option>)}
                        </select>
                      </label>
                      <Button size="sm" disabled={!pick || busy} onClick={() => seatParty(t)}>{busy && <Loader2 aria-hidden="true" className="animate-spin" />} Seat at {t.name}</Button>
                    </div>
                  )}
                  {t.status === "reserved" && t.reservation && (
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center gap-1.5"><Clock aria-hidden="true" className="size-4" /> {t.reservation.name}, party of {t.reservation.size}, at {t.reservation.at}</span>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => void change(t, { ...t, status: "seated", party: { name: t.reservation!.name, size: t.reservation!.size, since: "now" }, reservation: undefined }, () => onSeat?.(t.id, { name: t.reservation!.name, size: t.reservation!.size }), `${t.reservation!.name} is seated at ${t.name}.`)}>Seat them now</Button>
                    </div>
                  )}
                  {t.status === "seated" && t.party && (
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center gap-1.5"><Users aria-hidden="true" className="size-4" /> {t.party.name}, party of {t.party.size}, since {t.party.since}</span>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => void change(t, { ...t, status: "dirty", party: undefined }, () => onStatus?.(t.id, "dirty"), `${t.name} is cleared and needs clearing.`)}>Clear table</Button>
                    </div>
                  )}
                  {t.status === "dirty" && (
                    <Button size="sm" variant="outline" className="w-fit" disabled={busy} onClick={() => void change(t, { ...t, status: "free" }, () => onStatus?.(t.id, "free"), `${t.name} is free.`)}><Sparkles aria-hidden="true" /> Mark clean</Button>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Select a table to seat a party, clear it or mark it clean.</p>
              )}
            </div>
          </div>
          <aside aria-labelledby={`${id}-wait`} className="bg-card h-fit rounded-xl border p-4">
            <h2 id={`${id}-wait`} className="mb-3 flex items-center justify-between text-sm font-semibold">Waiting list <span className="text-muted-foreground font-mono text-xs tabular-nums">{queue.length}</span></h2>
            {queue.length ? (
              <ul className="divide-y">
                {queue.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span><span className="font-medium">{p.name}</span> <span className="text-muted-foreground">· party of {p.size}</span></span>
                    <span className="text-muted-foreground text-xs tabular-nums">{p.waited}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">Nobody is waiting.</p>
            )}
          </aside>
        </div>
      </StateView>
    </section>
  )
}

export { Floorplan1, type Floorplan1Party, type Floorplan1Props, type Floorplan1Status, type Floorplan1Table }
