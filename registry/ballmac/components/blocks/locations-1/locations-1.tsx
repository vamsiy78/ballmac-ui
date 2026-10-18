// Ballmac UI: Locations 1. https://ui.ballmac.com/blocks/locations-1
"use client"

import * as React from "react"
import { Clock, Mail, MapPin, Phone, Search, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { DottedMap } from "@/components/ballmac/dotted-map"
import { MatchHighlight, matchesAll, queryTokens } from "@/components/ballmac/match-highlight"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Locations1Place = {
  id: string
  name: string
  kind: string
  city: string
  country: string
  address: string
  lat: number
  lng: number
  /** Hours from UTC, such as 1 or -5 or 5.5, used for "open now". */
  utcOffset: number
  /** Opening hours as 24-hour numbers, 9 and 17.5 for 09:00 to 17:30. Days not listed in `days` are closed. */
  hours: { open: number; close: number; /** 0 is Sunday to 6 is Saturday. Defaults to Monday to Friday. */ days?: number[] }
  phone?: string
  email?: string
}

type Locations1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    places?: Locations1Place[]
    title?: string
    description?: string
    /** An ISO date and time in UTC for "now". The block never reads the clock. */
    now?: string
    defaultSelectedId?: string
    onSelect?: (place: Locations1Place) => void
  }

const sample: Locations1Place[] = [
  { id: "lis", name: "Lisbon HQ", kind: "Office", city: "Lisbon", country: "Portugal", address: "Rua da Prata 120, 1100-420 Lisboa", lat: 38.71, lng: -9.14, utcOffset: 1, hours: { open: 9, close: 18 }, phone: "+351 21 000 0100", email: "lisbon@acme.com" },
  { id: "nyc", name: "New York studio", kind: "Office", city: "New York", country: "United States", address: "88 Orchard St, New York, NY 10002", lat: 40.72, lng: -73.99, utcOffset: -4, hours: { open: 9, close: 17.5 }, phone: "+1 212 555 0148", email: "nyc@acme.com" },
  { id: "sao", name: "São Paulo hub", kind: "Office", city: "São Paulo", country: "Brazil", address: "Av. Paulista 1578, São Paulo", lat: -23.56, lng: -46.65, utcOffset: -3, hours: { open: 9, close: 18 }, email: "saopaulo@acme.com" },
  { id: "lon", name: "London shop", kind: "Store", city: "London", country: "United Kingdom", address: "14 Carnaby St, London W1F 9PS", lat: 51.51, lng: -0.14, utcOffset: 1, hours: { open: 10, close: 19, days: [0, 1, 2, 3, 4, 5, 6] }, phone: "+44 20 7946 0958" },
  { id: "ber", name: "Berlin shop", kind: "Store", city: "Berlin", country: "Germany", address: "Torstraße 72, 10119 Berlin", lat: 52.53, lng: 13.4, utcOffset: 2, hours: { open: 10, close: 20, days: [1, 2, 3, 4, 5, 6] }, phone: "+49 30 555 0123" },
  { id: "lag", name: "Lagos office", kind: "Office", city: "Lagos", country: "Nigeria", address: "12 Adeola Odeku St, Victoria Island", lat: 6.43, lng: 3.42, utcOffset: 1, hours: { open: 8, close: 17 }, email: "lagos@acme.com" },
  { id: "dxb", name: "Dubai showroom", kind: "Store", city: "Dubai", country: "United Arab Emirates", address: "Al Wasl Rd, Jumeirah 1", lat: 25.2, lng: 55.27, utcOffset: 4, hours: { open: 10, close: 22, days: [0, 1, 2, 3, 4, 5, 6] }, phone: "+971 4 555 0190" },
  { id: "sin", name: "Singapore office", kind: "Office", city: "Singapore", country: "Singapore", address: "1 Fusionopolis Way, #12-01", lat: 1.3, lng: 103.79, utcOffset: 8, hours: { open: 9, close: 18 }, email: "singapore@acme.com" },
  { id: "tyo", name: "Tokyo shop", kind: "Store", city: "Tokyo", country: "Japan", address: "3-18-5 Jingumae, Shibuya", lat: 35.67, lng: 139.71, utcOffset: 9, hours: { open: 11, close: 20, days: [0, 1, 2, 3, 4, 5, 6] }, phone: "+81 3 5550 0177" },
  { id: "syd", name: "Sydney office", kind: "Office", city: "Sydney", country: "Australia", address: "200 George St, Sydney NSW 2000", lat: -33.87, lng: 151.21, utcOffset: 11, hours: { open: 9, close: 17 }, email: "sydney@acme.com" },
]

const LAT: [number, number] = [-56, 73]
const hhmm = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`

function openState(p: Locations1Place, nowMs: number) {
  const local = new Date(nowMs + p.utcOffset * 3_600_000)
  const day = local.getUTCDay()
  const h = local.getUTCHours() + local.getUTCMinutes() / 60
  const days = p.hours.days ?? [1, 2, 3, 4, 5]
  const isOpen = days.includes(day) && h >= p.hours.open && h < p.hours.close
  return { isOpen, text: isOpen ? `Open now · until ${hhmm(p.hours.close)}` : days.includes(day) && h < p.hours.open ? `Closed · opens ${hhmm(p.hours.open)}` : "Closed now", local: hhmm(h) }
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="grid gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="aspect-[2/1] rounded-3xl" />
    </div>
  )
}

/**
 * A locations finder on a dotted world map: pins you can press (each is a real button), a list that searches names, cities and countries, a
 * card for the chosen place with its address, contacts and whether it is open right now in its own time zone. Open-now is worked out from the
 * moment you pass and each place's offset and hours; the block never reads the clock.
 */
function Locations1({
  places = sample,
  title = "Find us",
  description = "Visit a shop, or come by one of our offices. Each one shows whether it is open right now.",
  now = "2026-10-19T10:42:00Z",
  defaultSelectedId,
  onSelect,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Locations1Props) {
  const id = React.useId()
  const all = state === "empty" ? [] : places
  const [query, setQuery] = React.useState("")
  const [kind, setKind] = React.useState<string | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | undefined>(defaultSelectedId ?? all[0]?.id)
  const tokens = queryTokens(query)
  const nowMs = Date.parse(now)
  const kinds = [...new Set(all.map((p) => p.kind))]
  const shown = all.filter((p) => (!kind || p.kind === kind) && (!tokens.length || matchesAll(`${p.name} ${p.city} ${p.country} ${p.kind}`, tokens)))
  const selected = all.find((p) => p.id === selectedId)
  const [south, north] = LAT
  const span = north - south
  const choose = (p: Locations1Place) => {
    setSelectedId(p.id)
    onSelect?.(p)
  }

  const content = !all.length ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <MapPin className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No locations yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "When a shop or office opens, it appears here with its hours."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="order-2 min-w-0 lg:order-1">
        <div className="bg-background focus-within:ring-ring/50 flex h-10 items-center gap-2 rounded-lg border px-3 focus-within:ring-[3px]">
          <Search aria-hidden="true" className="text-muted-foreground size-4" />
          <input type="search" aria-label="Search locations" placeholder="Search by city, country or name" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
        {kinds.length > 1 ? (
          <div role="group" aria-label="Filter by type" className="mt-3 flex flex-wrap gap-2">
            {[null, ...kinds].map((k) => (
              <button key={k ?? "all"} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={cn("focus-visible:ring-ring/50 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", kind === k ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>
                {k ?? "All"}
              </button>
            ))}
          </div>
        ) : null}
        <p aria-live="polite" className="text-muted-foreground mt-4 text-sm">
          {shown.length} {shown.length === 1 ? "place" : "places"}
        </p>
        {shown.length ? (
          <ul className="mt-3 grid max-h-[34rem] gap-2.5 overflow-y-auto pe-1">
            {shown.map((p) => {
              const o = openState(p, nowMs)
              const on = p.id === selectedId
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    data-place={p.id}
                    aria-pressed={on}
                    onClick={() => choose(p)}
                    className={cn("bg-card focus-visible:ring-ring/50 hover:border-foreground/30 w-full rounded-2xl border p-4 text-start outline-none transition-[border-color,box-shadow] focus-visible:ring-[3px] motion-reduce:transition-none", on && "border-foreground ring-foreground ring-1")}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold tracking-tight">
                        <MatchHighlight text={p.name} query={tokens} />
                      </span>
                      <span className="bg-muted rounded-full px-2.5 py-0.5 text-xs font-medium">{p.kind}</span>
                    </span>
                    <span className="text-muted-foreground mt-1 block text-sm">
                      <MatchHighlight text={`${p.city}, ${p.country}`} query={tokens} />
                    </span>
                    <span className="mt-2.5 flex items-center gap-2 text-sm">
                      <span aria-hidden="true" className={cn("size-2 rounded-full", o.isOpen ? "bg-chart-2" : "bg-muted-foreground/50")} />
                      {o.text}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed px-5 py-10 text-center">
            <p className="font-medium">Nothing matches</p>
            <p className="text-muted-foreground mt-1 text-sm">Try a city or a country.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setQuery(""); setKind(null) }}>
              <X aria-hidden="true" />
              Clear
            </Button>
          </div>
        )}
      </div>

      <div className="order-1 min-w-0 lg:sticky lg:top-6 lg:order-2">
        <div className="bg-card relative overflow-hidden rounded-3xl border p-3 sm:p-5">
          <div dir="ltr" className="relative">
            <DottedMap dots={110} latRange={LAT} markers={selected ? [{ lat: selected.lat, lng: selected.lng, tone: "chart-1" }] : []} label="Map of our locations" />
            {shown.map((p) => {
              const on = p.id === selectedId
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`${p.name}, ${p.city}`}
                  aria-pressed={on}
                  onClick={() => choose(p)}
                  className="focus-visible:ring-ring/60 absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2 outline-none focus-visible:ring-[3px]"
                  style={{ left: `${((p.lng + 180) / 360) * 100}%`, top: `${((north - p.lat) / span) * 100}%` }}
                >
                  <span aria-hidden="true" className={cn("block rounded-full border-2 border-white shadow transition-all duration-150 motion-reduce:transition-none", on ? "bg-chart-1 size-4 ring-4 ring-[color-mix(in_oklab,var(--chart-1)_35%,transparent)]" : "bg-foreground hover:bg-chart-1 size-2.5 hover:scale-125")} />
                </button>
              )
            })}
          </div>
        </div>

        {selected ? (
          <article aria-labelledby={`${id}-sel`} className="bg-card mt-4 rounded-3xl border p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-sm">{selected.kind}</p>
                <h2 id={`${id}-sel`} className="text-2xl font-semibold tracking-tight">
                  {selected.name}
                </h2>
              </div>
              {(() => {
                const o = openState(selected, nowMs)
                return (
                  <p className={cn("flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium", o.isOpen && "bg-chart-2/10 border-chart-2/30")}>
                    <span aria-hidden="true" className={cn("size-2 rounded-full", o.isOpen ? "bg-chart-2" : "bg-muted-foreground/50")} />
                    {o.text}
                  </p>
                )
              })()}
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <dt className="sr-only">Address</dt>
                <MapPin aria-hidden="true" className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <dd className="text-pretty">{selected.address}</dd>
              </div>
              <div className="flex items-start gap-3">
                <dt className="sr-only">Local time</dt>
                <Clock aria-hidden="true" className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <dd className="tabular-nums">
                  {openState(selected, nowMs).local} there · {hhmm(selected.hours.open)} to {hhmm(selected.hours.close)}
                </dd>
              </div>
              {selected.phone ? (
                <div className="flex items-start gap-3">
                  <dt className="sr-only">Phone</dt>
                  <Phone aria-hidden="true" className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <dd dir="ltr">
                    <a href={`tel:${selected.phone.replace(/[^+\d]/g, "")}`} className="focus-visible:ring-ring/50 rounded-sm underline underline-offset-4 outline-none focus-visible:ring-[3px]">
                      {selected.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {selected.email ? (
                <div className="flex items-start gap-3">
                  <dt className="sr-only">Email</dt>
                  <Mail aria-hidden="true" className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <dd>
                    <a href={`mailto:${selected.email}`} className="focus-visible:ring-ring/50 rounded-sm underline underline-offset-4 outline-none focus-visible:ring-[3px]">
                      {selected.email}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.address}`)}`} target="_blank" rel="noreferrer" className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 mt-6 inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-medium outline-none focus-visible:ring-[3px]">
              Get directions <span className="sr-only">to {selected.name} (opens in a new tab)</span>
            </a>
          </article>
        ) : null}
      </div>
    </div>
  )

  return (
    <section data-slot="locations-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20", className)} {...frameProps(props)}>
      <header className="mb-10 max-w-2xl">
        <h1 id={`${id}-title`} className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading locations" loading={<Skel />} error={{ title: errorState?.title ?? "Locations could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Locations1, type Locations1Props, type Locations1Place }
