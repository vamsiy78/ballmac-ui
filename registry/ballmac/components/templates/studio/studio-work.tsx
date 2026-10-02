// Ballmac UI: Studio work page. https://ui.ballmac.com/templates/template-studio
"use client"

import * as React from "react"
import { LayoutGrid, List } from "lucide-react"

import { projects } from "@/components/ballmac/templates/studio/studio-data"
import { StudioArt, StudioShell, studioDisplay, type StudioHrefs } from "@/components/ballmac/templates/studio/studio-theme"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--studio-mono)" } as const
type Filter = "All" | "Brand" | "Digital" | "Campaign"
const filters: Filter[] = ["All", "Brand", "Digital", "Campaign"]

type StudioWorkProps = React.ComponentProps<"div"> & { hrefs?: Partial<StudioHrefs> }

/** The Studio work index: every project as a table or a poster grid, filtered by discipline. */
function StudioWork({ hrefs, ...props }: StudioWorkProps) {
  const [filter, setFilter] = React.useState<Filter>("All")
  const [view, setView] = React.useState<"list" | "grid">("grid")
  const shown = projects.filter((p) => filter === "All" || p.discipline === filter)
  const href = hrefs?.project ?? "/studio/work/north-coast"
  return (
    <StudioShell page="work" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-[100rem] px-4 pt-10 sm:px-8 sm:pt-16">
        <h1 className={cn("text-[clamp(3rem,13vw,13rem)]", studioDisplay)}>Work <span className="text-muted-foreground text-[0.22em] align-top tabular-nums" style={mono}>({shown.length})</span></h1>
        <div className="mt-10 flex flex-wrap items-center gap-3 border-y-2 py-4">
          <div role="group" aria-label="Filter by discipline" className="flex flex-wrap gap-2">
            {filters.map((f) => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cn("focus-visible:ring-ring/50 h-11 rounded-full border-2 border-current px-5 text-sm font-bold tracking-wide uppercase outline-none transition-colors focus-visible:ring-[3px]", filter === f ? "bg-foreground text-background" : "hover:bg-chart-1 hover:text-[var(--studio-on-accent)]")}>{f}</button>)}
          </div>
          <div role="group" aria-label="Layout" className="ms-auto flex gap-1">
            {([["grid", LayoutGrid, "Grid"], ["list", List, "List"]] as const).map(([v, Icon, l]) => <button key={v} type="button" aria-pressed={view === v} aria-label={`${l} view`} onClick={() => setView(v)} className={cn("focus-visible:ring-ring/50 inline-flex size-11 items-center justify-center rounded-full border-2 outline-none focus-visible:ring-[3px]", view === v ? "bg-foreground text-background border-transparent" : "hover:bg-accent border-current")}><Icon className="size-4" aria-hidden="true" /></button>)}
          </div>
        </div>
        <p className="sr-only" role="status">{shown.length} projects shown</p>
        {view === "grid" ? (
          <ul className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <li key={p.slug}>
                <a href={href} className="group focus-visible:ring-ring/50 block outline-none focus-visible:ring-[3px] focus-visible:ring-offset-4 focus-visible:ring-offset-background">
                  <div className="border-foreground overflow-hidden border-2"><StudioArt variant={p.art} className="transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none" /></div>
                  <div className="mt-4 flex items-baseline justify-between gap-3"><h2 className={cn("text-3xl group-hover:underline decoration-chart-1 decoration-4 underline-offset-4", studioDisplay)}>{p.name}</h2><span className="text-muted-foreground text-sm tabular-nums" style={mono}>{p.year}</span></div>
                  <p className="text-muted-foreground mt-1 text-sm" style={mono}>{p.discipline} · {p.line}</p>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-start">
              <caption className="sr-only">All projects</caption>
              <thead><tr className="text-muted-foreground border-b text-xs uppercase" style={mono}><th scope="col" className="py-3 font-normal">Project</th><th scope="col" className="py-3 font-normal">Discipline</th><th scope="col" className="py-3 font-normal">Client</th><th scope="col" className="py-3 text-end font-normal">Year</th></tr></thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.slug} className="hover:bg-chart-1 hover:text-[var(--studio-on-accent)] border-b transition-colors motion-reduce:transition-none">
                    <th scope="row" className="py-5 pe-4"><a href={href} className={cn("focus-visible:ring-ring/50 rounded text-2xl outline-none focus-visible:ring-[3px] sm:text-4xl", studioDisplay)}>{p.name}</a></th>
                    <td className="py-5 text-sm" style={mono}>{p.discipline}</td>
                    <td className="py-5 text-sm" style={mono}>{p.client}</td>
                    <td className="py-5 text-end text-sm tabular-nums" style={mono}>{p.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </StudioShell>
  )
}

export { StudioWork, type StudioWorkProps }
