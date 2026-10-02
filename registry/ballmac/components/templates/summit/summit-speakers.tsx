// Ballmac UI: Summit speakers page. https://ui.ballmac.com/templates/template-summit
"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ballmac/dialog"
import { sessions, speakers, tracks, type Speaker } from "@/components/ballmac/templates/summit/summit-data"
import { Portrait, SummitShell, summitDisplayClass, type SummitHrefs } from "@/components/ballmac/templates/summit/summit-theme"
import { cn } from "@/lib/utils"

const filters = ["All", ...tracks] as const

type SummitSpeakersProps = React.ComponentProps<"div"> & { hrefs?: Partial<SummitHrefs> }

/** The speakers page: filter by track or search by name, open a bio with the talk and the time it happens. */
function SummitSpeakers({ hrefs, ...props }: SummitSpeakersProps) {
  const [filter, setFilter] = React.useState<(typeof filters)[number]>("All")
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState<Speaker | null>(null)
  const q = query.trim().toLowerCase()
  const list = speakers.filter((s) => (filter === "All" || s.track === filter) && (!q || `${s.name} ${s.company} ${s.talk} ${s.role}`.toLowerCase().includes(q)))
  const session = open ? sessions.find((s) => s.speaker === open.id) : null
  return (
    <SummitShell page="speakers" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
        <h1 className={cn("text-[clamp(2.8rem,9vw,7rem)] leading-[0.95]", summitDisplayClass)}>Speakers</h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-xl text-pretty">Twelve people who have spent years on one hard question. Each gets forty-five minutes and no slides they did not make.</p>
        <div className="mt-10 flex flex-wrap items-center gap-3 border-y py-4">
          <div className="relative min-w-52 flex-1 sm:max-w-xs">
            <label htmlFor="sp-q" className="sr-only">Search speakers</label>
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-4 size-4 -translate-y-1/2" aria-hidden="true" />
            <input id="sp-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search speakers or talks" className="bg-card focus-visible:ring-ring/50 h-11 w-full rounded-full border pe-4 ps-10 text-sm outline-none focus-visible:ring-[3px]" />
          </div>
          <div role="group" aria-label="Filter by track" className="flex flex-wrap gap-2">
            {filters.map((f) => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className="hover:bg-accent focus-visible:ring-ring/50 aria-pressed:bg-primary aria-pressed:text-primary-foreground h-11 rounded-full border px-5 text-sm font-semibold outline-none focus-visible:ring-[3px]">{f}</button>)}
          </div>
        </div>
        <p role="status" className="text-muted-foreground mt-4 text-sm">{list.length} {list.length === 1 ? "speaker" : "speakers"}</p>
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {list.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => setOpen(s)} aria-haspopup="dialog" className="focus-visible:ring-ring/50 group block w-full rounded-3xl text-start outline-none focus-visible:ring-[3px]">
                <Portrait speaker={s} className="rounded-3xl transition-transform group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0" />
                <span className="mt-4 block text-lg font-bold">{s.name}</span>
                <span className="text-muted-foreground block text-sm">{s.role}, {s.company}</span>
                <span className="mt-2 block text-sm font-semibold text-pretty">“{s.talk}”</span>
              </button>
            </li>
          ))}
        </ul>
        {list.length === 0 && <div className="bg-surface mt-4 rounded-3xl border p-12 text-center"><p className={cn("text-2xl", summitDisplayClass)}>No one by that name.</p><button type="button" onClick={() => { setQuery(""); setFilter("All") }} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mt-5 h-11 rounded-full px-6 font-bold outline-none focus-visible:ring-[3px]">Show everyone</button></div>}
      </main>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="summit-theme bg-background max-w-2xl gap-0 overflow-hidden p-0">
          {open && (
            <div className="grid sm:grid-cols-[14rem_minmax(0,1fr)]">
              <Portrait speaker={open} className="aspect-[4/3] sm:aspect-auto sm:h-full" />
              <div className="p-6 sm:p-8">
                <DialogHeader className="text-start"><DialogTitle className={cn("text-2xl", summitDisplayClass)}>{open.name}</DialogTitle><DialogDescription>{open.role}, {open.company}</DialogDescription></DialogHeader>
                <p className="mt-4 text-pretty">{open.bio}</p>
                {session && (
                  <div className="bg-surface mt-6 rounded-2xl border p-4">
                    <p className="text-muted-foreground text-xs font-bold tracking-[0.14em] uppercase">Talk</p>
                    <p className="mt-1 font-bold">{session.title}</p>
                    <p className="text-muted-foreground mt-1 text-sm">Day {session.day} · {session.start} · {session.room}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SummitShell>
  )
}

export { SummitSpeakers, type SummitSpeakersProps }
