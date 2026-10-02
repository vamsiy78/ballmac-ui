// Ballmac UI: Summit home page. https://ui.ballmac.com/templates/template-summit
"use client"

import * as React from "react"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"

import { EVENT_DATE, sessions, speakerById, speakers, sponsors, tiers } from "@/components/ballmac/templates/summit/summit-data"
import { Portrait, Ridge, SummitShell, summitDisplayClass, summitOnSun, useCountdown, type SummitHrefs } from "@/components/ballmac/templates/summit/summit-theme"
import { cn } from "@/lib/utils"

const stats = [["2", "days"], ["24", "talks"], ["3", "stages"], ["900", "people"]]
const reasons = [
  { n: "01", title: "Talks with a point of view", body: "Every speaker is asked one question before they are booked: what do you believe that most of your industry does not?" },
  { n: "02", title: "Rooms that are not crowded", body: "Nine hundred seats in a hall built for three thousand. You will always find a place to sit and someone to talk to." },
  { n: "03", title: "Time to talk, on purpose", body: "Ninety minutes for lunch, a long Thursday dinner and a lounge where speakers sit down and answer the second question." },
]

function Tile({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="bg-[var(--summit-ridge-3)]/55 min-w-[4.5rem] rounded-2xl border border-white/20 px-3 py-3 text-center backdrop-blur-sm sm:min-w-24 sm:px-5 sm:py-4">
      <div className={cn("text-3xl tabular-nums sm:text-5xl", summitDisplayClass)}>{value}</div>
      <div className="mt-1 text-xs font-semibold tracking-widest uppercase">{unit}</div>
    </div>
  )
}

type SummitHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<SummitHrefs> }

/** The Summit home page: a sunrise hero with a live countdown, numbers, speakers, a schedule teaser and tickets. */
function SummitHome({ hrefs, ...props }: SummitHomeProps) {
  const link = { schedule: "/summit/schedule", speakers: "/summit/speakers", tickets: "/summit/tickets", venue: "/summit/venue", ...hrefs }
  const left = useCountdown(EVENT_DATE)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    <SummitShell page="home" hrefs={hrefs} {...props}>
      <main>
        <section aria-labelledby="sh-title" className="relative isolate overflow-hidden text-[var(--summit-hero-fg)]">
          <Ridge />
          <div className="mx-auto max-w-7xl px-4 pt-16 pb-72 sm:px-6 sm:pt-24 sm:pb-80">
            <p className="inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-full border border-white/25 px-4 py-1.5 text-sm font-semibold"><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden="true" />14–15 May 2027</span><span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden="true" />Harpa, Reykjavik</span></p>
            <h1 id="sh-title" className={cn("mt-8 max-w-4xl text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.92]", summitDisplayClass)}>Look further.</h1>
            <p className="mt-6 max-w-xl text-xl text-pretty">Two days of talks about design, engineering and the long view, held where the sun barely sets. Twelve speakers, nine hundred seats.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={link.tickets} className={cn("bg-chart-2 focus-visible:ring-ring inline-flex h-14 items-center gap-2 rounded-full px-8 text-lg font-bold outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] motion-reduce:transition-none motion-reduce:hover:translate-y-0", summitOnSun)}>Get tickets from $190 <ArrowRight className="size-5 rtl:rotate-180" aria-hidden="true" /></a>
              <a href={link.schedule} className="focus-visible:ring-ring inline-flex h-14 items-center rounded-full border-2 border-white/60 px-8 text-lg font-bold outline-none transition-colors hover:bg-white/10 focus-visible:ring-[3px] motion-reduce:transition-none">See the schedule</a>
            </div>
            <div className="mt-12" role="group" aria-label="Time until the first talk">
              <p className="mb-3 text-sm font-semibold tracking-widest uppercase">Doors open in</p>
              <div className="flex gap-2 sm:gap-3" aria-hidden="true">
                <Tile value={left ? String(left.days) : "—"} unit="days" /><Tile value={left ? pad(left.hours) : "—"} unit="hours" /><Tile value={left ? pad(left.minutes) : "—"} unit="min" /><Tile value={left ? pad(left.seconds) : "—"} unit="sec" />
              </div>
              <p className="sr-only">{left ? `${left.days} days until the doors open on 14 May 2027.` : "Doors open on 14 May 2027."}</p>
            </div>
          </div>
        </section>

        <section aria-label="Supporters" className="border-b">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 sm:px-6"><span className="text-muted-foreground text-xs font-bold tracking-[0.14em] uppercase">Supported by</span>{sponsors.map((s) => <span key={s} className={cn("text-muted-foreground text-lg", summitDisplayClass)}>{s}</span>)}</div>
        </section>

        <section aria-label="The event in numbers" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">{stats.map(([n, l], i) => <li key={l} className={cn("rounded-3xl border p-6 sm:p-8", ["bg-chart-1/15", "bg-chart-2/25", "bg-chart-3/15", "bg-chart-4/15"][i])}><span className={cn("block text-[clamp(2.8rem,7vw,5rem)] leading-none", summitDisplayClass)}>{n}</span><span className="text-muted-foreground mt-2 block text-sm font-semibold tracking-widest uppercase">{l}</span></li>)}</ul>
        </section>

        <section aria-labelledby="sh-speakers" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="flex items-end justify-between gap-4"><h2 id="sh-speakers" className={cn("text-[clamp(2rem,5vw,3.5rem)] leading-none", summitDisplayClass)}>On stage</h2><a href={link.speakers} className="text-primary text-sm font-bold underline-offset-4 hover:underline">All 12 speakers</a></div>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {speakers.slice(0, 6).map((s) => (
              <li key={s.id}><a href={link.speakers} className="focus-visible:ring-ring/50 group block rounded-3xl outline-none focus-visible:ring-[3px]"><Portrait speaker={s} className="rounded-3xl transition-transform group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0" /><span className="mt-3 block font-bold">{s.name}</span><span className="text-muted-foreground block text-sm">{s.role}, {s.company}</span></a></li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sh-day" className="bg-surface border-y">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
            <div><h2 id="sh-day" className={cn("text-[clamp(2rem,5vw,3.5rem)] leading-none", summitDisplayClass)}>Day one, at a glance</h2><p className="text-muted-foreground mt-4 max-w-sm text-lg text-pretty">Three rooms, no overlap you will regret. Star the talks you want and we will build your day.</p><a href={link.schedule} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mt-6 inline-flex h-12 items-center gap-2 rounded-full px-6 font-bold outline-none focus-visible:ring-[3px]">Build my agenda <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></a></div>
            <ol className="divide-y rounded-3xl border bg-card">
              {sessions.filter((s) => s.day === 1).slice(0, 5).map((s) => (
                <li key={s.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:p-5">
                  <span className={cn("text-lg tabular-nums", summitDisplayClass)}>{s.start}</span>
                  <span className="min-w-0"><span className="block font-bold text-pretty">{s.title}</span><span className="text-muted-foreground block text-sm">{speakerById(s.speaker).name} · {s.room}</span></span>
                  <span className="bg-secondary hidden h-fit rounded-full px-3 py-1 text-xs font-bold sm:inline">{s.track}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="sh-why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 id="sh-why" className={cn("max-w-2xl text-[clamp(2rem,5vw,3.5rem)] leading-none text-balance", summitDisplayClass)}>Why people come back</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">{reasons.map((r) => <li key={r.n} className="bg-card rounded-3xl border p-8"><span className={cn("text-primary text-sm", summitDisplayClass)}>{r.n}</span><h3 className="mt-6 text-2xl font-bold text-balance">{r.title}</h3><p className="text-muted-foreground mt-3 text-pretty">{r.body}</p></li>)}</ul>
        </section>

        <section aria-labelledby="sh-tix" className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
          <div className={cn("bg-chart-1 relative overflow-hidden rounded-[2rem] p-8 sm:p-14", summitOnSun)}>
            <div aria-hidden="true" className="bg-chart-2 absolute -top-24 -end-16 aspect-square w-80 rounded-full" />
            <div className="relative grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div><h2 id="sh-tix" className={cn("text-[clamp(2rem,5vw,3.8rem)] leading-none text-balance", summitDisplayClass)}>The early bird is $200 cheaper.</h2><p className="mt-4 max-w-lg text-lg text-pretty">Early bird ends on 15 January or at 200 tickets, whichever comes first. Refundable until 30 days before.</p></div>
              <div className="flex flex-wrap items-center gap-4 lg:justify-end"><span className={cn("text-6xl", summitDisplayClass)}>${tiers[1]!.price}</span><a href={link.tickets} className="bg-[var(--summit-ridge-3)] focus-visible:ring-ring inline-flex h-14 items-center gap-2 rounded-full px-8 text-lg font-bold text-[var(--summit-hero-fg)] outline-none focus-visible:ring-[3px]">Get tickets <ArrowRight className="size-5 rtl:rotate-180" aria-hidden="true" /></a></div>
            </div>
          </div>
        </section>
      </main>
    </SummitShell>
  )
}

export { SummitHome, type SummitHomeProps }
