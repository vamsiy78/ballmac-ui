// Ballmac UI: Northwind home page. https://ui.ballmac.com/templates/template-northwind
"use client"

import * as React from "react"
import { ArrowRight, Check, Quote } from "lucide-react"

import { BlurFade } from "@/components/ballmac/blur-fade"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { NorthwindHeading, NorthwindShell, type NorthwindHrefs } from "@/components/ballmac/templates/northwind/northwind-theme"
import { NorthwindTour } from "@/components/ballmac/templates/northwind/northwind-tour"
import { cn } from "@/lib/utils"

const serif = "[font-family:var(--northwind-serif),ui-serif,Georgia,serif]"

const logos = ["Harlow & Pine", "Fernhill", "Oakline", "Brightwell", "Tidewater", "Marlow Co"]

const before = ["Receipts in a shared inbox", "Spreadsheets for every team’s budget", "Cards approved by whoever answers Slack", "Nine days to close the month"]
const after = ["Receipts captured and matched at purchase", "Live budgets every team can see", "Policy routes each request to the right person", "Three days to close the month"]

function Mini({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div role="img" aria-label={label} className="bg-surface rounded-2xl border p-5 sm:p-7">
      <div aria-hidden="true">{children}</div>
    </div>
  )
}

type NorthwindHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<NorthwindHrefs> }

/** The Northwind home page: an editorial hero, an interactive product tour, proof, three product stories and a quote. */
function NorthwindHome({ hrefs, ...props }: NorthwindHomeProps) {
  const contact = hrefs?.contact ?? "/northwind/contact"
  return (
    <NorthwindShell page="home" hrefs={hrefs} {...props}>
      <main>
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
          <BlurFade>
            <p className="text-chart-2 text-sm font-semibold tracking-wide uppercase">Spend management for finance teams</p>
            <NorthwindHeading as="h1" className="mt-5 max-w-4xl text-5xl leading-[1.02] sm:text-7xl lg:text-[5.5rem]">
              Spend with <em>clarity</em>, close with calm.
            </NorthwindHeading>
            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <p className="text-muted-foreground max-w-xl text-lg text-pretty sm:text-xl">
                Northwind gives every team the cards, approvals and budgets they need, and gives finance a ledger that is already right on the first of the month.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href={contact} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex h-13 items-center justify-center gap-2 rounded-full px-7 text-base font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">
                  Book a demo <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
                </a>
                <a href="#tour" className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-13 items-center justify-center rounded-full border px-7 text-base font-medium outline-none transition-colors focus-visible:ring-[3px]">Take the tour</a>
              </div>
            </div>
          </BlurFade>
        </section>

        <section id="tour" aria-label="Product tour" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-20 sm:px-6">
          <NorthwindTour />
        </section>

        <section aria-label="Customers" className="border-y">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <p className="text-muted-foreground text-center text-sm">Trusted by 1,400 finance teams</p>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 text-center sm:grid-cols-3 lg:grid-cols-6">
              {logos.map((l) => <li key={l} className={cn("text-muted-foreground text-xl font-medium tracking-tight", serif)}>{l}</li>)}
            </ul>
          </div>
        </section>

        <section aria-label="Results" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <dl className="grid gap-10 sm:grid-cols-3">
            {[
              { v: 62, s: "%", l: "Faster month-end close", d: 0 },
              { v: 4.2, s: "B", p: "$", l: "Spend managed each year", d: 1 },
              { v: 97, s: "%", l: "Receipts matched automatically", d: 0 },
            ].map((x) => (
              <div key={x.l} className="border-t-2 border-current pt-5">
                <dd className={cn("text-6xl font-medium tracking-[-0.04em] tabular-nums sm:text-7xl", serif)}>{x.p}<NumberTicker value={x.v} format={{ minimumFractionDigits: x.d, maximumFractionDigits: x.d }} />{x.s}</dd>
                <dt className="text-muted-foreground mt-3">{x.l}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* Three stories */}
        <section className="mx-auto max-w-6xl space-y-24 px-4 pb-24 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-chart-2 text-sm font-semibold tracking-wide uppercase">Cards</p>
              <NorthwindHeading className="mt-3 text-4xl sm:text-5xl">Give every team a card that <em>knows</em> the rules.</NorthwindHeading>
              <p className="text-muted-foreground mt-5 text-lg text-pretty">Limits, merchants and approval policies travel with the card, so the right purchase just works and the wrong one never leaves the building.</p>
              <ul className="mt-6 space-y-3">{["Virtual cards for every subscription", "Merchant and category locks", "Instant freeze, from any device"].map((x) => <li key={x} className="flex items-start gap-3"><Check className="text-chart-1 mt-1 size-4 shrink-0" aria-hidden="true" />{x}</li>)}</ul>
            </div>
            <Mini label="Three virtual cards with limits">
              <div className="space-y-3">
                {[["Design tools", "$2,400", "bg-chart-1"], ["Cloud hosting", "$14,500", "bg-chart-2"], ["Team offsite", "$8,000", "bg-chart-5"]].map(([n, a, t]) => (
                  <div key={n} className="bg-card flex items-center gap-4 rounded-xl border p-4">
                    <span className={cn("h-10 w-14 rounded-md", t)} />
                    <div className="flex-1"><p className="font-medium">{n}</p><p className="text-muted-foreground text-sm">Monthly limit</p></div>
                    <p className="font-medium tabular-nums">{a}</p>
                  </div>
                ))}
              </div>
            </Mini>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Mini label="Before and after comparison">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-muted-foreground text-sm font-semibold">Before</p><ul className="mt-3 space-y-3 text-sm">{before.map((x) => <li key={x} className="text-muted-foreground flex gap-2"><span aria-hidden="true">×</span>{x}</li>)}</ul></div>
                <div><p className="text-chart-1 text-sm font-semibold">With Northwind</p><ul className="mt-3 space-y-3 text-sm">{after.map((x) => <li key={x} className="flex gap-2"><Check className="text-chart-1 mt-0.5 size-4 shrink-0" />{x}</li>)}</ul></div>
              </div>
            </Mini>
            <div>
              <p className="text-chart-2 text-sm font-semibold tracking-wide uppercase">Close</p>
              <NorthwindHeading className="mt-3 text-4xl sm:text-5xl">The month closes itself, <em>nearly</em>.</NorthwindHeading>
              <p className="text-muted-foreground mt-5 text-lg text-pretty">Every transaction is matched to a receipt, coded to your chart of accounts and synced to your ledger as it happens. What is left on close day is review, not data entry.</p>
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-chart-2 text-sm font-semibold tracking-wide uppercase">Reporting</p>
              <NorthwindHeading className="mt-3 text-4xl sm:text-5xl">Answers for the board, <em>before</em> they ask.</NorthwindHeading>
              <p className="text-muted-foreground mt-5 text-lg text-pretty">Spend by team, vendor and project, always current. Build a view once and share it with a link.</p>
            </div>
            <Mini label="Bar chart of spend by team over six months">
              <div className="flex h-44 items-end gap-3">
                {[48, 56, 52, 70, 64, 82].map((h, i) => <div key={i} className="flex flex-1 flex-col justify-end gap-1"><div className="bg-chart-1 rounded-t-md" style={{ height: `${h * 0.55}%` }} /><div className="bg-chart-2 rounded-t-md" style={{ height: `${h * 0.3}%` }} /></div>)}
              </div>
              <div className="text-muted-foreground mt-3 flex justify-between text-xs"><span>May</span><span>Oct</span></div>
            </Mini>
          </div>
        </section>

        <section className="bg-primary text-primary-foreground">
          <figure className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
            <Quote className="mx-auto size-8 opacity-50 rtl:-scale-x-100" aria-hidden="true" />
            <blockquote className={cn("mt-6 text-3xl leading-snug tracking-[-0.02em] text-balance sm:text-5xl", serif)}>
              “We went from nine days to three to close the books, and nobody on my team has asked me for a receipt since March.”
            </blockquote>
            <figcaption className="mt-8 text-sm opacity-80"><span className="font-semibold">Elena Marchetti</span> · Controller, Harlow &amp; Pine</figcaption>
          </figure>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <NorthwindHeading className="mx-auto max-w-3xl text-4xl sm:text-6xl">See it with <em>your</em> numbers.</NorthwindHeading>
          <p className="text-muted-foreground mx-auto mt-5 max-w-lg text-lg text-pretty">A 30-minute walkthrough, built around how your team spends today.</p>
          <a href={contact} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mt-8 inline-flex h-13 items-center gap-2 rounded-full px-7 text-base font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Book a demo <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></a>
        </section>
      </main>
    </NorthwindShell>
  )
}

export { NorthwindHome, type NorthwindHomeProps }
