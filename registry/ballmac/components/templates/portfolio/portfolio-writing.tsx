// Ballmac UI: Portfolio writing page. https://ui.ballmac.com/templates/template-portfolio
"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { posts } from "@/components/ballmac/templates/portfolio/portfolio-data"
import { PortfolioShell, type PortfolioHrefs } from "@/components/ballmac/templates/portfolio/portfolio-theme"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--portfolio-mono)" } as const
type Tag = "All" | "Process" | "Craft" | "Career"
const tags: Tag[] = ["All", "Process", "Craft", "Career"]
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

type PortfolioWritingProps = React.ComponentProps<"div"> & { hrefs?: Partial<PortfolioHrefs> }

/** The Portfolio writing page: posts grouped by year, with a topic filter, a search and the reading time of each. */
function PortfolioWriting({ hrefs, ...props }: PortfolioWritingProps) {
  const [tag, setTag] = React.useState<Tag>("All")
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const shown = posts.filter((p) => (tag === "All" || p.tag === tag) && (!q || (p.title + p.excerpt).toLowerCase().includes(q)))
  const years = [...new Set(shown.map((p) => p.date.slice(0, 4)))]
  return (
    <PortfolioShell page="writing" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-5xl px-4 pt-14 sm:px-8 sm:pt-20">
        <p className="text-muted-foreground text-sm" style={mono}>Writing</p>
        <h1 className="mt-4 text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">Notes on making things people use.</h1>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Filter by topic" className="flex flex-wrap gap-2">
            {tags.map((t) => <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(t)} className={cn("focus-visible:ring-ring/50 h-10 rounded-full border px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px]", tag === t ? "bg-foreground text-background border-transparent" : "hover:bg-accent")}>{t}</button>)}
          </div>
          <div className="relative w-full sm:ms-auto sm:w-64">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-3.5 size-4 -translate-y-1/2" aria-hidden="true" />
            <input type="search" aria-label="Search posts" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts" className="bg-card focus-visible:ring-ring/50 placeholder:text-muted-foreground h-10 w-full rounded-full border pe-4 ps-10 text-sm outline-none focus-visible:ring-[3px]" />
          </div>
        </div>
        <p className="sr-only" role="status">{shown.length} posts</p>
        {years.length === 0 && <p className="text-muted-foreground mt-16 rounded-3xl border border-dashed p-12 text-center">No posts match. Try another topic.</p>}
        {years.map((y) => (
          <section key={y} aria-labelledby={`pw-${y}`} className="mt-14 grid gap-4 sm:grid-cols-[8rem_1fr]">
            <h2 id={`pw-${y}`} className="text-muted-foreground text-sm" style={mono}>{y}</h2>
            <ul className="divide-y border-y">
              {shown.filter((p) => p.date.startsWith(y)).map((p) => (
                <li key={p.slug}>
                  <a href="#" className="hover:bg-accent/60 focus-visible:ring-ring/50 -mx-3 block rounded-2xl px-3 py-6 outline-none transition-colors focus-visible:ring-[3px]">
                    <p className="text-muted-foreground text-xs" style={mono}>{dateFmt.format(new Date(p.date))} · {p.tag} · {p.read} min</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-balance">{p.title}</h3>
                    <p className="text-muted-foreground mt-1.5 text-pretty">{p.excerpt}</p>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </PortfolioShell>
  )
}

export { PortfolioWriting, type PortfolioWritingProps }
