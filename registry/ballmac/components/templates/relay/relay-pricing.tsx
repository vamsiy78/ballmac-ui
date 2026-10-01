// Ballmac UI: Relay pricing page. https://ui.ballmac.com/templates/template-relay
"use client"

import * as React from "react"
import { Check, Minus } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ballmac/accordion"
import { Slider } from "@/components/ballmac/slider"
import { RelayShell, type RelayHrefs } from "@/components/ballmac/templates/relay/relay-theme"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--relay-mono)" } as const
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const moneyExact = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })
const count = new Intl.NumberFormat("en-US")

const plans = [
  { name: "Free", price: "$0", per: "forever", events: "100,000 events / mo", cta: "Start free", features: ["3 endpoints", "Retries for 24 hours", "7-day attempt history", "Community support"] },
  { name: "Pro", price: "$49", per: "per month", events: "1M events / mo", cta: "Start Pro", featured: true, features: ["Unlimited endpoints", "Retries for 3 days", "90-day attempt history", "Replay and transformations", "Email support"] },
  { name: "Scale", price: "Custom", per: "annual", events: "Billions of events", cta: "Contact sales", features: ["Dedicated delivery pool", "mTLS and IP allow-lists", "1-year retention", "99.99% SLA", "Shared Slack channel"] },
]

const rows: { feature: string; free: boolean | string; pro: boolean | string; scale: boolean | string }[] = [
  { feature: "Endpoints", free: "3", pro: "Unlimited", scale: "Unlimited" },
  { feature: "Retry window", free: "24 hours", pro: "3 days", scale: "7 days" },
  { feature: "Attempt history", free: "7 days", pro: "90 days", scale: "1 year" },
  { feature: "Replay", free: false, pro: true, scale: true },
  { feature: "Transformations", free: false, pro: true, scale: true },
  { feature: "Per-endpoint rate limits", free: false, pro: true, scale: true },
  { feature: "mTLS and IP allow-lists", free: false, pro: false, scale: true },
  { feature: "Uptime SLA", free: false, pro: "99.9%", scale: "99.99%" },
]

const faqs = [
  { q: "What is an event?", a: "One message you send to Relay, no matter how many endpoints it fans out to or how many retries it needs. Replays count as new events." },
  { q: "What happens above my plan’s events?", a: "You pay the rate shown in the calculator. Nothing is throttled, and you can set a hard cap that pauses sending instead." },
  { q: "Can I try Pro before paying?", a: "Every account starts with a 14-day Pro trial, no card required. You fall back to Free afterwards." },
]

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === "string") return <span className="text-sm">{v}</span>
  return v ? <Check className="text-chart-2 mx-auto size-4" aria-label="Included" role="img" /> : <Minus className="text-muted-foreground mx-auto size-4" aria-label="Not included" role="img" />
}

type RelayPricingProps = React.ComponentProps<"div"> & { hrefs?: Partial<RelayHrefs> }

/** Relay pricing: plans, a per-volume estimator with a stepped rate, a comparison table and questions. */
function RelayPricing({ hrefs, ...props }: RelayPricingProps) {
  const [events, setEvents] = React.useState(3_000_000)
  const included = 1_000_000
  const extra = Math.max(0, events - included)
  const t1 = Math.min(extra, 4_000_000)
  const t2 = Math.max(0, extra - 4_000_000)
  const overage = (t1 / 1_000_000) * 8 + (t2 / 1_000_000) * 5
  const total = 49 + overage
  return (
    <RelayShell page="pricing" hrefs={hrefs} {...props}>
      <main>
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-chart-1 text-xs font-semibold tracking-wider uppercase" style={mono}>Pricing</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-6xl">Priced per event. Cheaper as you grow.</h1>
            <p className="text-muted-foreground mt-5 max-w-xl text-lg text-pretty">No seats, no endpoint fees, no surprise tiers. Every plan gets the full delivery engine.</p>
            <div className="mt-12 grid overflow-hidden rounded-lg border lg:grid-cols-3">
              {plans.map((p) => (
                <article key={p.name} className={cn("bg-card flex flex-col border-b p-7 last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0", p.featured && "bg-surface")}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold" style={mono}>{p.name}</h2>
                    {p.featured && <span className="bg-chart-1 text-background rounded-sm px-2 py-0.5 text-[11px] font-semibold" style={mono}>POPULAR</span>}
                  </div>
                  <p className="mt-6 flex items-baseline gap-2"><span className="text-5xl font-semibold tracking-[-0.05em]">{p.price}</span><span className="text-muted-foreground text-sm">{p.per}</span></p>
                  <p className="text-muted-foreground mt-2 text-sm" style={mono}>{p.events}</p>
                  <a href="#" className={cn("focus-visible:ring-ring/50 mt-6 inline-flex h-11 items-center justify-center rounded-md text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px]", p.featured ? "bg-foreground text-background hover:opacity-90" : "hover:bg-accent border")} style={mono}>{p.cta}</a>
                  <ul className="mt-7 space-y-3 text-sm">
                    {p.features.map((f) => <li key={f} className="flex items-start gap-2.5"><Check className="text-chart-2 mt-0.5 size-4 shrink-0" aria-hidden="true" />{f}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b" aria-labelledby="relay-estimator">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <h2 id="relay-estimator" className="text-2xl font-semibold tracking-[-0.03em]">Estimate your Pro bill</h2>
              <p className="text-muted-foreground mt-2 text-sm text-pretty">$49 includes 1M events. Then $8 per million up to 5M, and $5 per million beyond.</p>
              <div className="mt-10">
                <div className="flex items-baseline justify-between"><label id="relay-events" className="text-muted-foreground text-sm">Events per month</label><output className="text-xl font-medium tabular-nums" style={mono} aria-live="polite">{count.format(events)}</output></div>
                <Slider className="mt-5" aria-labelledby="relay-events" min={500_000} max={50_000_000} step={500_000} value={[events]} onValueChange={(v) => setEvents(v[0] ?? events)} formatValue={(v) => `${count.format(v)} events`} />
                <div className="text-muted-foreground mt-2 flex justify-between text-xs" style={mono}><span>500k</span><span>50M</span></div>
              </div>
            </div>
            <div className="bg-card space-y-3 rounded-lg border p-5 text-sm" style={mono}>
              <dl className="space-y-3">
                <div className="flex justify-between"><dt className="text-muted-foreground">Pro base</dt><dd>$49.00</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">{count.format(extra)} extra events</dt><dd className="tabular-nums">{moneyExact.format(overage)}</dd></div>
                <div className="flex items-baseline justify-between border-t pt-4"><dt className="font-semibold">Per month</dt><dd className="text-3xl font-semibold tabular-nums">{money.format(total)}</dd></div>
              </dl>
              <p className="text-muted-foreground text-xs" style={{ fontFamily: "var(--relay-sans)" }}>Effective rate: {moneyExact.format(total / (events / 1_000_000))} per million events.</p>
            </div>
          </div>
        </section>

        <section className="border-b">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6"><div tabIndex={0} role="region" aria-label="Plan comparison" className="focus-visible:ring-ring/50 overflow-x-auto rounded-md outline-none focus-visible:ring-[3px]">
            <table className="w-full min-w-[34rem] text-left">
              <caption className="sr-only">Plan comparison</caption>
              <thead>
                <tr className="border-b text-xs tracking-wider uppercase" style={mono}>
                  <th scope="col" className="py-3 pr-4 font-semibold">Feature</th>
                  {plans.map((p) => <th key={p.name} scope="col" className="px-4 py-3 text-center font-semibold">{p.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.feature} className="border-b">
                    <th scope="row" className="py-3.5 pr-4 text-sm font-normal">{r.feature}</th>
                    <td className="px-4 py-3.5 text-center"><Cell v={r.free} /></td>
                    <td className="bg-surface px-4 py-3.5 text-center"><Cell v={r.pro} /></td>
                    <td className="px-4 py-3.5 text-center"><Cell v={r.scale} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6" aria-labelledby="relay-faq">
          <h2 id="relay-faq" className="text-2xl font-semibold tracking-[-0.03em]">Questions</h2>
          <Accordion type="single" collapsible className="mt-5">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}><AccordionTrigger>{f.q}</AccordionTrigger><AccordionContent className="text-muted-foreground text-pretty">{f.a}</AccordionContent></AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </RelayShell>
  )
}

export { RelayPricing, type RelayPricingProps }
