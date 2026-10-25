// Ballmac UI: Pricing 5. https://ui.ballmac.com/blocks/pricing-5
"use client"

import * as React from "react"
import { ArrowRight, Check } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { Switch } from "@/components/ballmac/switch"
import { cn } from "@/lib/utils"

type Pricing5Tier = {
  /** This price applies up to and including this many seats. Use Infinity for the last. */
  upTo: number
  /** Price per seat per month, in whole currency units. */
  perSeat: number
}
type Pricing5Addon = { id: string; label: string; description: string; /** Per month, flat. */ price: number }

type Pricing5Props = Omit<React.ComponentProps<"section">, "title"> & {
  title?: string
  description?: string
  tiers?: Pricing5Tier[]
  addons?: Pricing5Addon[]
  /** The smallest and largest number of seats on the slider. */
  min?: number
  max?: number
  /** Share of the price taken off when paying yearly, from 0 to 1. */
  yearlyDiscount?: number
  currency?: string
  /** Where the button goes. It receives the seats, the add-ons and how it is billed. */
  href?: (choice: { seats: number; addons: string[]; yearly: boolean }) => string
  /** Above this many seats the button becomes Talk to sales. */
  salesFrom?: number
  includes?: string[]
}

const defaultTiers: Pricing5Tier[] = [
  { upTo: 10, perSeat: 12 },
  { upTo: 50, perSeat: 10 },
  { upTo: 200, perSeat: 8 },
]
const defaultAddons: Pricing5Addon[] = [
  { id: "sso", label: "Single sign-on", description: "SAML and SCIM for your identity provider", price: 99 },
  { id: "audit", label: "Audit log", description: "Every change, kept for two years and exportable", price: 49 },
  { id: "support", label: "Priority support", description: "A named engineer and a one-hour first response", price: 199 },
]

/**
 * A price you work out yourself: slide the number of people, see which volume band you are in and what each person costs there, switch on what you need, and
 * read the monthly or yearly total. The working is written out so nobody has to trust a number they cannot check.
 */
function Pricing5({ title = "Pay for the people you have", description = "Every seat costs less as you grow. Add only what you need.", tiers = defaultTiers, addons = defaultAddons, min = 1, max = 200, yearlyDiscount = 0.2, currency = "USD", href, salesFrom = 100, includes = ["Unlimited projects", "Version history for 90 days", "Shared libraries and themes", "Email support"], className, ...props }: Pricing5Props) {
  const id = React.useId()
  const money = React.useMemo(() => { const f = new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }); return (n: number) => f.format(n) }, [currency])
  const [seats, setSeats] = React.useState(Math.min(max, Math.max(min, 12)))
  const [picked, setPicked] = React.useState<string[]>([])
  const [yearly, setYearly] = React.useState(true)

  // Volume pricing: each band's seats cost that band's rate, so the bill grows smoothly.
  const lines = React.useMemo(() => {
    const out: { from: number; to: number; seats: number; perSeat: number }[] = []
    let from = 1
    for (const t of tiers) {
      if (seats < from) break
      const to = Math.min(seats, t.upTo)
      out.push({ from, to, seats: to - from + 1, perSeat: t.perSeat })
      from = t.upTo + 1
    }
    return out
  }, [tiers, seats])
  const seatTotal = lines.reduce((s, l) => s + l.seats * l.perSeat, 0)
  const addonTotal = addons.filter((a) => picked.includes(a.id)).reduce((s, a) => s + a.price, 0)
  const monthlyFull = seatTotal + addonTotal
  const factor = yearly ? 1 - yearlyDiscount : 1
  const monthly = monthlyFull * factor
  const perSeatNow = lines[lines.length - 1]?.perSeat ?? 0
  const sales = seats >= salesFrom
  const link = href ? href({ seats, addons: picked, yearly }) : "#"

  return (
    <section data-slot="pricing-5" aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-16 sm:px-6", className)} {...props}>
      <header className="mx-auto mb-12 max-w-2xl text-center">
        <h2 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">{title}</h2>
        <p className="mt-3 text-muted-foreground text-pretty">{description}</p>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid gap-8 rounded-2xl border bg-card p-6 sm:p-8">
          <div className="grid gap-4">
            <div className="flex items-end justify-between gap-4">
              <label htmlFor={`${id}-seats`} className="text-sm font-semibold">How many people?</label>
              <output htmlFor={`${id}-seats`} aria-live="polite" className="text-5xl font-semibold tracking-[-0.04em] tabular-nums">{seats}</output>
            </div>
            <div className="relative flex h-6 items-center">
              <span aria-hidden="true" className="absolute inset-x-0 h-2 rounded-full bg-muted" />
              <span aria-hidden="true" className="absolute start-0 h-2 rounded-full bg-foreground" style={{ width: `${((seats - min) / (max - min || 1)) * 100}%` }} />
              <input id={`${id}-seats`} type="range" min={min} max={max} value={seats} onChange={(e) => setSeats(Number(e.target.value))} aria-valuetext={`${seats} ${seats === 1 ? "person" : "people"}`} className="relative h-6 w-full cursor-pointer appearance-none bg-transparent accent-foreground [&::-moz-range-thumb]:size-6 [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-md focus-visible:outline-none focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-ring/50" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums"><span>{min}</span><span>{max}+</span></div>
          </div>

          <div className="grid gap-3">
            <h3 className="text-sm font-semibold">How the price is worked out</h3>
            <table className="w-full text-sm">
              <caption className="sr-only">Seats and price per seat in each volume band</caption>
              <thead className="text-xs text-muted-foreground">
                <tr><th scope="col" className="pb-2 text-start font-medium">Seats</th><th scope="col" className="pb-2 text-end font-medium">Each</th><th scope="col" className="pb-2 text-end font-medium">Subtotal</th></tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={l.from} className={cn("border-t", i === lines.length - 1 && "font-medium")}>
                    <th scope="row" className="py-2.5 text-start font-normal">{l.from === l.to ? l.from : `${l.from} to ${l.to}`}{i === lines.length - 1 && <span className="ms-2 rounded-full border border-foreground px-1.5 py-px text-[11px]">Your band</span>}</th>
                    <td className="py-2.5 text-end tabular-nums">{money(l.perSeat)}</td>
                    <td className="py-2.5 text-end tabular-nums">{money(l.seats * l.perSeat)}</td>
                  </tr>
                ))}
                {addons.filter((a) => picked.includes(a.id)).map((a) => (
                  <tr key={a.id} className="border-t"><th scope="row" className="py-2.5 text-start font-normal">{a.label}</th><td className="py-2.5 text-end text-muted-foreground">flat</td><td className="py-2.5 text-end tabular-nums">{money(a.price)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <fieldset className="grid gap-2.5">
            <legend className="mb-1 text-sm font-semibold">Add what you need</legend>
            {addons.map((a) => (
              <label key={a.id} className="relative cursor-pointer">
                <input type="checkbox" checked={picked.includes(a.id)} onChange={(e) => setPicked((l) => (e.target.checked ? [...l, a.id] : l.filter((x) => x !== a.id)))} className="peer sr-only" />
                <span className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors peer-checked:border-foreground peer-checked:bg-accent/40 peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 motion-reduce:transition-none">
                  <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-md border bg-background text-background [label:has(input:checked)_&]:border-foreground [label:has(input:checked)_&]:bg-foreground"><Check className="size-3.5" strokeWidth={3} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{a.label}</span><span className="block text-xs text-muted-foreground">{a.description}</span></span>
                  <span className="shrink-0 text-sm tabular-nums">{money(a.price)}<span className="text-xs text-muted-foreground"> a month</span></span>
                </span>
              </label>
            ))}
          </fieldset>
        </div>

        <aside aria-labelledby={`${id}-sum`} className="grid gap-5 rounded-2xl border bg-card p-6 sm:p-8 lg:sticky lg:top-6">
          <div className="flex items-center justify-between gap-3">
            <h3 id={`${id}-sum`} className="text-sm font-semibold">Your price</h3>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              Pay yearly
              <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Pay yearly" />
            </label>
          </div>
          <div aria-live="polite">
            <p className="flex items-baseline gap-2"><span className="text-5xl font-semibold tracking-[-0.04em] tabular-nums">{money(Math.round(monthly))}</span><span className="text-muted-foreground">a month</span></p>
            <p className="mt-1.5 text-sm text-muted-foreground tabular-nums">
              {yearly ? `${money(Math.round(monthly * 12))} billed once a year. You save ${money(Math.round((monthlyFull - monthly) * 12))}.` : `Billed monthly. Pay yearly and save ${money(Math.round(monthlyFull * yearlyDiscount * 12))} a year.`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground tabular-nums">{money(perSeatNow)} per person in your band</p>
          </div>
          <a href={link} className={cn(buttonVariants({ size: "lg" }), "h-12 w-full text-base")}>
            {sales ? "Talk to sales" : "Start free for 14 days"} <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          </a>
          {sales && <p className="-mt-2 text-xs text-muted-foreground">For {salesFrom} people or more we agree a price with you, usually lower than this.</p>}
          <ul className="grid gap-2 border-t pt-5 text-sm">
            {includes.map((t) => <li key={t} className="flex gap-2.5"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{t}</li>)}
          </ul>
        </aside>
      </div>
    </section>
  )
}

export { Pricing5, type Pricing5Addon, type Pricing5Props, type Pricing5Tier }
