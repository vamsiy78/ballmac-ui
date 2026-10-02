// Ballmac UI: Portfolio case study page. https://ui.ballmac.com/templates/template-portfolio
"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"

import { TableOfContents } from "@/components/ballmac/table-of-contents"
import { projects } from "@/components/ballmac/templates/portfolio/portfolio-data"
import { Cover, PortfolioShell, type PortfolioHrefs } from "@/components/ballmac/templates/portfolio/portfolio-theme"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--portfolio-mono)" } as const
const h2 = "scroll-mt-24 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl"
const body = "text-muted-foreground mt-5 max-w-2xl text-lg leading-relaxed text-pretty"

const meta = [
  ["Role", "Lead product designer"],
  ["Team", "2 designers, 5 engineers, 1 PM"],
  ["Timeline", "14 weeks, Mar to Jun 2026"],
  ["Tools", "Figma, Linear, Maze, Framer"],
]

const process = [
  ["Week 1–2", "Listen", "Watched 14 new teams try to get started. Nine gave up before inviting a colleague."],
  ["Week 3–5", "Frame", "Reduced the goal to one sentence: send your first invoice in one sitting."],
  ["Week 6–10", "Build and test", "Four prototypes, 22 tests. We cut the setup from nine steps to three."],
  ["Week 11–14", "Ship and measure", "Rolled out behind a flag to 10, then 50, then 100 percent of new signups."],
]

const results = [["+34%", "of new teams activate in their first week"], ["−58%", "time to first invoice"], ["9 → 3", "setup steps"], ["4.7", "onboarding satisfaction, up from 3.9"]]

type PortfolioCaseProps = React.ComponentProps<"div"> & { hrefs?: Partial<PortfolioHrefs> }

/** The Portfolio case study: a sticky fact sheet, a contents list that follows your reading, the process as a timeline and results in big numbers. */
function PortfolioCase({ hrefs, ...props }: PortfolioCaseProps) {
  const next = projects[1]
  return (
    <PortfolioShell page="case" hrefs={hrefs} {...props}>
      <main>
        <header className="mx-auto max-w-7xl px-4 pt-14 sm:px-8 sm:pt-20">
          <p className="text-muted-foreground text-sm" style={mono}><a href={hrefs?.work ?? "/portfolio/work"} className="underline-offset-4 hover:underline">Work</a> / Fernhill</p>
          <h1 className="mt-4 max-w-5xl text-[clamp(2.6rem,7.4vw,6.5rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">Rebuilding onboarding so teams reach their first invoice in one sitting.</h1>
          <Cover variant={0} className="mt-12 aspect-[16/8] rounded-3xl border" />
        </header>

        <div className="mx-auto mt-16 grid max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_14rem]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <dl className="space-y-5">
              {meta.map(([k, v]) => <div key={k}><dt className="text-muted-foreground text-xs" style={mono}>{k}</dt><dd className="mt-1 text-sm font-medium text-pretty">{v}</dd></div>)}
            </dl>
          </aside>

          <article className="min-w-0 space-y-20">
            <section aria-labelledby="overview">
              <h2 id="overview" className={h2}>Overview</h2>
              <p className={body}>Fernhill is invoicing software for small studios. It was good at the second month and bad at the first day: almost half of new teams never sent an invoice. I led a 14-week rebuild of the first-run experience.</p>
            </section>
            <section aria-labelledby="problem">
              <h2 id="problem" className={h2}>The problem</h2>
              <p className={body}>The old flow asked for nine things before it showed any value: company details, tax settings, a logo, bank info, a template, a first customer. Every step was reasonable. Together they were a wall.</p>
              <blockquote className="bg-chart-1 text-[var(--portfolio-on-accent)] mt-8 max-w-2xl rounded-3xl p-8 text-2xl leading-snug font-semibold tracking-[-0.025em] text-balance">“I just wanted to send one invoice. I closed the tab at step six.”<footer className="mt-4 text-sm font-medium opacity-75" style={mono}>Participant 7, studio owner</footer></blockquote>
            </section>
            <section aria-labelledby="process">
              <h2 id="process" className={h2}>Process</h2>
              <ol className="mt-8 divide-y border-y">
                {process.map(([when, title, text]) => (
                  <li key={title} className="grid gap-2 py-6 sm:grid-cols-[8rem_10rem_1fr] sm:gap-6">
                    <span className="text-muted-foreground text-sm" style={mono}>{when}</span>
                    <span className="text-xl font-semibold tracking-[-0.02em]">{title}</span>
                    <span className="text-muted-foreground text-pretty">{text}</span>
                  </li>
                ))}
              </ol>
            </section>
            <section aria-labelledby="solution">
              <h2 id="solution" className={h2}>The solution</h2>
              <p className={body}>One screen asks the only question that matters: who are you invoicing? Everything else is a default you can change later, and the first invoice is a draft by the time you finish typing the customer’s name.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2"><Cover variant={4} className="rounded-3xl border" /><Cover variant={3} className="rounded-3xl border" /></div>
            </section>
            <section aria-labelledby="results">
              <h2 id="results" className={h2}>Results</h2>
              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                {results.map(([v, l], i) => (
                  <div key={l} className={cn("rounded-3xl p-7", i === 0 ? "bg-chart-1 text-[var(--portfolio-on-accent)]" : "bg-secondary")}>
                    <dd className="text-6xl font-semibold tracking-[-0.05em] tabular-nums">{v}</dd>
                    <dt className={cn("mt-2 text-pretty", i === 0 ? "opacity-80" : "text-muted-foreground")}>{l}</dt>
                  </div>
                ))}
              </dl>
            </section>
            <section aria-labelledby="reflection">
              <h2 id="reflection" className={h2}>What I’d do differently</h2>
              <p className={body}>I would have involved sales earlier. They knew which questions prospects asked on day one, and two of them became default answers we had to bolt on after launch.</p>
            </section>
          </article>

          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <TableOfContents title="On this page" offset={96} items={[{ id: "overview", title: "Overview" }, { id: "problem", title: "The problem" }, { id: "process", title: "Process" }, { id: "solution", title: "The solution" }, { id: "results", title: "Results" }, { id: "reflection", title: "Reflection" }]} />
            </div>
          </aside>
        </div>

        <section aria-label="Next project" className="mx-auto mt-24 max-w-7xl px-4 sm:px-8">
          <a href={hrefs?.case ?? "/portfolio/work/lumen"} className="group bg-foreground text-background focus-visible:ring-ring/50 grid items-center gap-8 overflow-hidden rounded-3xl p-6 outline-none focus-visible:ring-[3px] focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:grid-cols-[1fr_20rem] sm:p-10">
            <div><p className="text-sm opacity-60" style={mono}>Next project</p><p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl">{next.title}</p><p className="mt-5 inline-flex items-center gap-2 font-semibold">{next.client}<ArrowRight className="size-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" /></p></div>
            <Cover variant={next.cover} className="rounded-2xl" />
          </a>
        </section>
      </main>
    </PortfolioShell>
  )
}

export { PortfolioCase, type PortfolioCaseProps }
