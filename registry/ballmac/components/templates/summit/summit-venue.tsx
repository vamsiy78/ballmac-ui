// Ballmac UI: Summit venue page. https://ui.ballmac.com/templates/template-summit
"use client"

import * as React from "react"
import { Accessibility, Bed, Plane, Train } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ballmac/accordion"
import { faqs } from "@/components/ballmac/templates/summit/summit-data"
import { SummitShell, summitDisplayClass, type SummitHrefs } from "@/components/ballmac/templates/summit/summit-theme"
import { cn } from "@/lib/utils"

const ways = [
  { id: "fly", label: "Fly", icon: Plane, title: "Keflavík airport, 50 minutes away", body: "Flybus meets every arrival and drops you at the hotel row. We run a free shuttle from the airport at 8:00 and 12:00 on Thursday and Friday." },
  { id: "bus", label: "City bus", icon: Train, title: "Lines 1, 3 and 11 stop at the door", body: "Buses run every ten minutes until midnight. Your ticket doubles as a three-day city pass. Show the QR code to the driver." },
  { id: "walk", label: "On foot", icon: Accessibility, title: "Twelve minutes from the old harbour", body: "The route along the water is flat and lit. Taxis and wheelchair-accessible vehicles wait at the north entrance." },
]
const hotels = [["Hótel Esja", "3 min walk", 164], ["The Harbour House", "6 min walk", 142], ["Sól Apartments", "9 min walk", 118]] as const

/** A flat map of the harbour: water, land, a route and three pins. Decorative; the list beside it says the same in words. */
function VenueMap() {
  return (
    <svg viewBox="0 0 600 420" role="img" aria-label="Map: the airport is to the south east, the hotels sit along the harbour and Harpa is at the north end of the water" className="bg-chart-3/20 h-full w-full rounded-3xl">
      <path className="fill-secondary" d="M0 0H600V420H0Z" />
      <path className="fill-chart-3/35" d="M-10 150C80 110 140 190 240 160S400 80 470 120 590 150 610 130V-10H-10Z" />
      <path className="fill-card" d="M0 200C90 170 170 240 270 215S420 150 500 190 580 220 600 210V420H0Z" />
      <path className="stroke-primary fill-none" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" d="M90 360C150 320 200 330 260 280S360 230 430 215" />
      {[[90, 360, "Airport bus"], [260, 280, "Hotels"], [430, 215, "Harpa"]].map(([x, y, l]) => (
        <g key={l as string}><circle cx={x as number} cy={y as number} r="13" className={l === "Harpa" ? "fill-chart-1" : "fill-primary"} /><circle cx={x as number} cy={y as number} r="5" className="fill-card" /><text x={(x as number) + 20} y={(y as number) + 5} className="fill-foreground text-[15px] font-bold">{l as string}</text></g>
      ))}
    </svg>
  )
}

type SummitVenueProps = React.ComponentProps<"div"> & { hrefs?: Partial<SummitHrefs> }

/** The venue page: map, three ways to arrive, nearby hotels with a held rate, access details and the full FAQ. */
function SummitVenue({ hrefs, ...props }: SummitVenueProps) {
  const [way, setWay] = React.useState("fly")
  const current = ways.find((w) => w.id === way)!
  return (
    <SummitShell page="venue" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
        <h1 className={cn("text-[clamp(2.8rem,9vw,7rem)] leading-[0.95]", summitDisplayClass)}>Venue</h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-xl text-pretty">Harpa sits on the water at the edge of the old harbour. Three rooms, one long lunch hall and a lot of glass.</p>

        <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="min-h-72"><VenueMap /></div>
          <section aria-labelledby="sv-way" className="bg-card rounded-3xl border p-6 sm:p-8">
            <h2 id="sv-way" className={cn("text-2xl", summitDisplayClass)}>Getting there</h2>
            <div role="group" aria-label="How you travel" className="mt-4 flex flex-wrap gap-2">{ways.map((w) => <button key={w.id} type="button" aria-pressed={way === w.id} onClick={() => setWay(w.id)} className="hover:bg-accent focus-visible:ring-ring/50 aria-pressed:bg-primary aria-pressed:text-primary-foreground inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-[3px]"><w.icon className="size-4" aria-hidden="true" />{w.label}</button>)}</div>
            <div aria-live="polite" className="mt-6"><h3 className="text-xl font-bold text-balance">{current.title}</h3><p className="text-muted-foreground mt-2 text-pretty">{current.body}</p></div>
            <address className="text-muted-foreground mt-6 border-t pt-4 text-sm not-italic">Harpa Concert Hall<br />Austurbakki 2, 101 Reykjavik</address>
          </section>
        </div>

        <section aria-labelledby="sv-hotels" className="mt-16">
          <h2 id="sv-hotels" className={cn("text-[clamp(2rem,5vw,3rem)] leading-none", summitDisplayClass)}>Where to stay</h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-pretty">We hold rooms at three hotels until 1 April. Use the code NORTHLIGHT when you book.</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">{hotels.map(([n, d, p]) => <li key={n} className="bg-card rounded-3xl border p-6"><Bed className="text-primary size-6" aria-hidden="true" /><h3 className="mt-4 text-xl font-bold">{n}</h3><p className="text-muted-foreground text-sm">{d}</p><p className="mt-4"><span className={cn("text-3xl tabular-nums", summitDisplayClass)}>${p}</span><span className="text-muted-foreground text-sm"> a night</span></p></li>)}</ul>
        </section>

        <section aria-labelledby="sv-access" className="bg-surface mt-16 grid gap-6 rounded-3xl border p-6 sm:p-10 md:grid-cols-3">
          <h2 id="sv-access" className={cn("text-[clamp(1.8rem,4vw,2.5rem)] leading-none md:col-span-3", summitDisplayClass)}>Access, for everyone</h2>
          {[["Step-free", "Every room, restroom and the lunch hall. Lifts at both ends of the building."], ["Hearing and sight", "Hearing loops in all three rooms, live captions on every screen and large-print programmes."], ["Quiet and care", "A quiet room on each floor and a staffed children’s room, both open all day."]].map(([t, b]) => <div key={t}><h3 className="text-lg font-bold">{t}</h3><p className="text-muted-foreground mt-2 text-pretty">{b}</p></div>)}
        </section>

        <section aria-labelledby="sv-faq" className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <h2 id="sv-faq" className={cn("text-[clamp(2rem,5vw,3rem)] leading-none", summitDisplayClass)}>Questions</h2>
          <Accordion type="single" collapsible className="border-y">{faqs.map((f) => <AccordionItem key={f.q} value={f.q}><AccordionTrigger className="text-lg font-bold">{f.q}</AccordionTrigger><AccordionContent className="text-muted-foreground text-pretty">{f.a}</AccordionContent></AccordionItem>)}</Accordion>
        </section>
      </main>
    </SummitShell>
  )
}

export { SummitVenue, type SummitVenueProps }
