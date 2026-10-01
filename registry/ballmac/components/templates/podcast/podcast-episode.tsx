// Ballmac UI: Podcast episode page. https://ui.ballmac.com/templates/template-podcast
"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { AudioPlayer, formatTime } from "@/components/ballmac/audio-player"
import { episodes, formatDate, getEpisode, minutes, transcript } from "@/components/ballmac/templates/podcast/podcast-data"
import { PodcastShell, ShowArt, podcastDisplayClass, type PodcastHrefs } from "@/components/ballmac/templates/podcast/podcast-theme"
import { cn } from "@/lib/utils"

const eyebrow = "text-chart-2 text-xs font-extrabold tracking-[0.14em] uppercase"

type PodcastEpisodeProps = React.ComponentProps<"div"> & { hrefs?: Partial<PodcastHrefs>; slug?: string }

/** The Podcast episode page: a player whose chapters and transcript follow along, a searchable transcript you can click to seek, show notes and more episodes. */
function PodcastEpisode({ hrefs, slug = "the-optimised-life", ...props }: PodcastEpisodeProps) {
  const ep = getEpisode(slug)
  const [time, setTime] = React.useState(0)
  const [follow, setFollow] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const box = React.useRef<HTMLOListElement>(null)
  const q = query.trim().toLowerCase()
  const current = [...transcript].reverse().find((l) => time >= l.t)
  const matches = q ? transcript.filter((l) => l.text.toLowerCase().includes(q)).length : 0

  // Keep the spoken line in view when following along.
  React.useEffect(() => {
    if (!follow || !box.current) return
    const el = box.current.querySelector<HTMLElement>("[data-current='true']")
    const parent = box.current.parentElement
    if (el && parent && typeof parent.scrollTo === "function") parent.scrollTo({ top: Math.max(0, el.offsetTop - 96), behavior: "smooth" })
  }, [current?.t, follow])

  const marks = (text: string) => {
    if (!q) return text
    const i = text.toLowerCase().indexOf(q)
    return i < 0 ? text : <>{text.slice(0, i)}<mark className="bg-chart-1 rounded-sm px-0.5 text-[var(--podcast-on-amber)]">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>
  }

  return (
    <PodcastShell page="episode" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 sm:pt-14">
        <p className={eyebrow}>Season {ep.season} · Episode {ep.n}</p>
        <h1 className={cn("mt-3 text-[clamp(2.6rem,6.4vw,4.8rem)] leading-[1.02] text-balance", podcastDisplayClass)}>{ep.title}</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-xl leading-relaxed text-pretty">{ep.summary}</p>
        <p className="text-muted-foreground mt-4 text-sm">{formatDate(ep.date)} · {minutes(ep.duration)} · with <span className="text-foreground font-semibold">{ep.guest}</span></p>

        <div className="mt-8">
          <AudioPlayer title={`${ep.n}. ${ep.title}`} subtitle={`The Long Table · ${minutes(ep.duration)}`} duration={ep.duration} chapters={ep.chapters} time={time} onTimeChange={setTime} artwork={<ShowArt variant={ep.art} />} />
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section aria-labelledby="pe-transcript">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="pe-transcript" className={cn("text-3xl", podcastDisplayClass)}>Transcript</h2>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} className="accent-primary size-4" />Follow along</label>
            </div>
            <div className="relative mt-4">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" aria-hidden="true" />
              <input type="search" aria-label="Search the transcript" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the transcript" className="bg-card focus-visible:ring-ring/50 placeholder:text-muted-foreground h-11 w-full rounded-full border pr-4 pl-11 outline-none focus-visible:ring-[3px]" />
            </div>
            <p className="text-muted-foreground mt-2 text-sm" role="status">{q ? `${matches} ${matches === 1 ? "match" : "matches"}` : "Click any line to jump to it."}</p>
            <div tabIndex={0} role="region" aria-label="Transcript" className="focus-visible:ring-ring/50 bg-card mt-3 max-h-[28rem] overflow-y-auto rounded-3xl border p-3 outline-none focus-visible:ring-[3px]">
              <ol ref={box} className="space-y-1">
                {transcript.map((l) => {
                  const on = current?.t === l.t
                  return (
                    <li key={l.t} data-current={on}>
                      <button type="button" onClick={() => setTime(l.t)} aria-current={on ? "true" : undefined} className={cn("focus-visible:ring-ring/50 grid w-full grid-cols-[3.2rem_4rem_1fr] gap-2 rounded-2xl px-3 py-3 text-left outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none", on ? "bg-chart-1 text-[var(--podcast-on-amber)]" : "hover:bg-accent")}>
                        <span className={cn("text-xs font-bold tabular-nums", !on && "text-chart-2")}>{formatTime(l.t)}</span>
                        <span className="text-sm font-extrabold">{l.who}</span>
                        <span className="text-pretty">{marks(l.text)}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </section>

          <aside className="space-y-8">
            <section aria-labelledby="pe-chapters">
              <h2 id="pe-chapters" className={cn("text-2xl", podcastDisplayClass)}>Chapters</h2>
              <ol className="mt-3 divide-y border-y">{ep.chapters.map((c) => <li key={c.start}><button type="button" onClick={() => setTime(c.start)} className="hover:bg-accent focus-visible:ring-ring/50 flex w-full items-baseline justify-between gap-3 rounded px-1 py-3 text-left outline-none focus-visible:ring-[3px]"><span className="font-semibold text-pretty">{c.title}</span><span className="text-muted-foreground text-sm tabular-nums">{formatTime(c.start)}</span></button></li>)}</ol>
            </section>
            <section aria-labelledby="pe-guest" className="bg-secondary rounded-3xl p-5">
              <h2 id="pe-guest" className="text-xs font-extrabold tracking-[0.14em] uppercase">Today’s guest</h2>
              <p className={cn("mt-3 text-2xl", podcastDisplayClass)}>{ep.guest}</p>
              <p className="text-muted-foreground text-sm">{ep.guestRole}</p>
              <ul className="mt-4 space-y-2 text-sm font-semibold"><li><a href="#" className="text-chart-2 underline underline-offset-4">Her website</a></li><li><a href="#" className="text-chart-2 underline underline-offset-4">The essay we discuss</a></li></ul>
            </section>
          </aside>
        </div>

        <section aria-labelledby="pe-more" className="mt-20">
          <h2 id="pe-more" className={cn("text-3xl", podcastDisplayClass)}>More conversations</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">{episodes.filter((e) => e.slug !== ep.slug).slice(0, 3).map((e) => <li key={e.slug}><a href={hrefs?.episode ?? "#"} className="group focus-visible:ring-ring/50 block rounded-3xl outline-none focus-visible:ring-[3px]"><ShowArt variant={e.art} className="rounded-3xl" /><p className="text-muted-foreground mt-3 text-xs font-semibold">Ep. {e.n} · {minutes(e.duration)}</p><h3 className={cn("mt-1 text-xl leading-tight text-balance group-hover:underline underline-offset-4", podcastDisplayClass)}>{e.title}</h3></a></li>)}</ul>
        </section>
      </main>
    </PodcastShell>
  )
}

export { PodcastEpisode, type PodcastEpisodeProps }
