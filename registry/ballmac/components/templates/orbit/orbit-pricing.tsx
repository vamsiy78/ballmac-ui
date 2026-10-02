// Ballmac UI: Orbit pricing page. https://ui.ballmac.com/templates/template-orbit
"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ballmac/accordion"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Slider } from "@/components/ballmac/slider"
import { OrbitShell, type OrbitHrefs } from "@/components/ballmac/templates/orbit/orbit-theme"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--orbit-mono)" } as const
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const moneyCents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })
const count = new Intl.NumberFormat("en-US")

type Billing = "monthly" | "yearly"

const plans = [
  { id: "hobby", name: "Hobby", price: 0, blurb: "For side projects and learning.", cta: "Start free", runs: "10,000 runs included", features: ["3 agents", "Community tools", "7-day trace history", "Email support"] },
  { id: "team", name: "Team", price: 49, blurb: "For teams shipping agents to customers.", cta: "Start 14-day trial", runs: "250,000 runs included", features: ["Unlimited agents", "Evals and GitHub checks", "90-day trace history", "Approvals and audit log", "Priority support"], featured: true },
  { id: "scale", name: "Scale", price: null, blurb: "For regulated and high-volume workloads.", cta: "Talk to sales", runs: "Volume pricing", features: ["Your VPC or on-prem data plane", "SSO, SCIM and custom roles", "1-year trace retention", "99.99% uptime SLA", "Dedicated engineer"] },
] as const

const faqs = [
  { q: "What counts as a run?", a: "One end-to-end execution of an agent, from the first prompt to the final reply, however many tool calls or model turns it takes. Retries of the same run are free." },
  { q: "Do I pay for model tokens?", a: "Bring your own keys and pay your model provider directly, or use Orbit’s pooled capacity at cost plus 8 percent. Either way the bill shows tokens per run." },
  { q: "What happens when I pass my included runs?", a: "Nothing breaks. Extra runs are billed at the rate in the calculator, and you can set a hard monthly cap so a loop can never surprise you." },
  { q: "Can I self-host?", a: "The Scale plan runs the data plane in your own cloud or on-prem. The control plane stays hosted, and no prompts, tool data or secrets ever leave your network." },
  { q: "Is there a discount for startups or nonprofits?", a: "Yes. Startups under two years old get 50 percent off Team for a year, and verified nonprofits get 40 percent off for good." },
]

function Calculator({ billing }: { billing: Billing }) {
  const [runs, setRuns] = React.useState(400_000)
  const seats = 5
  const included = 250_000
  const extra = Math.max(0, runs - included)
  const seatPrice = billing === "yearly" ? 39 : 49
  const base = seats * seatPrice
  // Overage gets cheaper in steps: $2.00 per thousand to 1M, then $1.40.
  const tier1 = Math.min(extra, 750_000)
  const tier2 = Math.max(0, extra - 750_000)
  const overage = (tier1 / 1000) * 2 + (tier2 / 1000) * 1.4
  const total = base + overage
  return (
    <section aria-labelledby="orbit-calc" className="bg-card/60 mx-auto mt-16 max-w-5xl rounded-3xl border p-6 sm:p-10">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
        <div>
          <h2 id="orbit-calc" className="text-2xl font-semibold tracking-[-0.03em]">Estimate your bill</h2>
          <p className="text-muted-foreground mt-2 text-sm text-pretty">Team plan for {seats} seats. Drag to see how overage scales.</p>
          <div className="mt-10">
            <div className="flex items-baseline justify-between text-sm">
              <label id="orbit-runs-label" className="text-muted-foreground">Runs per month</label>
              <output className="text-xl font-medium tabular-nums" style={mono} aria-live="polite">{count.format(runs)}</output>
            </div>
            <Slider className="mt-5" aria-labelledby="orbit-runs-label" min={50_000} max={2_000_000} step={50_000} value={[runs]} onValueChange={(v) => setRuns(v[0] ?? runs)} formatValue={(v) => `${count.format(v)} runs`} />
            <div className="text-muted-foreground mt-2 flex justify-between text-xs tabular-nums" style={mono}><span>50k</span><span>2M</span></div>
          </div>
        </div>
        <div className="bg-background/60 space-y-3 rounded-2xl border p-5 text-sm">
          <dl className="space-y-3">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{seats} seats × {money.format(seatPrice)}</dt><dd className="tabular-nums" style={mono}>{money.format(base)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{count.format(included)} runs included</dt><dd className="tabular-nums" style={mono}>$0</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{count.format(extra)} extra runs</dt><dd className="tabular-nums" style={mono}>{moneyCents.format(overage)}</dd></div>
            <div className="flex items-baseline justify-between gap-4 border-t pt-4"><dt className="font-medium">Estimated per month</dt><dd className="text-3xl font-semibold tracking-[-0.03em] tabular-nums">{money.format(total)}</dd></div>
          </dl>
          <p className="text-muted-foreground text-xs">Model tokens are billed by your provider. Set a hard cap in settings.</p>
        </div>
      </div>
    </section>
  )
}

type OrbitPricingProps = React.ComponentProps<"div"> & { hrefs?: Partial<OrbitHrefs> }

/** Orbit pricing: three plans with a monthly and yearly switch, a usage calculator and common questions. */
function OrbitPricing({ hrefs, ...props }: OrbitPricingProps) {
  const [billing, setBilling] = React.useState<Billing>("yearly")
  return (
    <OrbitShell page="pricing" hrefs={hrefs} {...props}>
      <main className="px-4 pt-16 pb-20 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-chart-1 text-sm font-medium" style={mono}>Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">Pay for runs, not for hope.</h1>
          <p className="text-muted-foreground mt-5 text-lg text-pretty">Start free, then grow into seats and volume. Every plan includes traces, tools and the full SDK.</p>
          <SegmentedControl aria-label="Billing period" value={billing} onValueChange={(v) => setBilling(v as Billing)} className="mt-9">
            <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
            <SegmentedControlItem value="yearly">Yearly · save 20%</SegmentedControlItem>
          </SegmentedControl>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-4 lg:grid-cols-3">
          {plans.map((p) => {
            const price = p.price === null ? null : p.price === 0 ? 0 : billing === "yearly" ? Math.round(p.price * 0.8) : p.price
            return (
              <article key={p.id} className={cn("bg-card/60 relative flex flex-col rounded-3xl border p-7", "featured" in p && p.featured && "border-chart-1/60 shadow-[0_30px_80px_-40px_oklch(0.6_0.2_285/0.7)]")}>
                {"featured" in p && p.featured && <span className="bg-chart-1 text-background absolute -top-3 start-7 rounded-full px-3 py-0.5 text-xs font-medium">Most popular</span>}
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <p className="text-muted-foreground mt-1 text-sm text-pretty">{p.blurb}</p>
                <p className="mt-6 flex items-baseline gap-1.5">
                  {price === null ? <span className="text-4xl font-semibold tracking-[-0.04em]">Custom</span> : (
                    <>
                      <span className="text-5xl font-semibold tracking-[-0.045em] tabular-nums">{money.format(price)}</span>
                      <span className="text-muted-foreground text-sm">{price === 0 ? "forever" : "per seat / month"}</span>
                    </>
                  )}
                </p>
                <p className="text-muted-foreground mt-2 text-sm" style={mono}>{p.runs}</p>
                <a href="#" className={cn("focus-visible:ring-ring/50 mt-6 inline-flex h-11 items-center justify-center rounded-xl text-sm font-medium outline-none transition-opacity focus-visible:ring-[3px]", "featured" in p && p.featured ? "bg-foreground text-background hover:opacity-90" : "hover:bg-accent border")}>{p.cta}</a>
                <ul className="mt-7 space-y-3 border-t pt-6 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5"><Check className="text-chart-2 mt-0.5 size-4 shrink-0" aria-hidden="true" />{f}</li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>

        <Calculator billing={billing} />

        <section className="mx-auto mt-24 max-w-3xl" aria-labelledby="orbit-faq">
          <h2 id="orbit-faq" className="text-3xl font-semibold tracking-[-0.04em]">Questions, answered</h2>
          <Accordion type="single" collapsible className="mt-6">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-pretty">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </OrbitShell>
  )
}

export { OrbitPricing, type OrbitPricingProps }
