// Ballmac UI: Summit schedule page. https://ui.ballmac.com/templates/template-summit
"use client"

import * as React from "react"
import { Clock, MapPin, Star, TriangleAlert } from "lucide-react"

import { sessions, speakerById, tracks, type Session, type Track } from "@/components/ballmac/templates/summit/summit-data"
import { Portrait, SummitShell, summitDisplayClass, type SummitHrefs } from "@/components/ballmac/templates/summit/summit-theme"
import { cn } from "@/lib/utils"

const trackDot: Record<Track, string> = { "Main stage": "bg-chart-1", Craft: "bg-chart-4", Systems: "bg-chart-3" }
const days = [{ n: 1 as const, label: "Day 1", date: "Friday 14 May" }, { n: 2 as const, label: "Day 2", date: "Saturday 15 May" }]
const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))
const overlaps = (a: Session, b: Session) => a.id !== b.id && a.day === b.day && minutes(a.start) < minutes(b.end) && minutes(b.start) < minutes(a.end)

type SummitScheduleProps = React.ComponentProps<"div"> & { hrefs?: Partial<SummitHrefs>; defaultSaved?: string[] }

/** The schedule: day switch, track filters, one-tap agenda saving with clash warnings and a live summary. */
function SummitSchedule({ hrefs, defaultSaved = [], ...props }: SummitScheduleProps) {
  const [day, setDay] = React.useState<1 | 2>(1)
  const [active, setActive] = React.useState<Track[]>([...tracks])
  const [saved, setSaved] = React.useState<string[]>(defaultSaved)
  const toggleTrack = (t: Track) => setActive((a) => (a.includes(t) ? (a.length > 1 ? a.filter((x) => x !== t) : a) : [...a, t]))
  const toggleSaved = (id: string) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const list = sessions.filter((s) => s.day === day && active.includes(s.track))
  const slots = [...new Set(list.map((s) => s.start))].sort()
  const mine = sessions.filter((s) => saved.includes(s.id)).sort((a, b) => a.day - b.day || minutes(a.start) - minutes(b.start))
  const clashes = mine.filter((s) => mine.some((o) => overlaps(s, o)))
  return (
    <SummitShell page="schedule" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
        <h1 className={cn("text-[clamp(2.8rem,9vw,7rem)] leading-[0.95]", summitDisplayClass)}>Schedule</h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-xl text-pretty">Three rooms run side by side. Star what you want to see and we will keep an eye out for clashes.</p>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y py-4">
          <div role="group" aria-label="Day" className="flex gap-2">
            {days.map((d) => <button key={d.n} type="button" aria-pressed={day === d.n} onClick={() => setDay(d.n)} className="hover:bg-accent focus-visible:ring-ring/50 aria-pressed:bg-primary aria-pressed:text-primary-foreground rounded-2xl border px-5 py-2 text-start outline-none focus-visible:ring-[3px]"><span className="block text-sm font-bold">{d.label}</span><span className="block text-xs">{d.date}</span></button>)}
          </div>
          <div role="group" aria-label="Tracks" className="flex flex-wrap gap-2">
            {tracks.map((t) => <button key={t} type="button" aria-pressed={active.includes(t)} onClick={() => toggleTrack(t)} className="hover:bg-accent focus-visible:ring-ring/50 aria-pressed:bg-secondary inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-[3px]"><span className={cn("size-2.5 rounded-full", trackDot[t])} aria-hidden="true" />{t}</button>)}
          </div>
        </div>

        <p role="status" className="text-muted-foreground mt-4 text-sm">{list.length} {list.length === 1 ? "talk" : "talks"} on {days[day - 1]!.date}. {saved.length > 0 ? `${saved.length} saved to your agenda.` : "Nothing saved yet."}</p>

        <div className="mt-6 grid gap-10">
          {slots.map((slot) => {
            const here = list.filter((s) => s.start === slot)
            return (
              <section key={slot} aria-label={`${slot} sessions`} className="grid gap-4 md:grid-cols-[6rem_minmax(0,1fr)]">
                <h2 className={cn("flex items-center gap-2 text-2xl tabular-nums md:block md:pt-4", summitDisplayClass)}>{slot}<span className="text-muted-foreground text-xs font-medium md:mt-1 md:block">until {here[0]!.end}</span></h2>
                <ul className={cn("grid gap-4", here.length > 1 && "lg:grid-cols-2", here.length > 2 && "xl:grid-cols-3")}>
                  {here.map((s) => {
                    const sp = speakerById(s.speaker)
                    const on = saved.includes(s.id)
                    return (
                      <li key={s.id} className={cn("bg-card grid grid-cols-[3.5rem_minmax(0,1fr)_auto] gap-4 rounded-3xl border p-5 transition-colors motion-reduce:transition-none", on && "border-primary bg-accent/50")}>
                        <Portrait speaker={sp} className="aspect-square h-14 w-14 rounded-2xl" />
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-xs font-bold"><span className={cn("size-2.5 rounded-full", trackDot[s.track])} aria-hidden="true" />{s.track}</p>
                          <h3 className="mt-1 text-lg leading-snug font-bold text-balance">{s.title}</h3>
                          <p className="text-muted-foreground mt-1 text-sm">{sp.name}, {sp.company}</p>
                          <p className="text-muted-foreground mt-3 text-sm text-pretty">{s.blurb}</p>
                          <p className="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium"><span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden="true" />{s.room}</span><span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{s.level}</span></p>
                        </div>
                        <button type="button" aria-pressed={on} aria-label={on ? `Remove ${s.title} from my agenda` : `Add ${s.title} to my agenda`} onClick={() => toggleSaved(s.id)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-full border outline-none focus-visible:ring-[3px]"><Star className={cn("size-5", on && "fill-current")} aria-hidden="true" /></button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
          {slots.length === 0 && <p className="text-muted-foreground py-10 text-center">No talks match these tracks on this day.</p>}
        </div>

        <section aria-labelledby="ss-agenda" className="bg-surface mt-16 rounded-3xl border p-6 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4"><h2 id="ss-agenda" className={cn("text-3xl", summitDisplayClass)}>My agenda</h2>{saved.length > 0 && <button type="button" onClick={() => setSaved([])} className="hover:bg-accent focus-visible:ring-ring/50 h-10 rounded-full border px-5 text-sm font-bold outline-none focus-visible:ring-[3px]">Clear all</button>}</div>
          {mine.length === 0 ? (
            <p className="text-muted-foreground mt-4 max-w-md text-pretty">Press the star on any talk and it lands here, sorted by day and time.</p>
          ) : (
            <>
              {clashes.length > 0 && <p className="bg-chart-2/25 mt-4 flex items-start gap-2 rounded-xl p-3 text-sm font-medium"><TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{clashes.length} of your talks run at the same time. Pick one for each slot marked below.</p>}
              <ol className="mt-5 divide-y">
                {mine.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-x-5 gap-y-1 py-3">
                    <span className={cn("w-28 text-sm tabular-nums", summitDisplayClass)}>Day {s.day} · {s.start}</span>
                    <span className="min-w-0 flex-1 font-semibold">{s.title}</span>
                    <span className="text-muted-foreground text-sm">{s.room}</span>
                    {clashes.includes(s) && <span className="bg-chart-2/40 rounded-full px-2.5 py-0.5 text-xs font-bold">Clash</span>}
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      </main>
    </SummitShell>
  )
}

export { SummitSchedule, type SummitScheduleProps }
