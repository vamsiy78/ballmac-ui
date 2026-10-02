// Ballmac UI: Podcast subscribe page. https://ui.ballmac.com/templates/template-podcast
"use client"

import * as React from "react"
import { Check, Heart } from "lucide-react"

import { CopyButton } from "@/components/ballmac/copy-button"
import { PodcastShell, podcastDisplayClass, type PodcastHrefs } from "@/components/ballmac/templates/podcast/podcast-theme"
import { cn } from "@/lib/utils"

const platforms = [["Apple Podcasts", "Open in Podcasts"], ["Spotify", "Follow on Spotify"], ["YouTube", "Watch the full dinners"], ["Overcast", "Subscribe"], ["Pocket Casts", "Subscribe"], ["Amazon Music", "Listen"]]
const tiers = [
  { id: "guest", name: "Guest", price: 5, perks: ["Ad-free episodes", "Bonus recipe card each episode"] },
  { id: "regular", name: "Regular", price: 10, perks: ["Everything in Guest", "The unedited hour after each recording", "Name in the credits"], featured: true },
  { id: "host", name: "Host the dinner", price: 25, perks: ["Everything in Regular", "Vote on the next guest", "A yearly letter from Nora and Sam"] },
]

type PodcastSubscribeProps = React.ComponentProps<"div"> & { hrefs?: Partial<PodcastHrefs> }

/** The Podcast subscribe page: every platform, the RSS feed to copy, and three ways to support the show. */
function PodcastSubscribe({ hrefs, ...props }: PodcastSubscribeProps) {
  const [tier, setTier] = React.useState("regular")
  return (
    <PodcastShell page="subscribe" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 sm:pt-16">
        <h1 className={cn("text-[clamp(3rem,8vw,5.5rem)] leading-none", podcastDisplayClass)}>Pull up a chair</h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-xl text-pretty">Follow The Long Table wherever you listen. New episodes land every other Tuesday at 6am.</p>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map(([p, l]) => <li key={p}><a href="#" className="bg-card hover:bg-accent focus-visible:ring-ring/50 group flex items-center gap-4 rounded-3xl border p-5 outline-none transition-colors focus-visible:ring-[3px]"><span className="bg-chart-1 flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-[var(--podcast-on-amber)]" aria-hidden="true">{p[0]}</span><span><span className="block font-bold">{p}</span><span className="text-muted-foreground text-sm">{l}</span></span></a></li>)}
        </ul>
        <section aria-labelledby="ps-rss" className="bg-secondary mt-8 flex flex-wrap items-center gap-4 rounded-3xl p-5">
          <div className="min-w-0 flex-1"><h2 id="ps-rss" className="font-bold">RSS feed</h2><p className="text-muted-foreground truncate font-mono text-sm">https://feeds.longtable.example/the-long-table.xml</p></div>
          <CopyButton value="https://feeds.longtable.example/the-long-table.xml" label="Copy feed" variant="outline" />
        </section>

        <section aria-labelledby="ps-support" className="mt-24">
          <h2 id="ps-support" className={cn("text-4xl sm:text-5xl", podcastDisplayClass)}>Keep the candle lit</h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-lg text-pretty">The show is made by three people and paid for by listeners. No sponsors in the middle of the conversation, ever.</p>
          <div role="radiogroup" aria-label="Choose a way to support the show" className="mt-8 grid gap-4 md:grid-cols-3">
            {tiers.map((t) => {
              const on = tier === t.id
              return (
                <label key={t.id} className={cn("has-[:focus-visible]:ring-ring/50 relative flex cursor-pointer flex-col rounded-3xl border-2 p-6 transition-colors has-[:focus-visible]:ring-[3px]", on ? "border-primary bg-card" : "hover:bg-accent/50 border-transparent bg-secondary")}>
                  <input type="radio" name="tier" value={t.id} checked={on} onChange={() => setTier(t.id)} className="sr-only" />
                  {"featured" in t && t.featured && <span className="bg-chart-1 absolute -top-3 start-6 rounded-full px-3 py-0.5 text-xs font-extrabold text-[var(--podcast-on-amber)]">Most chosen</span>}
                  <span className={cn("text-2xl", podcastDisplayClass)}>{t.name}</span>
                  <span className="mt-3 flex items-baseline gap-1"><span className="text-5xl font-extrabold tabular-nums">${t.price}</span><span className="text-muted-foreground text-sm">a month</span></span>
                  <ul className="mt-5 space-y-2.5">{t.perks.map((p) => <li key={p} className="flex items-start gap-2.5 text-sm text-pretty"><Check className="text-chart-3 mt-0.5 size-4 shrink-0" aria-hidden="true" />{p}</li>)}</ul>
                  <span className={cn("mt-6 inline-flex items-center gap-1.5 text-sm font-bold", on ? "text-chart-2" : "text-muted-foreground")} aria-hidden="true">{on ? <><Check className="size-4" />Selected</> : "Choose"}</span>
                </label>
              )
            })}
          </div>
          <a href="#" className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mt-8 inline-flex h-14 items-center gap-2 rounded-full px-8 text-lg font-bold outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] motion-reduce:transition-none"><Heart className="size-5" aria-hidden="true" />Support at ${tiers.find((t) => t.id === tier)?.price} a month</a>
        </section>
      </main>
    </PodcastShell>
  )
}

export { PodcastSubscribe, type PodcastSubscribeProps }
