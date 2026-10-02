// Ballmac UI: Podcast home page. https://ui.ballmac.com/templates/template-podcast
"use client"

import * as React from "react"
import { ArrowRight, Check, Play } from "lucide-react"

import { episodes, formatDate, minutes } from "@/components/ballmac/templates/podcast/podcast-data"
import { PodcastShell, ShowArt, podcastDisplayClass, usePodcast, type PodcastHrefs } from "@/components/ballmac/templates/podcast/podcast-theme"
import { cn } from "@/lib/utils"

const eyebrow = "text-chart-2 text-xs font-extrabold tracking-[0.14em] uppercase"

function PlayButton({ ep, big }: { ep: (typeof episodes)[number]; big?: boolean }) {
  const { play, now } = usePodcast()
  const on = now?.slug === ep.slug
  return (
    <button type="button" onClick={() => play(ep)} aria-label={`Play episode ${ep.n}: ${ep.title}`} aria-pressed={on} className={cn("bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-bold outline-none transition-transform hover:scale-105 focus-visible:ring-[3px] motion-reduce:transition-none", big ? "h-14 px-7 text-base" : "size-11")}>
      <Play className={cn("fill-current", big ? "size-5" : "size-4 translate-x-px")} aria-hidden="true" />{big && (on ? "Playing" : "Play latest")}
    </button>
  )
}

function Subscribe() {
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState("")
  const [done, setDone] = React.useState(false)
  return done ? (
    <p role="status" className="inline-flex items-center gap-2 font-semibold"><Check className="text-chart-3 size-5" aria-hidden="true" />Saved a seat for you. See you Tuesday.</p>
  ) : (
    <div className="w-full max-w-md"><form noValidate onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter an email like you@example.com."); setError(""); setDone(true) }} className="flex w-full flex-col gap-2 sm:flex-row">
      <label htmlFor="pc-email" className="sr-only">Email address</label>
      <input id="pc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "pc-err" : undefined} placeholder="you@example.com" className="bg-background text-foreground focus-visible:ring-ring/50 placeholder:text-muted-foreground aria-[invalid=true]:border-destructive h-12 flex-1 rounded-full border px-5 outline-none focus-visible:ring-[3px]" />
      <button type="submit" className="bg-chart-1 h-12 rounded-full px-6 font-bold text-[var(--podcast-on-amber)] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring motion-reduce:transition-none">Send me show notes</button>
    </form>
    {error && <p id="pc-err" role="alert" className="bg-background text-destructive mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold">{error}</p>}
    </div>
  )
}

type PodcastHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<PodcastHrefs> }

/** The Podcast home page: the latest episode with a play button, the recent list, the hosts and a show-notes sign-up. The mini player appears when you play. */
function PodcastHome({ hrefs, ...props }: PodcastHomeProps) {
  const [latest, ...rest] = episodes
  const ep = hrefs?.episode ?? "/podcast/episodes/the-optimised-life"
  return (
    <PodcastShell page="home" hrefs={hrefs} {...props}>
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 sm:px-6 sm:pt-20 md:grid-cols-[1.15fr_1fr]">
          <div>
            <p className={eyebrow}>New episode · {formatDate(latest.date)}</p>
            <h1 className={cn("mt-4 text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.02] text-balance", podcastDisplayClass)}>Long dinners. Good questions. No agenda.</h1>
            <p className="text-muted-foreground mt-6 max-w-lg text-xl leading-relaxed text-pretty">The Long Table is a podcast recorded at an actual table, every other Tuesday, with someone worth listening to for an hour.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PlayButton ep={latest} big />
              <a href={ep} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-14 items-center gap-2 rounded-full border px-6 font-bold outline-none transition-colors focus-visible:ring-[3px]">Show notes <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></a>
            </div>
            <ul aria-label="Listen on" className="mt-8 flex flex-wrap gap-2">{["Apple Podcasts", "Spotify", "YouTube", "RSS"].map((p) => <li key={p}><a href={hrefs?.subscribe ?? "/podcast/subscribe"} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-9 items-center rounded-full border px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px]">{p}</a></li>)}</ul>
          </div>
          <a href={ep} className="group focus-visible:ring-ring/50 block rotate-2 rounded-[2rem] outline-none transition-transform duration-500 hover:rotate-0 focus-visible:ring-[3px] focus-visible:ring-offset-4 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:rotate-2">
            <ShowArt variant={latest.art} className="rounded-[2rem] shadow-[0_30px_70px_-30px_oklch(0.3_0.1_340/0.6)]" />
            <span className="sr-only">Episode {latest.n}: {latest.title}</span>
          </a>
        </section>

        <section aria-labelledby="pc-recent" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4"><h2 id="pc-recent" className={cn("text-4xl sm:text-5xl", podcastDisplayClass)}>Recent episodes</h2><a href={hrefs?.episodes ?? "/podcast/episodes"} className="text-chart-2 inline-flex items-center gap-1.5 font-bold underline-offset-4 hover:underline">All {episodes.length + 34} episodes <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></a></div>
          <ul className="mt-8 divide-y border-y">
            {rest.slice(0, 5).map((e) => (
              <li key={e.slug} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 py-5 sm:grid-cols-[5rem_1fr_auto] sm:gap-6">
                <ShowArt variant={e.art} className="rounded-xl" />
                <a href={ep} className="group focus-visible:ring-ring/50 min-w-0 rounded outline-none focus-visible:ring-[3px]">
                  <p className="text-muted-foreground text-xs font-semibold">Ep. {e.n} · {formatDate(e.date)} · {minutes(e.duration)}</p>
                  <h3 className={cn("mt-1 text-xl leading-tight text-balance group-hover:underline underline-offset-4 sm:text-2xl", podcastDisplayClass)}>{e.title}</h3>
                  <p className="text-muted-foreground mt-1 hidden text-pretty sm:block">{e.summary}</p>
                </a>
                <PlayButton ep={e} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="pc-hosts" className="mx-auto mt-24 grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2">
          <div>
            <h2 id="pc-hosts" className={cn("text-4xl sm:text-5xl", podcastDisplayClass)}>Two friends, one table.</h2>
            <p className="text-muted-foreground mt-5 max-w-md text-lg leading-relaxed text-pretty">Nora Vale is a food writer. Sam Okoye is a former radio producer. They started the show to have the long conversations they kept promising each other.</p>
            <a href={hrefs?.hosts ?? "/podcast/hosts"} className="text-chart-2 mt-5 inline-flex items-center gap-1.5 font-bold underline-offset-4 hover:underline">Meet the hosts <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></a>
          </div>
          <div aria-hidden="true" className="flex items-center justify-center gap-4">{[["NV", "bg-chart-4"], ["SO", "bg-chart-3"]].map(([i, c], idx) => <div key={i} className={cn("text-[var(--podcast-on-amber)] flex size-40 items-center justify-center rounded-full text-5xl sm:size-52", c, podcastDisplayClass, idx === 1 && "translate-y-8")}>{i}</div>)}</div>
        </section>

        <section className="mx-auto mt-28 max-w-6xl px-4 sm:px-6">
          <div className="bg-primary text-primary-foreground relative rounded-[2rem] px-6 py-14 text-center sm:px-14">
            <h2 className={cn("mx-auto max-w-xl text-4xl text-balance sm:text-5xl", podcastDisplayClass)}>Show notes, in your inbox, before the episode.</h2>
            <p className="mx-auto mt-4 max-w-md opacity-85 text-pretty">One email every other Tuesday: the guest, the three best ideas and the recipe we made.</p>
            <div className="mt-8 flex justify-center"><Subscribe /></div>
          </div>
        </section>
      </main>
    </PodcastShell>
  )
}

export { PodcastHome, PlayButton, type PodcastHomeProps }
