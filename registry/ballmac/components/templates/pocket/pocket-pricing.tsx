// Ballmac UI: Pocket pricing page. https://ui.ballmac.com/templates/template-pocket
"use client"

import * as React from "react"
import { Check, Minus } from "lucide-react"

import { compare, faqs, plans } from "@/components/ballmac/templates/pocket/pocket-data"
import { PocketShell, pocketDisplayClass, type PocketHrefs } from "@/components/ballmac/templates/pocket/pocket-theme"
import { cn } from "@/lib/utils"

type PocketPricingProps = React.ComponentProps<"div"> & { hrefs?: Partial<PocketHrefs> }

/** Pricing: a monthly or yearly switch, three plans, a real comparison table and the questions people ask. */
function PocketPricing({ hrefs, ...props }: PocketPricingProps) {
  const link = { download: "/pocket/download", ...hrefs }
  const [yearly, setYearly] = React.useState(true)
  const cell = (v: string | boolean) => (v === true ? <><Check className="mx-auto size-5" aria-hidden="true" /><span className="sr-only">Included</span></> : v === false ? <><Minus className="text-muted-foreground mx-auto size-5" aria-hidden="true" /><span className="sr-only">Not included</span></> : v)
  return (
    <PocketShell page="pricing" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-6xl px-4 pt-14 pb-8 sm:px-6 sm:pt-20">
        <div className="text-center">
          <h1 className={cn("mx-auto max-w-3xl text-[clamp(3rem,9vw,7rem)] leading-[0.9] text-balance", pocketDisplayClass)}>Pay for perks, not for banking.</h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-xl font-medium text-pretty">The Free plan is free forever. Upgrade only when you want the extras.</p>
          <div role="group" aria-label="Billing period" className="bg-secondary mt-8 inline-flex rounded-full p-1">
            {([[false, "Monthly"], [true, "Yearly"]] as const).map(([v, l]) => <button key={l} type="button" aria-pressed={yearly === v} onClick={() => setYearly(v)} className="aria-pressed:bg-primary aria-pressed:text-primary-foreground focus-visible:ring-ring/50 inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-extrabold outline-none focus-visible:ring-[3px]">{l}{v && <span className="bg-chart-1 rounded-full px-2 py-0.5 text-[11px] text-[var(--pocket-on-lime)]">Save 20%</span>}</button>)}
          </div>
        </div>

        <ul className="mt-12 grid gap-4 lg:grid-cols-3">
          {plans.map((p) => {
            const price = yearly ? p.annual : p.monthly
            return (
              <li key={p.id} className={cn("relative flex flex-col rounded-[2rem] border p-8", p.featured ? "bg-primary text-primary-foreground border-transparent lg:-my-4 lg:py-12" : "bg-card")}>
                {p.featured && <span className="bg-chart-1 absolute -top-3 left-8 rounded-full px-3 py-1 text-xs font-extrabold text-[var(--pocket-on-lime)]">Most popular</span>}
                <h2 className={cn("text-2xl", pocketDisplayClass)}>{p.name}</h2>
                <p className="mt-1 text-sm font-medium">{p.blurb}</p>
                <p className="mt-6 flex items-baseline gap-1"><span className={cn("text-6xl leading-none tabular-nums", pocketDisplayClass)}>${price}</span><span className="text-sm font-bold">{price === 0 ? "forever" : "a month"}</span></p>
                <p className="mt-1 min-h-5 text-xs font-semibold">{price > 0 && yearly ? `Billed $${price * 12} a year` : price > 0 ? "Billed monthly" : "No card needed"}</p>
                <ul className="mt-6 grid flex-1 gap-3">{p.features.map((f) => <li key={f} className="flex gap-3 text-sm font-semibold"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{f}</li>)}</ul>
                <a href={link.download} className={cn("focus-visible:ring-ring mt-8 inline-flex h-12 items-center justify-center rounded-full px-6 font-extrabold outline-none focus-visible:ring-[3px]", p.featured ? "bg-card text-card-foreground" : "bg-primary text-primary-foreground")}>{p.monthly === 0 ? "Get Pocket Free" : `Try ${p.name} free for 30 days`}</a>
              </li>
            )
          })}
        </ul>

        <section aria-labelledby="pp-compare" className="mt-24">
          <h2 id="pp-compare" className={cn("text-[clamp(2rem,5vw,3.5rem)] leading-none", pocketDisplayClass)}>Compare plans</h2>
          <div role="region" aria-label="Plan comparison" tabIndex={0} className="focus-visible:ring-ring/50 mt-8 overflow-x-auto rounded-3xl border outline-none focus-visible:ring-[3px]">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-secondary"><tr><th scope="col" className="p-4 font-extrabold">Feature</th>{plans.map((p) => <th key={p.id} scope="col" className="p-4 text-center font-extrabold">{p.name}</th>)}</tr></thead>
              <tbody className="divide-y">{compare.map((r) => <tr key={r[0]}><th scope="row" className="p-4 font-bold">{r[0]}</th>{[r[1], r[2], r[3]].map((v, i) => <td key={i} className="p-4 text-center font-semibold">{cell(v)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="pp-faq" className="mt-24 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <h2 id="pp-faq" className={cn("text-[clamp(2rem,5vw,3.5rem)] leading-none", pocketDisplayClass)}>Questions</h2>
          <div className="divide-y border-y">{faqs.map((f) => <details key={f.q} className="py-5"><summary className="focus-visible:ring-ring/50 cursor-pointer list-none rounded-md text-lg font-extrabold outline-none focus-visible:ring-[3px]">{f.q}</summary><p className="text-muted-foreground mt-3 text-pretty">{f.a}</p></details>)}</div>
        </section>
      </main>
    </PocketShell>
  )
}

export { PocketPricing, type PocketPricingProps }
