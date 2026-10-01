// Ballmac UI: Northwind pricing page. https://ui.ballmac.com/templates/template-northwind
"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ballmac/accordion"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { NorthwindHeading, NorthwindShell, type NorthwindHrefs } from "@/components/ballmac/templates/northwind/northwind-theme"
import { cn } from "@/lib/utils"

type Billing = "annual" | "monthly"

const plans = [
  { id: "starter", name: "Starter", blurb: "For teams of up to 25 that are moving off spreadsheets.", price: 8, unit: "per person / month", features: ["Virtual and physical cards", "Receipt capture and matching", "Basic approval rules", "Sync to QuickBooks or Xero"] },
  { id: "growth", name: "Growth", blurb: "For finance teams that want budgets and policy.", price: 14, unit: "per person / month", featured: true, features: ["Everything in Starter", "Team budgets with alerts", "Multi-step approval policies", "Bill pay and reimbursements", "NetSuite and Sage Intacct sync"] },
  { id: "enterprise", name: "Enterprise", blurb: "For multiple entities, countries and auditors.", price: null, unit: "annual contract", features: ["Everything in Growth", "Multi-entity and multi-currency", "SSO, SCIM and audit exports", "Dedicated implementation lead", "99.95% uptime SLA"] },
] as const

const faqs = [
  { q: "Do I pay for every employee?", a: "You pay for people who hold a card or approve spend. Employees who only submit reimbursements are free, so rolling out to the whole company doesn’t change your bill." },
  { q: "Is there a card fee?", a: "No. Cards are free, and we earn a small share of interchange from the card network. That is why we can keep seat prices low." },
  { q: "How long does setup take?", a: "Most teams are issuing cards in a day. Accounting sync and policy setup usually take a week, with a guide at your side." },
  { q: "What if we outgrow a plan?", a: "Change plans any time. We prorate to the day, and your cards, receipts and history carry over untouched." },
]

type NorthwindPricingProps = React.ComponentProps<"div"> & { hrefs?: Partial<NorthwindHrefs> }

/** Northwind pricing: three plans with an annual saving, an included-everywhere list and questions. */
function NorthwindPricing({ hrefs, ...props }: NorthwindPricingProps) {
  const [billing, setBilling] = React.useState<Billing>("annual")
  const contact = hrefs?.contact ?? "/northwind/contact"
  return (
    <NorthwindShell page="pricing" hrefs={hrefs} {...props}>
      <main>
        <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <NorthwindHeading as="h1" className="text-5xl leading-[1.04] sm:text-7xl">Pricing that <em>scales</em> with your team, not your spend.</NorthwindHeading>
            <p className="text-muted-foreground mt-6 text-lg text-pretty">No percentage of volume, no card fees, no surprise add-ons.</p>
            <SegmentedControl aria-label="Billing period" value={billing} onValueChange={(v) => setBilling(v as Billing)} className="mt-9">
              <SegmentedControlItem value="annual">Annual · save 20%</SegmentedControlItem>
              <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
            </SegmentedControl>
          </div>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {plans.map((p) => {
              const price = p.price === null ? null : billing === "annual" ? Math.round(p.price * 0.8) : p.price
              const featured = "featured" in p && p.featured
              return (
                <article key={p.id} className={cn("flex flex-col rounded-3xl border p-8", featured ? "bg-primary text-primary-foreground border-transparent" : "bg-card")}>
                  <h2 className="text-[26px] font-medium tracking-tight [font-family:var(--northwind-serif),ui-serif,Georgia,serif]">{p.name}</h2>
                  <p className={cn("mt-2 min-h-12 text-[15px] text-pretty", featured ? "opacity-80" : "text-muted-foreground")}>{p.blurb}</p>
                  <p className="mt-6 flex items-baseline gap-2">
                    {price === null ? <span className="text-5xl font-medium tracking-tight [font-family:var(--northwind-serif),ui-serif,Georgia,serif]">Let’s talk</span> : (
                      <>
                        <span className="text-6xl font-medium tracking-[-0.04em] tabular-nums [font-family:var(--northwind-serif),ui-serif,Georgia,serif]">${price}</span>
                        <span className={cn("text-sm", featured ? "opacity-70" : "text-muted-foreground")}>{p.unit}</span>
                      </>
                    )}
                  </p>
                  <a href={contact} className={cn("focus-visible:ring-ring/50 mt-7 inline-flex h-12 items-center justify-center rounded-full text-[15px] font-medium outline-none transition-opacity focus-visible:ring-[3px]", featured ? "bg-primary-foreground text-primary hover:opacity-90" : "bg-primary text-primary-foreground hover:opacity-90")}>
                    {price === null ? "Contact sales" : "Book a demo"}
                  </a>
                  <ul className="mt-8 space-y-3.5 border-t border-current/15 pt-7 text-[15px]">
                    {p.features.map((f) => <li key={f} className="flex items-start gap-3"><Check className={cn("mt-1 size-4 shrink-0", featured ? "" : "text-chart-1")} aria-hidden="true" />{f}</li>)}
                  </ul>
                </article>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="nw-included" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <NorthwindHeading id="nw-included" className="max-w-xl text-3xl sm:text-5xl">Included with every plan.</NorthwindHeading>
          <ul className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {["Unlimited virtual cards", "Real-time spend alerts", "Mobile app for iOS and Android", "Receipt capture by email and text", "CSV and API exports", "Bank-level encryption and 2FA", "US-based support, weekdays", "Free onboarding session"].map((x) => (
              <li key={x} className="flex items-start gap-3 border-t pt-4"><Check className="text-chart-1 mt-1 size-4 shrink-0" aria-hidden="true" />{x}</li>
            ))}
          </ul>
        </section>

        <section className="bg-surface border-y" aria-labelledby="nw-faq">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
            <NorthwindHeading id="nw-faq" className="text-3xl sm:text-5xl">Questions we hear <em>often</em>.</NorthwindHeading>
            <Accordion type="single" collapsible>
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-lg">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-[15px] text-pretty">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
    </NorthwindShell>
  )
}

export { NorthwindPricing, type NorthwindPricingProps }
