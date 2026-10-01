// Ballmac UI: Publication issues page. https://ui.ballmac.com/templates/template-publication
"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { issues } from "@/components/ballmac/templates/publication/publication-data"
import { Newsletter } from "@/components/ballmac/templates/publication/publication-home"
import { MagArt, PublicationShell, pubSerifClass, pubTextClass, type PublicationHrefs } from "@/components/ballmac/templates/publication/publication-theme"
import { cn } from "@/lib/utils"

const plans = [
  { id: "digital", name: "Digital", price: 4, per: "a month", features: ["Every story and archive", "Four issues a year as PDF and ePub", "The Sunday Margin newsletter"] },
  { id: "print", name: "Print & digital", price: 9, per: "a month", features: ["Everything in Digital", "Four printed issues, posted free worldwide", "Back-issue discount of 30%"], featured: true },
]

type PublicationIssuesProps = React.ComponentProps<"div"> & { hrefs?: Partial<PublicationHrefs> }

/** The Publication issues page: a shelf of covers by season, two subscription plans with monthly or yearly billing, and the newsletter. */
function PublicationIssues({ hrefs, ...props }: PublicationIssuesProps) {
  const [yearly, setYearly] = React.useState(true)
  return (
    <PublicationShell page="issues" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        <p className="text-chart-1 text-xs font-bold tracking-[0.14em] uppercase">The magazine</p>
        <h1 className={cn("mt-2 text-[clamp(3rem,8vw,6rem)] leading-none", pubSerifClass)}>Issues</h1>
        <p className={cn("text-muted-foreground mt-4 max-w-xl text-xl text-pretty", pubTextClass)}>Four times a year, one theme, 160 pages. Printed on uncoated paper and meant to be kept.</p>

        <section aria-label="Back issues" className="mt-12">
          <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {issues.map((i) => (
              <li key={i.n}>
                <a href="#" className="group focus-visible:ring-ring/50 block rounded outline-none focus-visible:ring-[3px]">
                  <div className="relative shadow-[6px_6px_0_0_var(--border)] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
                    <MagArt variant={i.art} className="aspect-[3/4]" />
                    <div className="bg-card/95 absolute inset-x-0 bottom-0 border-t p-3"><p className={cn("text-xl leading-none", pubSerifClass)}>{i.theme}</p><p className="text-muted-foreground mt-1 text-[11px] tracking-wide uppercase">No. {i.n}</p></div>
                  </div>
                  <p className="text-muted-foreground mt-3 text-sm">{i.season}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="pub-sub" className="mt-24">
          <div className="text-center">
            <h2 id="pub-sub" className={cn("text-4xl sm:text-5xl", pubSerifClass)}>Read without the noise</h2>
            <div role="group" aria-label="Billing" className="mt-6 inline-flex rounded-full border p-1">
              {([[true, "Yearly · 2 months free"], [false, "Monthly"]] as const).map(([v, l]) => <button key={l} type="button" aria-pressed={yearly === v} onClick={() => setYearly(v)} className={cn("focus-visible:ring-ring/50 h-10 rounded-full px-5 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px]", yearly === v ? "bg-foreground text-background" : "text-muted-foreground")}>{l}</button>)}
            </div>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-2">
            {plans.map((p) => {
              const price = yearly ? Math.round(p.price * 10) : p.price
              return (
                <article key={p.id} className={cn("flex flex-col border-2 p-8", "featured" in p && p.featured ? "border-chart-1 bg-card" : "border-foreground")}>
                  <h3 className={cn("text-3xl", pubSerifClass)}>{p.name}</h3>
                  <p className="mt-4 flex items-baseline gap-2"><span className={cn("text-6xl tabular-nums", pubSerifClass)}>${price}</span><span className="text-muted-foreground text-sm">{yearly ? "a year" : p.per}</span></p>
                  <ul className="mt-6 flex-1 space-y-3">{p.features.map((f) => <li key={f} className={cn("flex items-start gap-3 text-pretty", pubTextClass)}><Check className="text-chart-4 mt-1.5 size-4 shrink-0" aria-hidden="true" />{f}</li>)}</ul>
                  <a href="#" className={cn("focus-visible:ring-ring/50 mt-8 inline-flex h-12 items-center justify-center rounded-sm text-sm font-bold tracking-wide uppercase outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]", "featured" in p && p.featured ? "bg-chart-1 text-primary-foreground" : "bg-foreground text-background")}>Subscribe</a>
                </article>
              )
            })}
          </div>
        </section>
        <div className="mt-20"><Newsletter /></div>
      </main>
    </PublicationShell>
  )
}

export { PublicationIssues, type PublicationIssuesProps }
