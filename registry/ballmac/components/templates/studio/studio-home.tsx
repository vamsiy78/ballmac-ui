// Ballmac UI: Studio home page. https://ui.ballmac.com/templates/template-studio
"use client"

import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { useReducedMotion } from "motion/react"

import { Marquee } from "@/components/ballmac/marquee"
import { process, projects, services } from "@/components/ballmac/templates/studio/studio-data"
import { StudioArt, StudioShell, studioDisplay, type StudioHrefs } from "@/components/ballmac/templates/studio/studio-theme"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--studio-mono)" } as const

/** A list of projects. Hover or focus a row and a poster follows the pointer (or sits beside the row for keyboard users). */
function WorkReel({ href }: { href: string }) {
  const reduce = useReducedMotion()
  const [active, setActive] = React.useState<number | null>(null)
  const [mode, setMode] = React.useState<"pointer" | "focus">("pointer")
  const box = React.useRef<HTMLDivElement>(null)
  const card = React.useRef<HTMLDivElement>(null)

  function move(e: React.PointerEvent) {
    const r = box.current?.getBoundingClientRect()
    if (!r || !card.current || reduce) return
    card.current.style.transform = `translate(${e.clientX - r.left + 28}px, ${e.clientY - r.top - 120}px)`
  }
  const shown = active !== null ? projects[active] : null

  return (
    <div ref={box} className="relative" onPointerMove={move} onPointerLeave={() => setActive(null)}>
      <ul className="border-t-2 border-current">
        {projects.map((p, i) => (
          <li key={p.slug} className="border-b">
            <a
              href={href}
              onPointerEnter={() => { setMode("pointer"); setActive(i) }}
              onFocus={() => { setMode("focus"); setActive(i) }}
              onBlur={() => setActive(null)}
              className="hover:bg-chart-1 hover:text-[var(--studio-on-accent)] focus-visible:bg-chart-1 focus-visible:text-[var(--studio-on-accent)] group grid grid-cols-[1fr_auto] items-baseline gap-4 px-2 py-6 outline-none transition-colors sm:grid-cols-[3rem_1fr_10rem_5rem] sm:px-4 motion-reduce:transition-none"
            >
              <span className="text-muted-foreground group-hover:text-[var(--studio-on-accent)] group-focus-visible:text-[var(--studio-on-accent)] hidden text-sm sm:block" style={mono}>{String(i + 1).padStart(2, "0")}</span>
              <span className={cn("text-[clamp(2rem,6.4vw,5.5rem)] text-balance", studioDisplay)}>{p.name}</span>
              <span className="group-hover:text-[var(--studio-on-accent)] group-focus-visible:text-[var(--studio-on-accent)] text-muted-foreground hidden text-sm sm:block" style={mono}>{p.discipline}</span>
              <span className="group-hover:text-[var(--studio-on-accent)] group-focus-visible:text-[var(--studio-on-accent)] text-muted-foreground text-end text-sm tabular-nums" style={mono}>{p.year}</span>
            </a>
          </li>
        ))}
      </ul>
      <div
        ref={card}
        aria-hidden="true"
        className={cn("pointer-events-none absolute top-0 start-0 z-10 hidden w-72 will-change-transform md:block", shown ? "opacity-100" : "opacity-0", "transition-opacity duration-200 motion-reduce:transition-none")}
        style={mode === "focus" || reduce ? { transform: `translate(calc(100% - 20rem), ${(active ?? 0) * 7.2}rem)` } : undefined}
      >
        {shown && (<div className="border-foreground bg-background overflow-hidden rounded border-2 shadow-2xl"><StudioArt variant={shown.art} /><p className="border-t-2 px-3 py-2 text-sm font-semibold">{shown.line}</p></div>)}
      </div>
    </div>
  )
}

type StudioHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<StudioHrefs> }

/** The Studio home page: a huge statement, a hover-reveal work reel, services, process and a loud call to action. */
function StudioHome({ hrefs, ...props }: StudioHomeProps) {
  const h = { work: hrefs?.work ?? "/studio/work", project: hrefs?.project ?? "/studio/work/north-coast", services: hrefs?.services ?? "/studio/services", contact: hrefs?.contact ?? "/studio/contact" }
  return (
    <StudioShell page="home" hrefs={hrefs} {...props}>
      <main>
        <section className="mx-auto max-w-[100rem] px-4 pt-10 pb-12 sm:px-8 sm:pt-16">
          <p className="text-muted-foreground text-sm" style={mono}>Independent branding &amp; digital studio · est. 2016</p>
          <h1 className={cn("mt-6 text-[clamp(2.8rem,9.2vw,10rem)]", studioDisplay)}>
            <span className="block">We make</span>
            <span className="block">brands that</span>
            <span className="block"><span className="bg-chart-1 inline-block px-[0.12em] text-[var(--studio-on-accent)]">move</span> people.</span>
          </h1>
          <div className="mt-12 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
            <p className="max-w-xl text-xl text-pretty sm:text-2xl">Hollis &amp; Vane is a 14-person studio in Lisbon and Berlin. We design identities, websites and campaigns for people who would rather be remembered than liked.</p>
            <a href={h.work} className="bg-foreground text-background focus-visible:ring-ring/50 inline-flex h-14 items-center gap-2 rounded-full px-8 text-lg font-bold outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] motion-reduce:transition-none">See the work <ArrowUpRight className="size-5 rtl:-scale-x-100" aria-hidden="true" /></a>
          </div>
        </section>

        <section aria-label="Clients" className="border-foreground bg-foreground text-background border-y-2 py-5">
          <Marquee speed={60} gap={56} pauseOnHover>
            {["North Coast", "Oat & Ember", "Meridian", "Tidal", "Pilot", "Alder & Co", "Fernhill", "Kestrel"].map((c) => <span key={c} className={cn("flex items-center gap-14 text-4xl sm:text-5xl", studioDisplay)}>{c}<span className="bg-chart-1 size-4 rounded-full" aria-hidden="true" /></span>)}
          </Marquee>
        </section>

        <section id="work" aria-labelledby="st-work" className="mx-auto max-w-[100rem] px-4 py-24 sm:px-8">
          <div className="mb-10 flex items-end justify-between gap-4"><h2 id="st-work" className={cn("text-[clamp(2.4rem,7vw,6rem)]", studioDisplay)}>Selected work</h2><p className="text-muted-foreground hidden text-sm sm:block" style={mono}>Hover a row</p></div>
          <WorkReel href={h.project} />
        </section>

        <section aria-labelledby="st-services" className="border-t-2 border-current">
          <div className="mx-auto grid max-w-[100rem] gap-12 px-4 py-24 sm:px-8 lg:grid-cols-[1fr_2fr]">
            <div><h2 id="st-services" className={cn("text-[clamp(2.4rem,6vw,5rem)]", studioDisplay)}>What we do</h2><a href={h.services} className="mt-6 inline-flex items-center gap-2 font-bold underline decoration-2 underline-offset-8">All services <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" /></a></div>
            <ul className="divide-y-2 border-y-2">
              {services.map((s) => (
                <li key={s.n} className="grid gap-3 py-8 sm:grid-cols-[4rem_1fr]">
                  <span className="bg-chart-1 h-fit w-fit px-2 py-0.5 text-lg font-bold text-[var(--studio-on-accent)]" style={mono}>{s.n}</span>
                  <div><h3 className={cn("text-3xl", studioDisplay)}>{s.title}</h3><p className="text-muted-foreground mt-3 max-w-xl text-pretty">{s.text}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="st-process" className="bg-chart-2 text-white">
          <div className="mx-auto max-w-[100rem] px-4 py-24 sm:px-8">
            <h2 id="st-process" className={cn("text-[clamp(2.4rem,6vw,5rem)]", studioDisplay)}>How we work</h2>
            <ol className="mt-14 grid gap-px bg-white/30 md:grid-cols-3">
              {process.map(([t, d], i) => (
                <li key={t} className="bg-chart-2 p-8 md:p-10">
                  <span className="text-sm" style={mono}>Step {i + 1}</span>
                  <h3 className={cn("mt-4 text-5xl", studioDisplay)}>{t}</h3>
                  <p className="mt-5 text-lg text-pretty opacity-90">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-[100rem] px-4 py-24 sm:px-8">
          <blockquote className={cn("max-w-6xl text-[clamp(1.8rem,4.6vw,4rem)] leading-[1.05] normal-case", studioDisplay.replace("uppercase", ""))}>“They didn’t give us a logo. They gave us a way of behaving, and now the whole company does it.”</blockquote>
          <p className="text-muted-foreground mt-8 text-sm" style={mono}>Anaïs Dupont · CMO, North Coast Rail</p>
        </section>

        <section className="bg-chart-1 text-[var(--studio-on-accent)]">
          <a href={h.contact} className="group focus-visible:ring-ring mx-auto flex max-w-[100rem] items-center justify-between gap-6 px-4 py-16 outline-none focus-visible:ring-[3px] focus-visible:ring-inset sm:px-8 sm:py-24">
            <span className={cn("text-[clamp(3rem,11vw,10rem)]", studioDisplay)}>Let’s talk</span>
            <ArrowUpRight className="size-[clamp(3rem,10vw,9rem)] shrink-0 transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-2" strokeWidth={1.5} aria-hidden="true" />
          </a>
        </section>
      </main>
    </StudioShell>
  )
}

export { StudioHome, type StudioHomeProps }
