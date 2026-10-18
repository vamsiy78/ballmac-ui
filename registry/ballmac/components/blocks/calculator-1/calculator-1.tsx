// Ballmac UI: Calculator 1. https://ui.ballmac.com/blocks/calculator-1
"use client"

import * as React from "react"
import { ArrowRight, Check, Sparkles } from "lucide-react"

import { AnimatedNumberFlow } from "@/components/ballmac/animated-number-flow"
import { Button } from "@/components/ballmac/button"
import { Checkbox } from "@/components/ballmac/checkbox"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Slider } from "@/components/ballmac/slider"
import { cn } from "@/lib/utils"

type Calculator1Plan = {
  id: string
  name: string
  /** Per month, before seats. */
  base: number
  /** Per seat per month. */
  perSeat: number
  maxSeats: number
  includedRequests: number
  /** Price of each extra thousand requests. */
  perThousand: number
  includedStorage: number
  /** Price of each extra GB. */
  perGb: number
}

type Calculator1Addon = { id: string; name: string; description: string; price: number; /** Per seat, or once per month for the whole account. */ per: "seat" | "account" }

type Calculator1Estimate = { plan: string; seats: number; requests: number; storage: number; yearly: boolean; addons: string[]; monthly: number }

type Calculator1Props = Omit<React.ComponentProps<"section">, "title" | "onSelect"> & {
  title?: string
  description?: string
  plans?: Calculator1Plan[]
  addons?: Calculator1Addon[]
  /** How much cheaper a year paid up front is, from 0 to 1. */
  yearlyDiscount?: number
  currency?: string
  locale?: string
  /** Called with the estimate when the person continues. */
  onContinue?: (estimate: Calculator1Estimate) => void
  /** Called when the needs are beyond every plan. */
  onTalk?: (estimate: Omit<Calculator1Estimate, "plan" | "monthly">) => void
}

const samplePlans: Calculator1Plan[] = [
  { id: "starter", name: "Starter", base: 0, perSeat: 0, maxSeats: 3, includedRequests: 10_000, perThousand: 0, includedStorage: 5, perGb: 0 },
  { id: "team", name: "Team", base: 0, perSeat: 12, maxSeats: 50, includedRequests: 250_000, perThousand: 0.4, includedStorage: 100, perGb: 0.12 },
  { id: "business", name: "Business", base: 199, perSeat: 9, maxSeats: 250, includedRequests: 2_000_000, perThousand: 0.25, includedStorage: 1000, perGb: 0.08 },
]
const sampleAddons: Calculator1Addon[] = [
  { id: "sso", name: "Single sign-on", description: "SAML and SCIM for your identity provider", price: 99, per: "account" },
  { id: "support", name: "Priority support", description: "A reply within one hour, on any day", price: 4, per: "seat" },
  { id: "audit", name: "Audit log export", description: "Keep every event for as long as you need", price: 49, per: "account" },
]
const REQUESTS = [10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000]
const STORAGE = [5, 50, 100, 250, 500, 1000, 2500, 5000]

const compact = (n: number, locale: string) => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n)

function cost(p: Calculator1Plan, seats: number, requests: number, storage: number) {
  const extraReq = Math.max(0, requests - p.includedRequests) / 1000
  const extraGb = Math.max(0, storage - p.includedStorage)
  return { base: p.base, seats: p.perSeat * seats, requests: extraReq * p.perThousand, storage: extraGb * p.perGb }
}

/**
 * A pricing estimator: three sliders (seats, requests, storage), monthly or yearly, and add-ons. The cheapest plan that fits is chosen for the
 * person and the total rolls to the new price as they move; each line of the sum is shown, with what the other plans would cost. Needs beyond
 * every plan turn the button into "Talk to us" instead of showing a made-up number.
 */
function Calculator1({
  title = "Estimate your cost",
  description = "Move the sliders to match your team. The price updates as you go, and nothing here is a quote you have to accept.",
  plans = samplePlans,
  addons = sampleAddons,
  yearlyDiscount = 0.2,
  currency = "USD",
  locale = "en",
  onContinue,
  onTalk,
  className,
  ...props
}: Calculator1Props) {
  const id = React.useId()
  const [seats, setSeats] = React.useState(12)
  const [ri, setRi] = React.useState(3)
  const [si, setSi] = React.useState(2)
  const [yearly, setYearly] = React.useState(true)
  const [picked, setPicked] = React.useState<Set<string>>(new Set())

  const requests = REQUESTS[ri]!
  const storage = STORAGE[si]!
  const money = (n: number, digits = 0) => new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
  const factor = yearly ? 1 - yearlyDiscount : 1

  const fits = plans.filter((p) => p.maxSeats >= seats)
  const addonCost = addons.filter((a) => picked.has(a.id)).reduce((n, a) => n + (a.per === "seat" ? a.price * seats : a.price), 0)
  const totals = fits.map((p) => ({ plan: p, parts: cost(p, seats, requests, storage) })).map((x) => ({ ...x, monthly: (x.parts.base + x.parts.seats + x.parts.requests + x.parts.storage) * factor }))
  const best = totals.reduce<(typeof totals)[number] | undefined>((b, x) => (!b || x.monthly < b.monthly ? x : b), undefined)
  const free = best && best.monthly === 0 && !picked.size
  const monthly = best ? best.monthly + addonCost * factor : 0
  const talk = !best

  const toggle = (aid: string, on: boolean) =>
    setPicked((s) => {
      const n = new Set(s)
      if (on) n.add(aid)
      else n.delete(aid)
      return n
    })

  const lines = best
    ? [
        best.parts.base ? { label: `${best.plan.name} base`, value: best.parts.base * factor } : null,
        best.parts.seats ? { label: `${seats} ${seats === 1 ? "seat" : "seats"} × ${money(best.plan.perSeat * factor, 2)}`, value: best.parts.seats * factor } : null,
        best.parts.requests ? { label: `${compact(requests - best.plan.includedRequests, locale)} extra requests`, value: best.parts.requests * factor } : null,
        best.parts.storage ? { label: `${compact(storage - best.plan.includedStorage, locale)} GB extra storage`, value: best.parts.storage * factor } : null,
        ...addons.filter((a) => picked.has(a.id)).map((a) => ({ label: a.name, value: (a.per === "seat" ? a.price * seats : a.price) * factor })),
      ].filter((l): l is { label: string; value: number } => !!l)
    : []

  const others = totals.filter((x) => x !== best)

  return (
    <section data-slot="calculator-1" aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24", className)} {...props}>
      <header className="mx-auto max-w-2xl text-center">
        <h2 id={`${id}-title`} className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
          {title}
        </h2>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
      </header>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="bg-card grid gap-8 rounded-3xl border p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p id={`${id}-bill`} className="text-sm font-medium">
              Billing
            </p>
            <SegmentedControl value={yearly ? "yearly" : "monthly"} onValueChange={(v) => setYearly(v === "yearly")} aria-labelledby={`${id}-bill`} size="sm">
              <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
              <SegmentedControlItem value="yearly">Yearly · save {Math.round(yearlyDiscount * 100)}%</SegmentedControlItem>
            </SegmentedControl>
          </div>

          {[
            { key: "seats", label: "Team members", value: String(seats), min: 1, max: 300, v: seats, set: (n: number) => setSeats(n), hint: "People who sign in" },
            { key: "req", label: "API requests a month", value: compact(requests, locale), min: 0, max: REQUESTS.length - 1, v: ri, set: setRi, hint: "Everything your apps and automations call" },
            { key: "gb", label: "Storage", value: `${storage >= 1000 ? `${storage / 1000} TB` : `${storage} GB`}`, min: 0, max: STORAGE.length - 1, v: si, set: setSi, hint: "Files, backups and exports" },
          ].map((s) => (
            <div key={s.key}>
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <label id={`${id}-${s.key}`} className="text-sm font-medium">
                  {s.label}
                  <span className="text-muted-foreground ms-2 hidden text-xs font-normal sm:inline">{s.hint}</span>
                </label>
                <output htmlFor={`${id}-${s.key}`} className="text-2xl font-semibold tracking-tight tabular-nums">
                  {s.value}
                </output>
              </div>
              <Slider aria-labelledby={`${id}-${s.key}`} min={s.min} max={s.max} step={1} value={[s.v]} onValueChange={([n]) => s.set(n!)} formatValue={() => s.value} />
            </div>
          ))}

          <fieldset>
            <legend className="mb-3 text-sm font-medium">Add-ons</legend>
            <div className="grid gap-2.5">
              {addons.map((a) => (
                <label key={a.id} className={cn("hover:bg-accent/40 flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors motion-reduce:transition-none", picked.has(a.id) && "border-foreground/40 bg-accent/30")}>
                  <Checkbox checked={picked.has(a.id)} onCheckedChange={(v) => toggle(a.id, v === true)} className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{a.name}</span>
                    <span className="text-muted-foreground block text-sm">{a.description}</span>
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {money(a.price * factor)}
                    <span className="text-muted-foreground font-normal"> /{a.per === "seat" ? "seat" : "mo"}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside aria-labelledby={`${id}-sum`} className="bg-foreground text-background relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:sticky lg:top-6">
          <div aria-hidden="true" className="from-background/10 pointer-events-none absolute -top-24 -end-24 size-64 rounded-full bg-gradient-to-br to-transparent blur-2xl" />
          <h3 id={`${id}-sum`} className="text-background/70 flex items-center gap-2 text-sm font-medium">
            <Sparkles aria-hidden="true" className="size-4" />
            {talk ? "Beyond our plans" : "We would suggest"}
          </h3>
          {talk ? (
            <>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-balance">Let us build this one with you</p>
              <p className="text-background/70 mt-3 text-sm text-pretty">{seats} team members is more than our plans cover. We will put together a price that fits.</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{best!.plan.name}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <AnimatedNumberFlow value={monthly} locale={locale} format={{ style: "currency", currency, maximumFractionDigits: 0 }} className="text-6xl font-semibold tracking-[-0.05em]" />
                <span className="text-background/70 text-base">/month</span>
              </p>
              <p className="text-background/70 mt-1 text-sm">{free ? "Free, with room for what you described." : yearly ? `Billed ${money(monthly * 12)} a year` : "Billed monthly"}</p>
              {lines.length ? (
                <dl className="border-background/15 mt-6 grid gap-2.5 border-t pt-5 text-sm">
                  {lines.map((l) => (
                    <div key={l.label} className="flex justify-between gap-4">
                      <dt className="text-background/70">{l.label}</dt>
                      <dd className="font-medium tabular-nums">{money(l.value)}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {others.length ? (
                <p className="text-background/60 mt-5 text-xs text-pretty">
                  The other plans that fit would cost {others.map((o) => `${o.plan.name} ${money(o.monthly + addonCost * factor)}`).join(" and ")} a month.
                </p>
              ) : null}
            </>
          )}
          <Button
            variant="secondary"
            size="lg"
            className="mt-7 w-full"
            onClick={() => {
              const base = { seats, requests, storage, yearly, addons: [...picked] }
              if (talk) onTalk?.(base)
              else onContinue?.({ ...base, plan: best!.plan.id, monthly })
            }}
          >
            {talk ? "Talk to us" : `Continue with ${best!.plan.name}`}
            <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
          </Button>
          {!talk ? (
            <ul className="text-background/70 mt-5 grid gap-1.5 text-xs">
              {[`Up to ${compact(best!.plan.includedRequests, locale)} requests included`, `${best!.plan.includedStorage} GB storage included`, "Change or cancel any time"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check aria-hidden="true" className="size-3.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
        </aside>
      </div>
      <p className="sr-only" aria-live="polite">
        {talk ? "Beyond our plans. Talk to us." : `${best!.plan.name}, ${money(monthly)} a month`}
      </p>
    </section>
  )
}

export { Calculator1, type Calculator1Props, type Calculator1Plan, type Calculator1Addon, type Calculator1Estimate }
