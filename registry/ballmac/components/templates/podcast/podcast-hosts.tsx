// Ballmac UI: Podcast hosts page. https://ui.ballmac.com/templates/template-podcast
"use client"

import * as React from "react"
import { Mail } from "lucide-react"

import { PodcastShell, podcastDisplayClass, type PodcastHrefs } from "@/components/ballmac/templates/podcast/podcast-theme"
import { cn } from "@/lib/utils"

const hosts = [
  { name: "Nora Vale", role: "Host and food writer", bio: "Nora has written about food for fifteen years and cooks every dinner we record. She believes most arguments end better with a second helping.", tone: "bg-chart-4", initials: "NV", fact: "Cannot eat a meal without asking where the recipe came from." },
  { name: "Sam Okoye", role: "Host and producer", bio: "Sam spent a decade making radio before the long table. He asks the second question, the one after the polite answer.", tone: "bg-chart-3", initials: "SO", fact: "Still keeps a drawer of cassette tapes he will never digitise." },
]
const guests = ["Amara Okafor", "Tomás Reyes", "Inês Marques", "Elena Rossi", "Dev Patel", "Mei Tanaka", "Sasha Petrova", "Marcus Lindqvist", "Priya Raman", "Colm Brennan", "Jonas Eklund", "Yuki Tanaka"]

type PodcastHostsProps = React.ComponentProps<"div"> & { hrefs?: Partial<PodcastHrefs> }

/** The Podcast hosts page: two hosts with bios, a wall of past guests and a way to write in. */
function PodcastHosts({ hrefs, ...props }: PodcastHostsProps) {
  return (
    <PodcastShell page="hosts" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 sm:pt-16">
        <h1 className={cn("text-[clamp(3rem,8vw,5.5rem)] leading-none", podcastDisplayClass)}>Meet the hosts</h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-xl text-pretty">Two friends, one table, and a recording light that is mostly a candle.</p>
        <ul className="mt-12 grid gap-8 md:grid-cols-2">
          {hosts.map((h) => (
            <li key={h.name} className="bg-card rounded-[2rem] border p-8">
              <div aria-hidden="true" className={cn("text-[var(--podcast-on-amber)] flex size-32 items-center justify-center rounded-full text-5xl", h.tone, podcastDisplayClass)}>{h.initials}</div>
              <h2 className={cn("mt-6 text-3xl", podcastDisplayClass)}>{h.name}</h2>
              <p className="text-chart-2 text-sm font-bold">{h.role}</p>
              <p className="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty">{h.bio}</p>
              <p className="bg-secondary mt-5 rounded-2xl p-4 text-sm text-pretty"><span className="font-bold">Fun fact: </span>{h.fact}</p>
            </li>
          ))}
        </ul>
        <section aria-labelledby="ph-guests" className="mt-20">
          <h2 id="ph-guests" className={cn("text-4xl", podcastDisplayClass)}>Everyone who sat down</h2>
          <ul className="mt-8 flex flex-wrap gap-2">{guests.map((g) => <li key={g} className="bg-secondary rounded-full px-4 py-2 text-sm font-semibold">{g}</li>)}</ul>
        </section>
        <section aria-labelledby="ph-write" className="bg-chart-1 mt-20 rounded-[2rem] p-8 text-[var(--podcast-on-amber)] sm:p-12">
          <h2 id="ph-write" className={cn("text-4xl", podcastDisplayClass)}>Write to the table</h2>
          <p className="mt-3 max-w-lg text-lg text-pretty">Suggest a guest, argue with an episode or send us a recipe. We read every message and answer the good questions on air.</p>
          <a href="mailto:hello@longtable.example" className="bg-primary text-primary-foreground focus-visible:ring-ring mt-6 inline-flex h-12 items-center gap-2 rounded-full px-6 font-bold outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] motion-reduce:transition-none"><Mail className="size-4" aria-hidden="true" />hello@longtable.example</a>
        </section>
      </main>
    </PodcastShell>
  )
}

export { PodcastHosts, type PodcastHostsProps }
