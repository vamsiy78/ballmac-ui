// Ballmac UI: Northwind about page. https://ui.ballmac.com/templates/template-northwind
import * as React from "react"

import { NorthwindHeading, NorthwindShell, type NorthwindHrefs } from "@/components/ballmac/templates/northwind/northwind-theme"
import { cn } from "@/lib/utils"

const serif = "[font-family:var(--northwind-serif),ui-serif,Georgia,serif]"

const values = [
  { title: "Plain beats clever", text: "If a customer needs a manual to use a feature, we haven’t finished it." },
  { title: "Money is personal", text: "Behind every transaction is someone trying to do their job. We design for them first." },
  { title: "Boring is a feature", text: "Finance software should be dependable enough to forget about. We aim to be forgotten." },
]

const timeline = [
  ["2019", "Two former controllers start Northwind in a spare bedroom in Portland."],
  ["2021", "First 100 customers, and our first real month-end close with no spreadsheets."],
  ["2023", "Launch bill pay and reimbursements. Reach $1B in annual spend managed."],
  ["2025", "Open offices in Toronto and London. 1,000 customers across 14 countries."],
  ["2026", "Today: 1,400 finance teams, 140 people, still answering email ourselves."],
]

const team = [
  ["Ines Alvarado", "Co-founder, CEO", "bg-chart-1/25"], ["Tobias Wren", "Co-founder, CTO", "bg-chart-2/25"], ["Amara Nwosu", "VP Finance", "bg-chart-5/25"],
  ["Jonas Eklund", "Head of Design", "bg-chart-4/25"], ["Mei Tanaka", "Head of Security", "bg-chart-3/30"], ["Colm Brennan", "Head of Support", "bg-chart-1/25"],
] as const

type NorthwindAboutProps = React.ComponentProps<"div"> & { hrefs?: Partial<NorthwindHrefs> }

/** Northwind about: a long-form mission, values, a timeline and the team. */
function NorthwindAbout({ hrefs, ...props }: NorthwindAboutProps) {
  return (
    <NorthwindShell page="about" hrefs={hrefs} {...props}>
      <main>
        <section className="mx-auto max-w-4xl px-4 pt-16 sm:px-6 sm:pt-24">
          <p className="text-chart-2 text-sm font-semibold tracking-wide uppercase">About</p>
          <NorthwindHeading as="h1" className="mt-4 text-5xl leading-[1.04] sm:text-7xl">We think finance should feel <em>quiet</em>.</NorthwindHeading>
          <div className="text-muted-foreground mt-10 space-y-6 text-xl leading-relaxed text-pretty">
            <p>Northwind began with a frustration. We had both run finance teams, and we had both spent the last week of every month chasing people for receipts that were, somewhere, already in an inbox.</p>
            <p>The tools we used treated spending as a problem to police. We wanted the opposite: software that makes it easy for people to do the right thing, and shows finance what happened without asking.</p>
            <p className={cn("text-foreground text-3xl leading-snug", serif)}>The best month-end is the one you barely notice.</p>
          </div>
        </section>

        <section aria-labelledby="nw-values" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <NorthwindHeading id="nw-values" className="text-3xl sm:text-5xl">What we believe</NorthwindHeading>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {values.map((v, i) => (
              <li key={v.title} className="border-t-2 border-current pt-5">
                <span className={cn("text-chart-2 text-5xl", serif)}>{i + 1}</span>
                <h3 className="mt-4 text-xl font-semibold">{v.title}</h3>
                <p className="text-muted-foreground mt-2 text-pretty">{v.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="nw-history" className="bg-surface border-y">
          <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
            <NorthwindHeading id="nw-history" className="text-3xl sm:text-5xl">Seven years, briefly</NorthwindHeading>
            <ol className="mt-10 divide-y">
              {timeline.map(([y, t]) => (
                <li key={y} className="grid gap-2 py-6 sm:grid-cols-[7rem_1fr] sm:gap-8"><span className={cn("text-chart-2 text-3xl", serif)}>{y}</span><p className="text-lg text-pretty">{t}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="nw-team" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <NorthwindHeading id="nw-team" className="text-3xl sm:text-5xl">The people</NorthwindHeading>
          <ul className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3">
            {team.map(([n, r, t]) => (
              <li key={n}>
                <div className={cn("flex aspect-[4/3] items-end rounded-2xl p-5", t)} aria-hidden="true"><span className={cn("text-5xl tracking-tight", serif)}>{n.split(" ").map((w) => w[0]).join("")}</span></div>
                <h3 className="mt-3 font-semibold">{n}</h3>
                <p className="text-muted-foreground text-sm">{r}</p>
              </li>
            ))}
          </ul>
          <div className="bg-primary text-primary-foreground mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl p-8 sm:flex-row sm:items-center sm:p-12">
            <div><p className={cn("text-3xl sm:text-4xl", serif)}>We’re hiring in Portland, Toronto and London.</p><p className="mt-2 opacity-80">14 open roles across engineering, design and support.</p></div>
            <a href="#" className="bg-primary-foreground text-primary focus-visible:ring-ring inline-flex h-12 shrink-0 items-center rounded-full px-6 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">See open roles</a>
          </div>
        </section>
      </main>
    </NorthwindShell>
  )
}

export { NorthwindAbout, type NorthwindAboutProps }
