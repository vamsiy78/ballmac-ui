// Ballmac UI: Northwind customers page. https://ui.ballmac.com/templates/template-northwind
import * as React from "react"
import { ArrowUpRight } from "lucide-react"

import { NorthwindHeading, NorthwindShell, type NorthwindHrefs } from "@/components/ballmac/templates/northwind/northwind-theme"
import { cn } from "@/lib/utils"

const serif = "[font-family:var(--northwind-serif),ui-serif,Georgia,serif]"

const stories = [
  { name: "Fernhill", sector: "Architecture", stat: "70%", note: "less time chasing receipts", quote: "Our partners finally see project costs while the project is still running.", tone: "bg-chart-1/15" },
  { name: "Oakline", sector: "Logistics", stat: "$310k", note: "saved on duplicate vendors", quote: "We found three vendors we paid under different names within a week.", tone: "bg-chart-2/15" },
  { name: "Tidewater", sector: "Hospitality", stat: "11 days → 4", note: "month-end close", quote: "Eighteen restaurants, one close process. It used to be eighteen.", tone: "bg-chart-5/15" },
  { name: "Marlow Co", sector: "Consumer goods", stat: "4.9 / 5", note: "employee card satisfaction", quote: "Nobody has asked to expense a personal card in a year.", tone: "bg-chart-4/15" },
  { name: "Brightwell", sector: "Healthcare", stat: "100%", note: "audit-ready receipts", quote: "Our auditors asked what we changed. We told them: everything.", tone: "bg-chart-3/20" },
  { name: "Quill & Co", sector: "Publishing", stat: "2 hrs", note: "to onboard 60 people", quote: "Cards for the whole company were live before lunch.", tone: "bg-chart-1/15" },
]

type NorthwindCustomersProps = React.ComponentProps<"div"> & { hrefs?: Partial<NorthwindHrefs> }

/** Northwind customers: a featured case study with results, then a grid of shorter stories. */
function NorthwindCustomers({ hrefs, ...props }: NorthwindCustomersProps) {
  return (
    <NorthwindShell page="customers" hrefs={hrefs} {...props}>
      <main>
        <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
          <p className="text-chart-2 text-sm font-semibold tracking-wide uppercase">Customers</p>
          <NorthwindHeading as="h1" className="mt-4 max-w-4xl text-5xl leading-[1.04] sm:text-7xl">Finance teams that got their <em>weekends</em> back.</NorthwindHeading>
        </section>

        <section aria-labelledby="nw-featured" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <article className="bg-primary text-primary-foreground grid overflow-hidden rounded-3xl lg:grid-cols-[1.1fr_1fr]">
            <div className="p-8 sm:p-12">
              <p className="text-sm font-semibold opacity-70">Case study · Professional services</p>
              <h2 id="nw-featured" className={cn("mt-4 text-4xl leading-tight tracking-[-0.02em] text-balance sm:text-5xl", serif)}>Harlow &amp; Pine closes the books in three days, not nine.</h2>
              <p className="mt-5 max-w-lg text-lg opacity-85 text-pretty">A 340-person consultancy replaced spreadsheets, a shared inbox and four card programs with one system finance trusts.</p>
              <a href="#" className="bg-primary-foreground text-primary focus-visible:ring-ring mt-8 inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Read the story <ArrowUpRight className="size-4" aria-hidden="true" /></a>
            </div>
            <dl className="grid grid-cols-2 border-t border-current/20 lg:border-t-0 lg:border-l">
              {[["9 → 3", "days to close"], ["97%", "receipts matched"], ["$1.2M", "cash found in dormant subscriptions"], ["340", "employees, live in 2 weeks"]].map(([v, l], i) => (
                <div key={l} className={cn("flex flex-col justify-end p-6 sm:p-8", i % 2 === 0 && "border-r border-current/20", i < 2 && "border-b border-current/20")}>
                  <dd className={cn("text-4xl tracking-[-0.03em] sm:text-5xl", serif)}>{v}</dd>
                  <dt className="mt-2 text-sm opacity-75">{l}</dt>
                </div>
              ))}
            </dl>
          </article>
        </section>

        <section aria-labelledby="nw-more" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <NorthwindHeading id="nw-more" className="text-3xl sm:text-4xl">More stories</NorthwindHeading>
          <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((s) => (
              <li key={s.name} className="bg-card flex flex-col rounded-2xl border p-7">
                <div className="flex items-center gap-3">
                  <span className={cn("flex size-10 items-center justify-center rounded-full text-sm font-semibold", s.tone)} aria-hidden="true">{s.name[0]}</span>
                  <div><h3 className="font-semibold">{s.name}</h3><p className="text-muted-foreground text-xs">{s.sector}</p></div>
                </div>
                <p className={cn("mt-6 text-5xl tracking-[-0.03em]", serif)}>{s.stat}</p>
                <p className="text-muted-foreground mt-1 text-sm">{s.note}</p>
                <blockquote className="mt-6 flex-1 border-t pt-5 text-[15px] text-pretty">“{s.quote}”</blockquote>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </NorthwindShell>
  )
}

export { NorthwindCustomers, type NorthwindCustomersProps }
