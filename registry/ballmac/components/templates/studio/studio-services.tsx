// Ballmac UI: Studio services page. https://ui.ballmac.com/templates/template-studio
"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"

import { services } from "@/components/ballmac/templates/studio/studio-data"
import { StudioShell, studioDisplay, type StudioHrefs } from "@/components/ballmac/templates/studio/studio-theme"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--studio-mono)" } as const

type StudioServicesProps = React.ComponentProps<"div"> & { hrefs?: Partial<StudioHrefs> }

/** The Studio services page: four numbered disciplines that open to show what's inside, with a starting price. */
function StudioServices({ hrefs, ...props }: StudioServicesProps) {
  const [open, setOpen] = React.useState<string | null>("01")
  return (
    <StudioShell page="services" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-[100rem] px-4 pt-10 sm:px-8 sm:pt-16">
        <h1 className={cn("text-[clamp(3rem,12vw,12rem)]", studioDisplay)}>Services</h1>
        <p className="mt-6 max-w-2xl text-2xl text-pretty">Four ways to work with us. Most projects start with one and grow into two.</p>
        <ul className="mt-14 border-t-2">
          {services.map((s) => {
            const on = open === s.n
            return (
              <li key={s.n} className="border-b-2">
                <h2>
                  <button type="button" aria-expanded={on} aria-controls={`ss-${s.n}`} onClick={() => setOpen(on ? null : s.n)} className="hover:bg-accent focus-visible:ring-ring/50 grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-4 px-2 py-7 text-start outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-inset sm:grid-cols-[6rem_1fr_auto] sm:px-4 motion-reduce:transition-none">
                    <span className="bg-chart-1 h-fit w-fit px-2 py-0.5 text-lg font-bold text-[var(--studio-on-accent)]" style={mono}>{s.n}</span>
                    <span className={cn("text-[clamp(1.8rem,5vw,4.5rem)]", studioDisplay)}>{s.title}</span>
                    {on ? <Minus className="size-8" aria-hidden="true" /> : <Plus className="size-8" aria-hidden="true" />}
                  </button>
                </h2>
                <div id={`ss-${s.n}`} role="region" aria-labelledby={undefined} hidden={!on} className="grid gap-8 px-2 pb-10 sm:grid-cols-[6rem_1fr_16rem] sm:px-4">
                  <span aria-hidden="true" className="hidden sm:block" />
                  <div><p className="max-w-2xl text-xl text-pretty">{s.text}</p><ul className="mt-6 flex flex-wrap gap-2">{s.items.map((i) => <li key={i} className="rounded-full border-2 border-current px-4 py-1.5 text-sm font-semibold">{i}</li>)}</ul></div>
                  <p className="bg-chart-3 h-fit rounded px-4 py-3 text-lg font-bold text-[var(--studio-on-accent)]" style={mono}>{s.from}</p>
                </div>
              </li>
            )
          })}
        </ul>
        <section aria-labelledby="ss-faq" className="grid gap-10 py-24 lg:grid-cols-[1fr_2fr]">
          <h2 id="ss-faq" className={cn("text-5xl", studioDisplay)}>Before you ask</h2>
          <dl className="divide-y-2 border-y-2">
            {[["Do you work with startups?", "Yes, if the founders are the ones in the room. We take two a quarter."], ["How long does a project take?", "An identity takes 10 to 14 weeks. A website, 12 to 20. A campaign depends on the shoot."], ["Can you work with our team?", "Always. Most of our best work was built alongside in-house designers and developers."]].map(([q, a]) => <div key={q} className="py-6"><dt className="text-xl font-bold">{q}</dt><dd className="text-muted-foreground mt-2 max-w-xl text-pretty">{a}</dd></div>)}
          </dl>
        </section>
      </main>
    </StudioShell>
  )
}

export { StudioServices, type StudioServicesProps }
