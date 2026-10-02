// Ballmac UI: Portfolio work page. https://ui.ballmac.com/templates/template-portfolio
"use client"

import * as React from "react"
import { ArrowUpRight } from "lucide-react"

import { projects } from "@/components/ballmac/templates/portfolio/portfolio-data"
import { Cover, PortfolioShell, type PortfolioHrefs } from "@/components/ballmac/templates/portfolio/portfolio-theme"
import { cn } from "@/lib/utils"

type Filter = "All" | "Product" | "Brand" | "Systems"
const filters: Filter[] = ["All", "Product", "Systems", "Brand"]

type PortfolioWorkProps = React.ComponentProps<"div"> & { hrefs?: Partial<PortfolioHrefs> }

/** The Portfolio work page: every project, filtered by discipline, in a staggered grid with a result on hover. */
function PortfolioWork({ hrefs, ...props }: PortfolioWorkProps) {
  const [filter, setFilter] = React.useState<Filter>("All")
  const shown = projects.filter((p) => filter === "All" || p.discipline === filter)
  const caseHref = hrefs?.case ?? "/portfolio/work/fernhill"
  return (
    <PortfolioShell page="work" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-7xl px-4 pt-14 sm:px-8 sm:pt-20">
        <p className="text-muted-foreground text-sm" style={{ fontFamily: "var(--portfolio-mono)" }}>Work · 2023 to 2026</p>
        <h1 className="mt-4 max-w-4xl text-[clamp(2.6rem,7vw,6rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">Six projects I’m proud of, and what they changed.</h1>
        <div role="group" aria-label="Filter by discipline" className="mt-10 flex flex-wrap gap-2">
          {filters.map((f) => {
            const n = f === "All" ? projects.length : projects.filter((p) => p.discipline === f).length
            return (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cn("focus-visible:ring-ring/50 h-11 rounded-full border px-5 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px]", filter === f ? "bg-foreground text-background border-transparent" : "hover:bg-accent")}>
                {f} <span className={cn("ms-1 tabular-nums", filter === f ? "opacity-70" : "text-muted-foreground")}>{n}</span>
              </button>
            )
          })}
        </div>
        <p className="sr-only" role="status">{shown.length} projects shown</p>
        <ul className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.slug}>
              <a href={caseHref} className="group focus-visible:ring-ring/50 block rounded-3xl outline-none focus-visible:ring-[3px] focus-visible:ring-offset-4 focus-visible:ring-offset-background">
                <div className="relative overflow-hidden rounded-3xl border">
                  <Cover variant={p.cover} className="transition-transform duration-700 group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none" />
                  <span className="bg-chart-1 text-[var(--portfolio-on-accent)] absolute end-3 bottom-3 inline-flex translate-y-2 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none">{p.result}<ArrowUpRight className="size-3.5 rtl:-scale-x-100" aria-hidden="true" /></span>
                </div>
                <div className="mt-4">
                  <p className="text-muted-foreground text-xs" style={{ fontFamily: "var(--portfolio-mono)" }}>{p.client} · {p.year} · {p.discipline}</p>
                  <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.025em] text-balance">{p.title}</h2>
                  <p className="text-muted-foreground mt-1 text-sm text-pretty">{p.blurb}</p>
                  <p className="sr-only">Result: {p.result}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </PortfolioShell>
  )
}

export { PortfolioWork, type PortfolioWorkProps }
