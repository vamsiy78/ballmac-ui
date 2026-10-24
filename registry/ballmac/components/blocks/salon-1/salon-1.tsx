// Ballmac UI: Salon 1. https://ui.ballmac.com/blocks/salon-1
"use client"

import * as React from "react"
import { CircleCheck, Clock, Loader2 } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Salon1Service = { id: string; name: string; /** How long it takes, in minutes. */ minutes: number; price: number }
type Salon1Stylist = { id: string; name: string; specialty?: string }
type Salon1Day = {
  id: string
  /** For example "Sat 25 Oct". */
  label: string
  /** The free start times that day, and who is free at each. */
  slots: { time: string; stylists: string[] }[]
}

type Salon1Request = { services: string[]; stylist: string; day: string; time: string }

type Salon1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    services?: Salon1Service[]
    stylists?: Salon1Stylist[]
    days?: Salon1Day[]
    title?: string
    /** ISO currency code. */
    currency?: string
    /** Called with the choices. Reject and the page keeps them with the message. */
    onBook?: (request: Salon1Request) => void | Promise<void>
  }

const services: Salon1Service[] = [
  { id: "cut", name: "Haircut and finish", minutes: 45, price: 52 },
  { id: "colour", name: "Full colour", minutes: 120, price: 110 },
  { id: "highlights", name: "Half-head highlights", minutes: 90, price: 95 },
  { id: "treat", name: "Conditioning treatment", minutes: 20, price: 24 },
  { id: "beard", name: "Beard trim", minutes: 20, price: 18 },
]
const stylists: Salon1Stylist[] = [
  { id: "mira", name: "Mira", specialty: "Colour" },
  { id: "luca", name: "Luca", specialty: "Cuts" },
  { id: "dana", name: "Dana", specialty: "Everything" },
]
const days: Salon1Day[] = [
  { id: "sat", label: "Sat 25 Oct", slots: [{ time: "09:00", stylists: ["mira", "luca"] }, { time: "10:30", stylists: ["luca", "dana"] }, { time: "13:00", stylists: ["mira", "dana"] }, { time: "15:30", stylists: ["dana"] }] },
  { id: "mon", label: "Mon 27 Oct", slots: [{ time: "10:00", stylists: ["luca"] }, { time: "12:00", stylists: ["mira", "luca", "dana"] }, { time: "16:00", stylists: ["mira"] }] },
  { id: "tue", label: "Tue 28 Oct", slots: [] },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}

/**
 * A salon booking page in one view: choose services (the total time and price add up), choose a stylist or anyone, choose a day and a time that stylist is free.
 * Times only show when they work, a day with nothing free says so, and the summary says exactly what is booked before the button is pressed.
 */
function Salon1({ services: svc = services, stylists: sty = stylists, days: dayList = days, title = "Book an appointment", currency = "USD", onBook, state = "ready", onRetry, emptyState, errorState, className, ...props }: Salon1Props) {
  const id = React.useId()
  const [chosen, setChosen] = React.useState<string[]>([])
  const [stylist, setStylist] = React.useState("any")
  const [day, setDay] = React.useState<string | null>(null)
  const [time, setTime] = React.useState<string | null>(null)
  const [tried, setTried] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [result, setResult] = React.useState<{ ok: boolean; text: string } | null>(null)
  const view = state === "ready" && svc.length === 0 ? "empty" : state
  const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n)
  const picked = svc.filter((s) => chosen.includes(s.id))
  const minutes = picked.reduce((n, s) => n + s.minutes, 0)
  const total = picked.reduce((n, s) => n + s.price, 0)
  const d = dayList.find((x) => x.id === day)
  const slots = (d?.slots ?? []).filter((s) => stylist === "any" || s.stylists.includes(stylist))
  const hm = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`)
  const who = stylist === "any" ? "Anyone free" : sty.find((s) => s.id === stylist)?.name

  const choose = <T,>(set: (v: T) => void, v: T) => { setResult(null); set(v) }
  async function book() {
    setTried(true)
    if (!picked.length || !day || !time) return
    setBusy(true)
    setResult(null)
    try {
      await onBook?.({ services: chosen, stylist, day, time })
      setResult({ ok: true, text: `Booked: ${d?.label} at ${time}, ${hm(minutes)}, ${money(total)}. We have sent a confirmation.` })
    } catch (e) {
      setResult({ ok: false, text: e instanceof Error ? e.message : "The booking was not made. Your choices are still here." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section data-slot="salon-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the booking page" loading={<Skel />} empty={{ title: "Booking is closed", description: "There is nothing to book at the moment. Please check back soon.", ...emptyState }} error={{ title: "The booking page could not be loaded", description: "Nothing was booked. Check your connection and try again.", ...errorState }}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="grid min-w-0 gap-8">
            <fieldset>
              <legend className="mb-3 text-lg font-semibold tracking-tight">1. Choose your services</legend>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {svc.map((s) => (
                  <li key={s.id}>
                    <label className="relative block cursor-pointer">
                      <input type="checkbox" checked={chosen.includes(s.id)} onChange={(e) => choose(setChosen, e.target.checked ? [...chosen, s.id] : chosen.filter((x) => x !== s.id))} className="peer sr-only" />
                      <span className="bg-card peer-checked:border-foreground peer-checked:bg-accent/40 peer-focus-visible:ring-ring/50 flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors peer-focus-visible:ring-[3px] motion-reduce:transition-none">
                        <span>
                          <span className="block text-sm font-medium">{s.name}</span>
                          <span className="text-muted-foreground flex items-center gap-1.5 text-xs"><Clock aria-hidden="true" className="size-3" />{hm(s.minutes)}</span>
                        </span>
                        <span className="flex items-center gap-2 text-sm font-medium tabular-nums">{money(s.price)}<CircleCheck aria-hidden="true" className={cn("size-5", chosen.includes(s.id) ? "opacity-100" : "opacity-20")} /></span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              {tried && !picked.length && <p role="alert" className="text-destructive mt-2 text-sm font-medium">Choose at least one service.</p>}
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-lg font-semibold tracking-tight">2. Choose a stylist</legend>
              <div className="flex flex-wrap gap-2.5">
                {[{ id: "any", name: "Anyone free", specialty: "The earliest time" }, ...sty].map((s) => (
                  <label key={s.id} className="relative cursor-pointer">
                    <input type="radio" name={`${id}-stylist`} value={s.id} checked={stylist === s.id} onChange={() => { choose(setStylist, s.id); setTime(null) }} className="peer sr-only" />
                    <span className="bg-card peer-checked:border-foreground peer-checked:bg-accent/40 peer-focus-visible:ring-ring/50 block rounded-xl border px-4 py-2.5 text-sm transition-colors peer-focus-visible:ring-[3px] motion-reduce:transition-none">
                      <span className="block font-medium">{s.name}</span>
                      {s.specialty && <span className="text-muted-foreground block text-xs">{s.specialty}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-lg font-semibold tracking-tight">3. Choose a day and a time</legend>
              <div role="group" aria-label="Day" className="flex flex-wrap gap-2">
                {dayList.map((x) => (
                  <button key={x.id} type="button" aria-pressed={day === x.id} onClick={() => { choose(setDay, x.id); setTime(null) }} className={cn("focus-visible:ring-ring/50 rounded-full border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", day === x.id ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>{x.label}</button>
                ))}
              </div>
              <div className="mt-4" aria-live="polite">
                {!d ? (
                  <p className="text-muted-foreground text-sm">Choose a day to see the times.</p>
                ) : slots.length ? (
                  <div role="group" aria-label={`Times on ${d.label}`} className="flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <button key={s.time} type="button" aria-pressed={time === s.time} onClick={() => choose(setTime, s.time)} className={cn("focus-visible:ring-ring/50 h-10 min-w-20 rounded-lg border px-3 text-sm font-medium tabular-nums outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", time === s.time ? "bg-foreground text-background border-foreground" : "hover:bg-accent")}>{s.time}</button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">{stylist === "any" ? `Nothing is free on ${d.label}.` : `${who} has nothing free on ${d.label}.`} Try another day{stylist === "any" ? "" : " or choose anyone free"}.</p>
                )}
                {tried && d && !time && <p role="alert" className="text-destructive mt-2 text-sm font-medium">Choose a time.</p>}
                {tried && !d && <p role="alert" className="text-destructive mt-2 text-sm font-medium">Choose a day and a time.</p>}
              </div>
            </fieldset>
          </div>

          <aside aria-labelledby={`${id}-sum`} className="lg:sticky lg:top-6 lg:self-start">
            <div className="bg-card grid gap-4 rounded-2xl border p-5">
              <h2 id={`${id}-sum`} className="text-lg font-semibold tracking-tight">Your appointment</h2>
              {picked.length ? (
                <ul className="grid gap-1.5 text-sm">
                  {picked.map((s) => (
                    <li key={s.id} className="flex justify-between gap-3"><span>{s.name}</span><span className="text-muted-foreground tabular-nums">{money(s.price)}</span></li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No services chosen yet.</p>
              )}
              <dl className="grid gap-1.5 border-t pt-3 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Stylist</dt><dd className="font-medium">{who}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">When</dt><dd className="font-medium tabular-nums">{d && time ? `${d.label}, ${time}` : "Not chosen"}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Time needed</dt><dd className="font-medium tabular-nums">{minutes ? hm(minutes) : "–"}</dd></div>
                <div className="flex justify-between gap-3 border-t pt-2 text-base"><dt className="font-semibold">Total</dt><dd className="font-semibold tabular-nums">{money(total)}</dd></div>
              </dl>
              <Button size="lg" disabled={busy || result?.ok === true} onClick={() => void book()}>
                {busy && <Loader2 aria-hidden="true" className="animate-spin" />} Book appointment
              </Button>
              <p aria-live="polite" role={result && !result.ok ? "alert" : undefined} className={cn("text-sm", result && !result.ok ? "text-destructive font-medium" : "text-muted-foreground")}>{result?.text}</p>
            </div>
          </aside>
        </div>
      </StateView>
    </section>
  )
}

export { Salon1, type Salon1Day, type Salon1Props, type Salon1Request, type Salon1Service, type Salon1Stylist }
