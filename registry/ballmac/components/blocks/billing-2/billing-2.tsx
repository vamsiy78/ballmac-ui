// Ballmac UI: Billing 2. https://ui.ballmac.com/blocks/billing-2
"use client"

import * as React from "react"
import { Check, Minus, Plus } from "lucide-react"

import { Badge } from "@/components/ballmac/badge"
import { Button } from "@/components/ballmac/button"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/ballmac/i18n"

type Billing2Plan = {
  id: string
  name: string
  /** Price per seat per month when billed monthly. */
  monthly: number
  /** Price per seat per month when billed yearly. */
  yearly: number
  description: string
  features: string[]
}

type Billing2Props = Omit<React.ComponentProps<"section">, "title" | "onSubmit"> & {
  /** Page heading. */
  title?: string
  /** One line under the heading. */
  description?: string
  /** Plans to choose from. */
  plans?: Billing2Plan[]
  /** Id of the plan the account is on now. */
  currentPlan?: string
  /** Plan selected when the page opens. Defaults to the plan after the current one, so the summary shows an upgrade. */
  defaultPlan?: string
  /** Seats the account has now. */
  currentSeats?: number
  /** How it is billed now. */
  currentInterval?: "monthly" | "yearly"
  /** Today, as an ISO date. Passed in so the proration is the same on the server and in the browser. */
  today?: string
  /** The date the current period ends and the next one starts, as an ISO date. */
  renewsOn?: string
  /** Seats can't go below this (people already on the team). */
  minSeats?: number
  /** ISO currency code. */
  currency?: string
  /** Locale for numbers and dates. Fixed by default so server and browser match. */
  locale?: string
  /** Called with the choice when it is confirmed. Throw to show an error; resolve to show the confirmation. */
  onConfirm?: (change: { plan: string; seats: number; interval: "monthly" | "yearly" }) => void | Promise<void>
}

const defaultPlans: Billing2Plan[] = [
  { id: "starter", name: "Starter", monthly: 12, yearly: 9, description: "For small teams getting started.", features: ["3 projects", "10 GB storage", "Community support"] },
  { id: "pro", name: "Pro", monthly: 32, yearly: 25, description: "For teams that ship every week.", features: ["Unlimited projects", "1 TB storage", "Roles and SSO", "Priority support"] },
  { id: "scale", name: "Scale", monthly: 79, yearly: 63, description: "For security and volume needs.", features: ["Audit log and SCIM", "99.99% uptime SLA", "Dedicated manager", "Custom retention"] },
]

const DAY = 86400000
const utc = (iso: string) => Date.parse(`${iso}T00:00:00Z`)

function Billing2({
  title = "Change your plan",
  description = "Pick a plan and seats. You only pay the difference for the days left in this period.",
  plans = defaultPlans,
  currentPlan = "pro",
  defaultPlan,
  currentSeats = 7,
  currentInterval = "monthly",
  today = "2026-10-01",
  renewsOn = "2026-10-28",
  minSeats = 7,
  currency = "USD",
  locale,
  onConfirm,
  className,
  ...props
}: Billing2Props) {
  const defaultLocale = useLocale()
  locale ??= defaultLocale
  const [planId, setPlanId] = React.useState(defaultPlan ?? plans[plans.findIndex((p) => p.id === currentPlan) + 1]?.id ?? currentPlan)
  const [seats, setSeats] = React.useState(currentSeats)
  const [period, setPeriod] = React.useState<"monthly" | "yearly">(currentInterval)
  const [state, setState] = React.useState<"idle" | "saving" | "error" | "done">("idle")
  const money = React.useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 }), [locale, currency])
  const whole = React.useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }), [locale, currency])
  const date = React.useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }), [locale])

  const current = plans.find((p) => p.id === currentPlan) ?? plans[0]
  const next = plans.find((p) => p.id === planId) ?? plans[0]
  if (!current || !next) return null

  const lengthOf = (i: "monthly" | "yearly") => (i === "yearly" ? 365 : 30)
  const daysLeft = Math.max(0, Math.min(lengthOf(currentInterval), Math.round((utc(renewsOn) - utc(today)) / DAY)))
  const perSeat = (p: Billing2Plan, i: "monthly" | "yearly") => (i === "yearly" ? p.yearly * 12 : p.monthly)
  const currentCost = perSeat(current, currentInterval) * currentSeats
  const nextCost = perSeat(next, period) * seats
  // Both sides are charged by the day for the days left in the current period.
  const credit = (currentCost / lengthOf(currentInterval)) * daysLeft
  const charge = (nextCost / lengthOf(period)) * daysLeft
  const dueToday = Math.max(0, charge - credit)
  const unchanged = planId === currentPlan && seats === currentSeats && period === currentInterval
  const direction = next === current ? (seats > currentSeats ? "Add seats" : "Update seats") : plans.indexOf(next) > plans.indexOf(current) ? `Upgrade to ${next.name}` : `Switch to ${next.name}`

  async function confirm() {
    setState("saving")
    try {
      if (onConfirm) await onConfirm({ plan: planId, seats, interval: period })
      else await new Promise((r) => setTimeout(r, 900))
      setState("done")
    } catch {
      setState("error")
    }
  }

  return (
    <section data-slot="billing-2" className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-6", className)} {...props}>
      <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>

      {state === "done" ? (
        <div role="status" className="bg-card mt-8 flex flex-col items-center rounded-3xl border px-6 py-16 text-center">
          <span aria-hidden="true" className="bg-chart-2/15 flex size-14 items-center justify-center rounded-full"><Check className="size-7" /></span>
          <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">You’re on {next.name}</h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-pretty">{seats} seats, billed {period}. {dueToday > 0 ? `We charged ${money.format(dueToday)} today.` : "There is nothing to pay today."} Your next invoice is on {date.format(new Date(utc(renewsOn)))}.</p>
          <Button variant="outline" shape="pill" className="mt-8" onClick={() => setState("idle")}>Make another change</Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_21rem]">
          <div className="min-w-0 space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium">Billing</p>
              <SegmentedControl aria-label="Billing interval" value={period} onValueChange={(v) => setPeriod(v as "monthly" | "yearly")}>
                <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
                <SegmentedControlItem value="yearly">Yearly · save 20%</SegmentedControlItem>
              </SegmentedControl>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Plan</legend>
              <div className="grid gap-3">
                {plans.map((p) => {
                  const on = planId === p.id
                  const price = period === "yearly" ? p.yearly : p.monthly
                  return (
                    <label key={p.id} className="relative cursor-pointer">
                      <input type="radio" name="billing-2-plan" value={p.id} checked={on} onChange={() => setPlanId(p.id)} className="peer sr-only" />
                      <span className="peer-focus-visible:ring-ring/50 peer-checked:border-foreground peer-checked:bg-accent/50 hover:bg-accent/30 bg-card flex flex-col gap-4 rounded-2xl border p-5 transition-colors peer-focus-visible:ring-[3px] sm:flex-row sm:items-center">
                        <span className="flex flex-1 items-start gap-3">
                          <span aria-hidden="true" className={cn("mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border", on && "bg-foreground text-background border-transparent")}>{on && <Check className="size-3" />}</span>
                          <span>
                            <span className="flex items-center gap-2 font-semibold">{p.name}{p.id === currentPlan && <Badge variant="outline">Current</Badge>}</span>
                            <span className="text-muted-foreground mt-0.5 block text-sm">{p.description}</span>
                            <span className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">{p.features.map((f) => <span key={f} className="flex items-center gap-1"><Check className="size-3" aria-hidden="true" />{f}</span>)}</span>
                          </span>
                        </span>
                        <span className="sm:text-end">
                          <span className="text-2xl font-semibold tracking-[-0.03em] tabular-nums">{whole.format(price)}</span>
                          <span className="text-muted-foreground block text-xs">per seat / month</span>
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div>
              <p id="billing-2-seats" className="mb-2 text-sm font-medium">Seats</p>
              <div role="group" aria-labelledby="billing-2-seats" className="inline-flex items-center rounded-xl border">
                <Button variant="ghost" size="icon" aria-label="Remove a seat" disabled={seats <= minSeats} onClick={() => setSeats((s) => Math.max(minSeats, s - 1))}><Minus /></Button>
                <span role="status" aria-label={`${seats} seats`} className="w-14 text-center text-sm font-semibold tabular-nums">{seats}</span>
                <Button variant="ghost" size="icon" aria-label="Add a seat" onClick={() => setSeats((s) => s + 1)}><Plus /></Button>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">{minSeats} people are on the team now, so you can’t go below {minSeats}.</p>
            </div>
          </div>

          <aside aria-label="Order summary" className="bg-card h-fit rounded-2xl border p-5 lg:sticky lg:top-6">
            <p className="text-sm font-medium">Summary</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{next.name} × {seats} seats</dt><dd className="tabular-nums">{money.format(nextCost)} / {period === "yearly" ? "yr" : "mo"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">New cost for {daysLeft} remaining days</dt><dd className="tabular-nums">{money.format(charge)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Credit for your current plan</dt><dd className="tabular-nums">−{money.format(credit)}</dd></div>
              <div className="flex justify-between gap-3 border-t pt-3 text-base font-semibold"><dt>Due today</dt><dd className="tabular-nums">{money.format(dueToday)}</dd></div>
            </dl>
            <p className="text-muted-foreground mt-3 text-xs">From {date.format(new Date(utc(renewsOn)))} you’ll pay {money.format(nextCost)} per {period === "yearly" ? "year" : "month"}. Cancel any time.</p>
            {state === "error" && <p role="alert" className="text-destructive mt-3 text-sm">We couldn’t update your plan. Please try again.</p>}
            <Button size="lg" shape="pill" className="mt-5 w-full" disabled={unchanged} loading={state === "saving"} onClick={confirm}>{unchanged ? "Choose a change" : direction}</Button>
          </aside>
        </div>
      )}
    </section>
  )
}

export { Billing2, type Billing2Props, type Billing2Plan }
