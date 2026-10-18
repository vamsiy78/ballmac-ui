// Ballmac UI: Trip 1. https://ui.ballmac.com/blocks/trip-1
"use client"

import * as React from "react"
import { BedDouble, CalendarDays, Check, MapPin, Plane, Ticket, TrainFront, Users, Utensils } from "lucide-react"

import { CopyButton } from "@/components/ballmac/copy-button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { cn } from "@/lib/utils"

type Trip1Kind = "flight" | "stay" | "food" | "activity" | "transport"
type Trip1Item = {
  id: string
  kind: Trip1Kind
  /** ISO date. */
  date: string
  /** "09:30" in the local time of the place. */
  time?: string
  title: string
  detail?: string
  /** "TP 1368", a booking code to copy. */
  ref?: string
  cost?: number
  /** Not booked yet. */
  pending?: boolean
}

type Trip1Props = Omit<React.ComponentProps<"section">, "title"> & {
  title?: string
  destination?: string
  /** ISO dates of the first and last day. */
  dates?: [string, string]
  travelers?: string[]
  items?: Trip1Item[]
  packing?: { id: string; label: string; done?: boolean }[]
  currency?: string
  locale?: string
  /** An ISO date for "today". The block never reads the clock. */
  today?: string
}

const items0: Trip1Item[] = [
  { id: "1", kind: "flight", date: "2026-11-06", time: "08:15", title: "London Heathrow to Lisbon", detail: "TAP Air Portugal, 2 h 50 min, arrives 11:05", ref: "TP1351", cost: 286 },
  { id: "2", kind: "transport", date: "2026-11-06", time: "12:00", title: "Metro and tram 28 to Alfama", detail: "24-hour pass, 6.80 each", cost: 13.6 },
  { id: "3", kind: "stay", date: "2026-11-06", time: "14:00", title: "Check in: Casa do Largo", detail: "3 nights, balcony room, breakfast included", ref: "BKG-48213", cost: 612 },
  { id: "4", kind: "food", date: "2026-11-06", time: "20:00", title: "Dinner at Taberna da Rua das Flores", detail: "Table for 2, grilled octopus is the one to order", cost: 78, pending: true },
  { id: "5", kind: "activity", date: "2026-11-07", time: "10:00", title: "Belém: tower, monastery and the custard tarts", detail: "Tram 15 from Praça da Figueira, 25 minutes", cost: 36 },
  { id: "6", kind: "activity", date: "2026-11-07", time: "17:30", title: "Sunset at Miradouro da Senhora do Monte", detail: "Bring a layer, it gets windy", cost: 0 },
  { id: "7", kind: "food", date: "2026-11-07", time: "21:00", title: "Fado dinner in Alfama", detail: "Show starts 21:30", ref: "FADO-2209", cost: 120 },
  { id: "8", kind: "transport", date: "2026-11-08", time: "09:10", title: "Train to Sintra", detail: "From Rossio, 40 minutes, return ticket", cost: 12.8 },
  { id: "9", kind: "activity", date: "2026-11-08", time: "10:30", title: "Pena Palace and the gardens", detail: "Timed entry, book ahead", ref: "PENA-7714", cost: 64, pending: true },
  { id: "10", kind: "stay", date: "2026-11-09", time: "11:00", title: "Check out: Casa do Largo", detail: "Leave bags at the desk until the evening" },
  { id: "11", kind: "flight", date: "2026-11-09", time: "20:40", title: "Lisbon to London Heathrow", detail: "TAP Air Portugal, arrives 23:30", ref: "TP1372", cost: 214 },
]
const packing0 = [{ id: "p1", label: "Passports", done: true }, { id: "p2", label: "Travel insurance printout", done: true }, { id: "p3", label: "Phone charger and adapter" }, { id: "p4", label: "Comfortable walking shoes" }, { id: "p5", label: "Light rain jacket" }, { id: "p6", label: "Tram and train tickets saved offline" }]

const kindMeta: Record<Trip1Kind, { label: string; icon: typeof Plane; tone: string; bar: string }> = {
  flight: { label: "Flights", icon: Plane, tone: "bg-chart-1/15 border-chart-1/40", bar: "bg-chart-1" },
  stay: { label: "Stays", icon: BedDouble, tone: "bg-chart-3/15 border-chart-3/40", bar: "bg-chart-3" },
  food: { label: "Food", icon: Utensils, tone: "bg-chart-4/15 border-chart-4/40", bar: "bg-chart-4" },
  activity: { label: "Things to do", icon: Ticket, tone: "bg-chart-2/15 border-chart-2/40", bar: "bg-chart-2" },
  transport: { label: "Getting around", icon: TrainFront, tone: "bg-chart-5/15 border-chart-5/40", bar: "bg-chart-5" },
}
const DAY = 86_400_000
const toT = (iso: string) => Date.parse(`${iso}T00:00:00Z`)

/**
 * A trip itinerary: the destination and dates with a countdown, then day by day what is booked and when, each item with its type, time, details and a booking code
 * you can copy, anything not yet booked marked in words. Beside it, what the trip costs by type with a bar, and a packing list with progress. Filters show only flights,
 * stays or food. Nights, days to go, totals and per-person cost are all worked out from the items.
 */
function Trip1({ title = "Long weekend in Lisbon", destination = "Lisbon, Portugal", dates = ["2026-11-06", "2026-11-09"], travelers = ["Mara", "Theo"], items = items0, packing: packingProp = packing0, currency = "EUR", locale = "en-GB", today = "2026-10-18", className, ...props }: Trip1Props) {
  const id = React.useId()
  const [kinds, setKinds] = React.useState<Set<Trip1Kind>>(new Set())
  const [packed, setPacked] = React.useState<Set<string>>(new Set(packingProp.filter((p) => p.done).map((p) => p.id)))
  const money = (n: number) => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: n % 1 ? 2 : 0 }).format(n)
  const dayFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }), [locale])
  const short = React.useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }), [locale])

  const nights = Math.round((toT(dates[1]) - toT(dates[0])) / DAY)
  const until = Math.round((toT(dates[0]) - toT(today)) / DAY)
  const total = items.reduce((n, i) => n + (i.cost ?? 0), 0)
  const unbooked = items.filter((i) => i.pending)
  const byKind = (Object.keys(kindMeta) as Trip1Kind[]).map((k) => ({ k, sum: items.filter((i) => i.kind === k).reduce((n, i) => n + (i.cost ?? 0), 0) })).filter((x) => x.sum > 0)
  const days = [...new Set(items.map((i) => i.date))].sort()
  const shown = (d: string) => items.filter((i) => i.date === d && (!kinds.size || kinds.has(i.kind))).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))
  const toggleKind = (k: Trip1Kind) => setKinds((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n })
  const tone = (k: Trip1Kind) => kindMeta[k].bar

  return (
    <section data-slot="trip-1" aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...props}>
      <div className="relative isolate overflow-hidden rounded-3xl border">
        <CoverArt seed={destination} variant="waves" className="absolute inset-0 -z-20 scale-110 saturate-150" />
        <div aria-hidden="true" className="from-background via-background/85 to-background/20 absolute inset-0 -z-10 bg-gradient-to-r rtl:bg-gradient-to-l" />
        <div className="p-6 sm:p-10">
          <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <MapPin aria-hidden="true" className="size-4" />
            {destination}
          </p>
          <h1 id={`${id}-title`} className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">
            {title}
          </h1>
          <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm">
            <li className="flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="size-4" />
              {short.format(toT(dates[0]))} to {short.format(toT(dates[1]))} · {nights} {nights === 1 ? "night" : "nights"}
            </li>
            <li className="flex items-center gap-2">
              <Users aria-hidden="true" className="size-4" />
              {travelers.join(" and ")}
            </li>
            <li className="font-semibold tabular-nums">{until > 0 ? `${until} ${until === 1 ? "day" : "days"} to go` : until === 0 ? "Leaving today" : "Under way"}</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <div role="group" aria-label="Show only" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={!kinds.size} onClick={() => setKinds(new Set())} className={cn("focus-visible:ring-ring/50 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none focus-visible:ring-[3px]", !kinds.size ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
              Everything
            </button>
            {(Object.keys(kindMeta) as Trip1Kind[]).map((k) => (
              <button key={k} type="button" aria-pressed={kinds.has(k)} onClick={() => toggleKind(k)} className={cn("focus-visible:ring-ring/50 flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none focus-visible:ring-[3px]", kinds.has(k) ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
                {React.createElement(kindMeta[k].icon, { "aria-hidden": true, className: "size-3.5" })}
                {kindMeta[k].label}
              </button>
            ))}
          </div>
          {unbooked.length ? (
            <p role="status" className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm">
              {unbooked.length} {unbooked.length === 1 ? "thing is" : "things are"} not booked yet: {unbooked.map((u) => u.title.split(":")[0]).join("; ")}.
            </p>
          ) : null}

          <ol className="mt-6 grid gap-8">
            {days.map((d, di) => {
              const list = shown(d)
              if (!list.length) return null
              return (
                <li key={d}>
                  <h2 className="bg-background/90 sticky top-0 z-10 -mx-1 flex items-baseline gap-3 px-1 py-2 text-lg font-semibold tracking-tight backdrop-blur">
                    <span className="bg-foreground text-background rounded-md px-2 py-0.5 text-xs font-medium tabular-nums">Day {di + 1}</span>
                    {dayFmt.format(toT(d))}
                  </h2>
                  <ul className="mt-3 grid gap-3">
                    {list.map((i) => {
                      const K = kindMeta[i.kind]
                      return (
                        <li key={i.id} className="bg-card flex gap-4 rounded-2xl border p-4 sm:p-5">
                          <span aria-hidden="true" className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl border", K.tone)}>
                            <K.icon className="size-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              {i.time ? <span className="text-sm font-semibold tabular-nums">{i.time}</span> : null}
                              <span className="font-semibold tracking-tight text-pretty">{i.title}</span>
                              {i.pending ? <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-xs font-medium">Not booked yet</span> : null}
                            </p>
                            {i.detail ? <p className="text-muted-foreground mt-1 text-sm text-pretty">{i.detail}</p> : null}
                            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                              <span className="text-muted-foreground text-xs">{K.label.replace("Things to do", "Activity").replace("Flights", "Flight").replace("Stays", "Stay").replace("Getting around", "Transport")}</span>
                              {i.cost !== undefined ? <span className="tabular-nums">{i.cost === 0 ? "Free" : money(i.cost)}</span> : null}
                              {i.ref ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs" dir="ltr">
                                    {i.ref}
                                  </span>
                                  <CopyButton value={i.ref} ariaLabel={`Copy booking code ${i.ref}`} copiedLabel="Copied" variant="ghost" />
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )
            })}
          </ol>
        </div>

        <aside className="grid gap-5 lg:sticky lg:top-6">
          <div className="bg-card rounded-3xl border p-5 sm:p-6">
            <h2 className="font-semibold tracking-tight">Cost</h2>
            <p className="mt-2 text-4xl font-semibold tracking-[-0.045em] tabular-nums">{money(total)}</p>
            <p className="text-muted-foreground text-sm tabular-nums">
              {money(total / Math.max(1, travelers.length))} each for {travelers.length}
            </p>
            <div role="img" aria-label={`Cost by type: ${byKind.map((x) => `${kindMeta[x.k].label} ${money(x.sum)}`).join(", ")}`} className="bg-muted mt-4 flex h-2.5 overflow-hidden rounded-full">
              {byKind.map((x) => (
                <span key={x.k} className={cn("h-full", tone(x.k))} style={{ width: `${(x.sum / total) * 100}%` }} />
              ))}
            </div>
            <ul aria-hidden="true" className="mt-4 grid gap-2 text-sm">
              {byKind.map((x) => (
                <li key={x.k} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full", tone(x.k))} />
                    {kindMeta[x.k].label}
                  </span>
                  <span className="tabular-nums">{money(x.sum)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card rounded-3xl border p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-semibold tracking-tight">Packing</h2>
              <p className="text-muted-foreground text-sm tabular-nums" aria-live="polite">
                {packed.size} of {packingProp.length}
              </p>
            </div>
            <div role="progressbar" aria-label="Packing progress" aria-valuemin={0} aria-valuemax={packingProp.length} aria-valuenow={packed.size} className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
              <span className="bg-foreground block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${packingProp.length ? (packed.size / packingProp.length) * 100 : 0}%` }} />
            </div>
            <ul className="mt-4 grid gap-1">
              {packingProp.map((p) => (
                <li key={p.id}>
                  <label className="hover:bg-accent/50 -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm">
                    <input type="checkbox" checked={packed.has(p.id)} onChange={() => setPacked((s) => { const n = new Set(s); if (n.has(p.id)) n.delete(p.id); else n.add(p.id); return n })} className="accent-foreground size-4" />
                    <span className={cn(packed.has(p.id) && "text-muted-foreground line-through")}>{p.label}</span>
                    {packed.has(p.id) ? <Check aria-hidden="true" className="text-chart-2 ms-auto size-4" /> : null}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}

export { Trip1, type Trip1Props, type Trip1Item, type Trip1Kind }
