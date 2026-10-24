// Ballmac UI: Rentals 1. https://ui.ballmac.com/blocks/rentals-1
"use client"

import * as React from "react"
import { CalendarDays, Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Rentals1Item = {
  id: string
  name: string
  detail: string
  /** Price for one day. */
  perDay: number
  /** Refundable deposit, taken with the booking. */
  deposit: number
  /** Dates the item is already out, as "YYYY-MM-DD" days. */
  booked?: string[]
}
type Rentals1Extra = { id: string; name: string; perDay: number }
type Rentals1Request = { item: string; from: string; to: string; extras: string[] }

type Rentals1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    items?: Rentals1Item[]
    extras?: Rentals1Extra[]
    title?: string
    currency?: string
    /** Longest rental in days. */
    maxDays?: number
    /** The earliest day that can be chosen, as "YYYY-MM-DD". Defaults to today. */
    today?: string
    /** Called with the request. Reject and the choices stay with the message. */
    onReserve?: (request: Rentals1Request) => void | Promise<void>
  }

const items: Rentals1Item[] = [
  { id: "kayak", name: "Two-person sea kayak", detail: "Paddles, spray decks and life jackets included.", perDay: 60, deposit: 100, booked: ["2026-11-03", "2026-11-04", "2026-11-05"] },
  { id: "sup", name: "Inflatable paddle board", detail: "Pump, leash and a dry bag.", perDay: 35, deposit: 60 },
  { id: "tent", name: "Four-person tent", detail: "Pitched in five minutes. Footprint included.", perDay: 28, deposit: 80, booked: ["2026-11-01"] },
]
const extras: Rentals1Extra[] = [
  { id: "ins", name: "Damage cover", perDay: 6 },
  { id: "roof", name: "Roof rack straps", perDay: 3 },
]

const DAY = 86400000
const iso = (d: Date) => d.toISOString().slice(0, 10)
const at = (s: string) => new Date(`${s}T00:00:00Z`).getTime()
/** Whole days from the first day to the last day, counting both ends. Zero for an invalid or backwards range. */
function days(from: string, to: string) {
  if (!from || !to) return 0
  const n = Math.round((at(to) - at(from)) / DAY) + 1
  return n > 0 ? n : 0
}
/** The first booked day inside a range, or null when the whole range is free. */
function firstClash(from: string, to: string, booked: string[] = []) {
  return days(from, to) ? [...booked].sort().find((b) => b >= from && b <= to) ?? null : null
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="grid gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}

/**
 * A rental booking page: pick the item, pick the days, and the price, deposit and any clash with days it is already out are worked out as you go.
 * A clash names the first day that is taken, a range that runs backwards says so, and the summary is exact before the button.
 */
function Rentals1({ items: list = items, extras: ex = extras, title = "Rent gear for the weekend", currency = "USD", maxDays = 14, today, onReserve, state = "ready", onRetry, emptyState, errorState, className, ...props }: Rentals1Props) {
  const id = React.useId()
  // Today is read after mount, so a page prerendered ahead of time never freezes the date.
  const [min, setMin] = React.useState(today ?? "")
  React.useEffect(() => { if (!today) setMin(iso(new Date())) }, [today])
  const [itemId, setItemId] = React.useState(list[0]?.id ?? "")
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [chosen, setChosen] = React.useState<string[]>([])
  const [tried, setTried] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [result, setResult] = React.useState<{ ok: boolean; text: string } | null>(null)
  const view = state === "ready" && list.length === 0 ? "empty" : state
  const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n)
  const item = list.find((x) => x.id === itemId)
  const n = days(from, to)
  const clash = item ? firstClash(from, to, item.booked) : null
  const perDay = (item?.perDay ?? 0) + ex.filter((e) => chosen.includes(e.id)).reduce((s, e) => s + e.perDay, 0)
  const rental = perDay * n
  const long = n > maxDays
  const dateLabel = (s: string) => new Date(`${s}T00:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" })

  const problem = !from || !to ? "Choose the first and last day." : n === 0 ? "The last day is before the first day." : long ? `The longest rental is ${maxDays} days.` : clash ? `${item?.name} is already out on ${dateLabel(clash)}. Choose other days or another item.` : null
  const reset = () => setResult(null)

  async function reserve() {
    setTried(true)
    if (problem || !item) return
    setBusy(true)
    setResult(null)
    try {
      await onReserve?.({ item: item.id, from, to, extras: chosen })
      setResult({ ok: true, text: `Reserved: ${item.name}, ${dateLabel(from)} to ${dateLabel(to)} (${n} ${n === 1 ? "day" : "days"}). ${money(rental)} plus a ${money(item.deposit)} deposit you get back.` })
    } catch (e) {
      setResult({ ok: false, text: e instanceof Error ? e.message : "The reservation was not made. Your choices are still here." })
    } finally {
      setBusy(false)
    }
  }

  const dateInput = "bg-background focus-visible:ring-ring/50 h-11 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px] aria-[invalid=true]:border-destructive"

  return (
    <section data-slot="rentals-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="mb-8 text-3xl font-semibold tracking-[-0.035em] text-balance">{title}</h1>
      <StateView state={view} onRetry={onRetry} label="Loading the rentals" loading={<Skel />} empty={{ title: "Nothing to rent right now", description: "All our gear is out. Check back soon.", ...emptyState }} error={{ title: "The rentals could not be loaded", description: "Nothing was reserved. Check your connection and try again.", ...errorState }}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="grid min-w-0 gap-8">
            <fieldset>
              <legend className="mb-3 text-lg font-semibold tracking-tight">1. Choose what to rent</legend>
              <ul className="grid gap-2.5">
                {list.map((x) => (
                  <li key={x.id}>
                    <label className="relative block cursor-pointer">
                      <input type="radio" name={`${id}-item`} checked={itemId === x.id} onChange={() => { reset(); setItemId(x.id) }} className="peer sr-only" />
                      <span className="bg-card peer-checked:border-foreground peer-checked:bg-accent/40 peer-focus-visible:ring-ring/50 flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors peer-focus-visible:ring-[3px] motion-reduce:transition-none">
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{x.name}</span>
                          <span className="text-muted-foreground block text-sm">{x.detail}</span>
                          {x.booked?.length ? <span className="text-muted-foreground mt-1 block text-xs">Out on {x.booked.length} {x.booked.length === 1 ? "day" : "days"} soon</span> : null}
                        </span>
                        <span className="shrink-0 text-end text-sm font-semibold tabular-nums">{money(x.perDay)}<span className="text-muted-foreground block text-xs font-normal">a day</span></span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-lg font-semibold tracking-tight">2. Choose the days</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${id}-from`} className="mb-1.5 block text-sm font-medium">First day</label>
                  <input id={`${id}-from`} type="date" min={min || undefined} value={from} onChange={(e) => { reset(); setFrom(e.target.value); if (!to || e.target.value > to) setTo("") }} aria-invalid={tried && !from} className={dateInput} />
                </div>
                <div>
                  <label htmlFor={`${id}-to`} className="mb-1.5 block text-sm font-medium">Last day</label>
                  <input id={`${id}-to`} type="date" min={from || min || undefined} value={to} onChange={(e) => { reset(); setTo(e.target.value) }} aria-invalid={tried && !!problem} aria-describedby={`${id}-problem`} className={dateInput} />
                </div>
              </div>
              <p id={`${id}-problem`} aria-live="polite" role={tried && problem ? "alert" : undefined} className={cn("mt-2 min-h-5 text-sm", tried && problem ? "text-destructive font-medium" : clash || long ? "text-destructive" : "text-muted-foreground")}>
                {tried && problem ? problem : clash || long || n === 0 && from && to ? problem : n ? `${n} ${n === 1 ? "day" : "days"} · ${dateLabel(from)} to ${dateLabel(to)}` : ""}
              </p>
            </fieldset>

            {ex.length > 0 && (
              <fieldset>
                <legend className="mb-3 text-lg font-semibold tracking-tight">3. Add extras</legend>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {ex.map((e) => (
                    <li key={e.id}>
                      <label className="bg-card flex items-center justify-between gap-3 rounded-xl border p-3.5 text-sm">
                        <span className="flex items-center gap-2.5"><input type="checkbox" checked={chosen.includes(e.id)} onChange={(ev) => { reset(); setChosen(ev.target.checked ? [...chosen, e.id] : chosen.filter((x) => x !== e.id)) }} className="size-4" />{e.name}</span>
                        <span className="text-muted-foreground tabular-nums">+{money(e.perDay)} a day</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}
          </div>

          <aside aria-labelledby={`${id}-sum`} className="lg:sticky lg:top-6 lg:self-start">
            <div className="bg-card grid gap-4 rounded-2xl border p-5">
              <h2 id={`${id}-sum`} className="text-lg font-semibold tracking-tight">Your rental</h2>
              <p className="text-sm font-medium">{item?.name}</p>
              <dl className="grid gap-1.5 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Price a day</dt><dd className="tabular-nums">{money(perDay)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Days</dt><dd className="tabular-nums">{n || "–"}</dd></div>
                <div className="flex justify-between gap-3 border-t pt-2"><dt className="font-medium">Rental</dt><dd className="font-semibold tabular-nums">{n && !problem ? money(rental) : "–"}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Deposit, returned</dt><dd className="tabular-nums">{item ? money(item.deposit) : "–"}</dd></div>
                <div className="flex justify-between gap-3 border-t pt-2 text-base"><dt className="font-semibold">Pay today</dt><dd className="font-semibold tabular-nums">{n && !problem && item ? money(rental + item.deposit) : "–"}</dd></div>
              </dl>
              <Button size="lg" disabled={busy || result?.ok === true} onClick={() => void reserve()}>
                {busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : <CalendarDays aria-hidden="true" />} Reserve
              </Button>
              <p className="text-muted-foreground flex items-start gap-2 text-xs"><ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />The deposit comes back when the gear does.</p>
              <p aria-live="polite" role={result && !result.ok ? "alert" : undefined} className={cn("text-sm", result && !result.ok ? "text-destructive font-medium" : "text-muted-foreground")}>{result?.text}</p>
            </div>
          </aside>
        </div>
      </StateView>
    </section>
  )
}

export { Rentals1, days, firstClash, type Rentals1Extra, type Rentals1Item, type Rentals1Props, type Rentals1Request }
