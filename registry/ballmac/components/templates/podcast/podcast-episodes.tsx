// Ballmac UI: Podcast episodes page. https://ui.ballmac.com/templates/template-podcast
"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { episodes, formatDate, minutes } from "@/components/ballmac/templates/podcast/podcast-data"
import { PlayButton } from "@/components/ballmac/templates/podcast/podcast-home"
import { PodcastShell, ShowArt, podcastDisplayClass, type PodcastHrefs } from "@/components/ballmac/templates/podcast/podcast-theme"
import { cn } from "@/lib/utils"

type Season = "All" | "3" | "2"

type PodcastEpisodesProps = React.ComponentProps<"div"> & { hrefs?: Partial<PodcastHrefs> }

/** The Podcast episodes page: search, a season filter and a sort, with a play button on every row. */
function PodcastEpisodes({ hrefs, ...props }: PodcastEpisodesProps) {
  const [query, setQuery] = React.useState("")
  const [season, setSeason] = React.useState<Season>("All")
  const [sort, setSort] = React.useState<"new" | "long">("new")
  const q = query.trim().toLowerCase()
  const list = episodes
    .filter((e) => (season === "All" || String(e.season) === season) && (!q || [e.title, e.guest, e.summary].join(" ").toLowerCase().includes(q)))
    .sort((a, b) => (sort === "new" ? b.n - a.n : b.duration - a.duration))
  const ep = hrefs?.episode ?? "/podcast/episodes/the-optimised-life"
  return (
    <PodcastShell page="episodes" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 sm:pt-16">
        <h1 className={cn("text-[clamp(3rem,8vw,5.5rem)] leading-none", podcastDisplayClass)}>Episodes</h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-xl text-pretty">Every conversation, newest first. Search a guest or an idea.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-4 size-4 -translate-y-1/2" aria-hidden="true" />
            <input type="search" aria-label="Search episodes" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search episodes" className="bg-card focus-visible:ring-ring/50 placeholder:text-muted-foreground h-11 w-full rounded-full border pe-4 ps-11 outline-none focus-visible:ring-[3px]" />
          </div>
          <div role="group" aria-label="Season" className="flex gap-1.5">
            {(["All", "3", "2"] as const).map((s) => <button key={s} type="button" aria-pressed={season === s} onClick={() => setSeason(s)} className={cn("focus-visible:ring-ring/50 h-11 rounded-full border px-5 text-sm font-bold outline-none transition-colors focus-visible:ring-[3px]", season === s ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent")}>{s === "All" ? "All seasons" : `Season ${s}`}</button>)}
          </div>
          <label className="text-muted-foreground ms-auto flex items-center gap-2 text-sm font-semibold">Sort <select value={sort} onChange={(e) => setSort(e.target.value as "new" | "long")} className="bg-card text-foreground focus-visible:ring-ring/50 h-11 rounded-full border px-4 outline-none focus-visible:ring-[3px]"><option value="new">Newest</option><option value="long">Longest</option></select></label>
        </div>
        <p className="sr-only" role="status">{list.length} episodes</p>
        {list.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed p-14 text-center"><p className={cn("text-3xl", podcastDisplayClass)}>No episodes found</p><p className="text-muted-foreground mt-2">Try a different guest, or clear the filters.</p></div>
        ) : (
          <ul className="mt-8 divide-y border-y">
            {list.map((e) => (
              <li key={e.slug} className="grid grid-cols-[4rem_1fr_auto] items-center gap-4 py-6 sm:grid-cols-[6rem_1fr_auto] sm:gap-6">
                <ShowArt variant={e.art} image={e.image} imageAlt={e.imageAlt} className="rounded-2xl" />
                <a href={ep} className="group focus-visible:ring-ring/50 min-w-0 rounded outline-none focus-visible:ring-[3px]">
                  <p className="text-chart-2 text-xs font-extrabold tracking-[0.12em] uppercase">Season {e.season} · Ep. {e.n}</p>
                  <h2 className={cn("mt-1 text-2xl leading-tight text-balance group-hover:underline underline-offset-4 sm:text-3xl", podcastDisplayClass)}>{e.title}</h2>
                  <p className="text-muted-foreground mt-1.5 text-sm">with {e.guest}, {e.guestRole.toLowerCase()} · {formatDate(e.date)} · {minutes(e.duration)}</p>
                  <p className="text-muted-foreground mt-2 hidden text-pretty sm:block">{e.summary}</p>
                </a>
                <PlayButton ep={e} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </PodcastShell>
  )
}

export { PodcastEpisodes, type PodcastEpisodesProps }
