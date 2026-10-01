// Ballmac UI: Studio project page. https://ui.ballmac.com/templates/template-studio
import * as React from "react"
import { ArrowUpRight } from "lucide-react"

import { projects } from "@/components/ballmac/templates/studio/studio-data"
import { StudioArt, StudioShell, studioDisplay, type StudioHrefs } from "@/components/ballmac/templates/studio/studio-theme"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--studio-mono)" } as const

const facts = [["Client", "North Coast Rail"], ["Year", "2026"], ["Services", "Identity, signage, motion, website"], ["Team", "6 people, 11 months"]]
const credits = [["Creative direction", "Inês Hollis"], ["Design lead", "Jonas Vane"], ["Motion", "Mei Tanaka"], ["Development", "Colm Brennan"], ["Strategy", "Amara Okafor"]]

type StudioProjectProps = React.ComponentProps<"div"> & { hrefs?: Partial<StudioHrefs> }

/** A Studio project page: a full-bleed poster, a fact line, big imagery in two rhythms, a pull quote and credits. */
function StudioProject({ hrefs, ...props }: StudioProjectProps) {
  const next = projects[1]
  return (
    <StudioShell page="project" hrefs={hrefs} {...props}>
      <main>
        <header className="mx-auto max-w-[100rem] px-4 pt-10 sm:px-8 sm:pt-16">
          <p className="text-muted-foreground text-sm" style={mono}><a href={hrefs?.work ?? "/studio/work"} className="underline-offset-4 hover:underline">Work</a> / Brand</p>
          <h1 className={cn("mt-4 text-[clamp(3rem,12vw,12rem)]", studioDisplay)}>North Coast Rail</h1>
          <p className="mt-6 max-w-3xl text-2xl text-pretty sm:text-3xl">A railway identity that moves: from a logo built from a single line to 400 trains that carry it.</p>
        </header>
        <StudioArt variant={0} className="border-foreground mt-12 aspect-[16/8] border-y-2" />
        <dl className="mx-auto grid max-w-[100rem] gap-6 px-4 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {facts.map(([k, v]) => <div key={k}><dt className="text-muted-foreground text-xs uppercase" style={mono}>{k}</dt><dd className="mt-2 text-lg font-semibold">{v}</dd></div>)}
        </dl>
        <section className="mx-auto max-w-[100rem] px-4 py-12 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <h2 className={cn("text-4xl", studioDisplay)}>The idea</h2>
            <p className="max-w-3xl text-2xl leading-snug text-pretty sm:text-3xl">A railway is one long line with many stops. We drew the identity the same way: a single continuous stroke that bends into the letters, the map and the livery. It is simple enough to paint on a train and distinctive enough to recognise from the platform.</p>
          </div>
        </section>
        <section className="mx-auto max-w-[100rem] space-y-4 px-4 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2"><StudioArt variant={1} className="border-foreground border-2" /><StudioArt variant={4} className="border-foreground border-2" /></div>
          <StudioArt variant={3} className="border-foreground aspect-[16/7] border-2" />
        </section>
        <section className="bg-chart-1 mt-20 text-[var(--studio-on-accent)]">
          <figure className="mx-auto max-w-[100rem] px-4 py-20 sm:px-8 sm:py-28">
            <blockquote className={cn("max-w-6xl text-[clamp(2rem,5.6vw,5rem)]", studioDisplay)}>“Passengers started photographing the trains. We have never had that before.”</blockquote>
            <figcaption className="mt-8 text-sm" style={mono}>Anaïs Dupont, CMO, North Coast Rail</figcaption>
          </figure>
        </section>
        <section aria-labelledby="sp-credits" className="mx-auto max-w-[100rem] px-4 py-20 sm:px-8">
          <h2 id="sp-credits" className={cn("text-4xl", studioDisplay)}>Credits</h2>
          <dl className="mt-8 divide-y-2 border-y-2">{credits.map(([k, v]) => <div key={k} className="grid grid-cols-2 py-4 sm:grid-cols-[16rem_1fr]"><dt className="text-muted-foreground text-sm" style={mono}>{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
        </section>
        <a href={hrefs?.project ?? "/studio/work/oat-and-ember"} className="group border-foreground focus-visible:ring-ring/50 block border-t-2 outline-none focus-visible:ring-[3px] focus-visible:ring-inset">
          <div className="mx-auto flex max-w-[100rem] items-center justify-between gap-6 px-4 py-14 sm:px-8">
            <div><p className="text-muted-foreground text-sm" style={mono}>Next project</p><p className={cn("group-hover:text-chart-1 mt-3 text-[clamp(2.4rem,8vw,8rem)] transition-colors motion-reduce:transition-none", studioDisplay)}>{next.name}</p></div>
            <ArrowUpRight className="size-14 shrink-0 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2 motion-reduce:transition-none" strokeWidth={1.5} aria-hidden="true" />
          </div>
        </a>
      </main>
    </StudioShell>
  )
}

export { StudioProject, type StudioProjectProps }
