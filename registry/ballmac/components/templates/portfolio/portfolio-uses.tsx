// Ballmac UI: Portfolio uses page. https://ui.ballmac.com/templates/template-portfolio
import * as React from "react"

import { uses } from "@/components/ballmac/templates/portfolio/portfolio-data"
import { PortfolioShell, type PortfolioHrefs } from "@/components/ballmac/templates/portfolio/portfolio-theme"

const mono = { fontFamily: "var(--portfolio-mono)" } as const

type PortfolioUsesProps = React.ComponentProps<"div"> & { hrefs?: Partial<PortfolioHrefs> }

/** The Portfolio uses page: the tools, hardware and books behind the work, in plain lists. */
function PortfolioUses({ hrefs, ...props }: PortfolioUsesProps) {
  return (
    <PortfolioShell page="uses" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-5xl px-4 pt-14 sm:px-8 sm:pt-20">
        <p className="text-muted-foreground text-sm" style={mono}>Uses · updated September 2026</p>
        <h1 className="mt-4 text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">What’s on my desk, and why.</h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg text-pretty">People ask. Nothing here is sponsored, and most of it is older than it should be.</p>
        <div className="mt-16 space-y-16">
          {uses.map((g) => (
            <section key={g.group} aria-labelledby={`pu-${g.group}`} className="grid gap-6 sm:grid-cols-[10rem_1fr]">
              <h2 id={`pu-${g.group}`} className="text-2xl font-semibold tracking-[-0.03em]">{g.group}</h2>
              <ul className="divide-y border-y">
                {g.items.map((i) => (
                  <li key={i.name} className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
                    <span className="font-semibold">{i.name}</span>
                    <span className="text-muted-foreground text-pretty">{i.note}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </PortfolioShell>
  )
}

export { PortfolioUses, type PortfolioUsesProps }
