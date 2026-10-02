// Ballmac UI: Portfolio home page. https://ui.ballmac.com/templates/template-portfolio
"use client"

import * as React from "react"
import { ArrowDownRight, ArrowUpRight, BookOpen, Headphones, Hammer, MapPin } from "lucide-react"

import { BlurFade } from "@/components/ballmac/blur-fade"
import { Marquee } from "@/components/ballmac/marquee"
import { posts, projects } from "@/components/ballmac/templates/portfolio/portfolio-data"
import { Cover, PortfolioShell, type PortfolioHrefs } from "@/components/ballmac/templates/portfolio/portfolio-theme"
import { cn } from "@/lib/utils"

const mono = { fontFamily: "var(--portfolio-mono)" } as const

const quotes = [
  ["Ines made the hard thing feel obvious. Our activation rate said so.", "Sasha Petrova, Fernhill"],
  ["The calmest designer I have ever worked with, and the sharpest.", "Marcus Lindqvist, Halcyon"],
  ["She cut our component library in half and everyone thanked her.", "Priya Raman, Lumen Health"],
  ["We hired Ines for a logo and got a company worth working for.", "Tom Beltrán, Paddock"],
]

function Pill({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <span aria-hidden="true" className={cn("mx-1 inline-block h-[0.72em] w-[1.6em] rounded-full align-[-0.06em] sm:mx-2", className)}>{children}</span>
}

type PortfolioHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<PortfolioHrefs> }

/** The Portfolio home page: a bold intro, a work grid whose cards reveal a result on hover and focus, an about bento, kind words and recent writing. */
function PortfolioHome({ hrefs, ...props }: PortfolioHomeProps) {
  const h = { work: hrefs?.work ?? "/portfolio/work", case: hrefs?.case ?? "/portfolio/work/fernhill", writing: hrefs?.writing ?? "/portfolio/writing" }
  return (
    <PortfolioShell page="home" hrefs={hrefs} {...props}>
      <main>
        <section className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-8 sm:pt-24">
          <BlurFade>
            <p className="text-muted-foreground text-sm" style={mono}>Independent product designer · 9 years · Lisbon</p>
            <h1 className="mt-6 max-w-6xl text-[clamp(2.6rem,8.6vw,8rem)] leading-[0.94] font-semibold tracking-[-0.05em] text-balance">
              I design products people <Pill className="bg-chart-1" />finish <Pill className="bg-chart-2" />using, and teams <Pill className="bg-chart-3" />enjoy shipping.
            </h1>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href="#work" className="bg-foreground text-background focus-visible:ring-ring/50 inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Selected work <ArrowDownRight className="size-4 rtl:-scale-x-100" aria-hidden="true" /></a>
              <a href={h.writing} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-12 items-center rounded-full border px-6 font-semibold outline-none transition-colors focus-visible:ring-[3px]">Read my writing</a>
            </div>
          </BlurFade>
        </section>

        <section aria-label="Skills" className="border-y py-5">
          <Marquee speed={40} gap={40} pauseOnHover>
            {["Product design", "Design systems", "Prototyping", "Research", "Brand", "Workshops", "Art direction", "Front-end"].map((s) => <span key={s} className="text-muted-foreground flex items-center gap-10 text-2xl font-medium tracking-tight sm:text-3xl">{s}<span className="bg-chart-1 size-2.5 rounded-full" aria-hidden="true" /></span>)}
          </Marquee>
        </section>

        <section id="work" aria-labelledby="pf-work" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 id="pf-work" className="text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Selected work</h2>
            <a href={h.work} className="focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full text-sm font-semibold underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">All projects <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" /></a>
          </div>
          <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2">
            {projects.slice(0, 4).map((p, i) => (
              <li key={p.slug} className={cn(i % 2 === 1 && "sm:mt-16")}>
                <a href={h.case} className="group focus-visible:ring-ring/50 block rounded-3xl outline-none focus-visible:ring-[3px] focus-visible:ring-offset-4 focus-visible:ring-offset-background">
                  <div className="relative overflow-hidden rounded-3xl border">
                    <Cover variant={p.cover} image={p.image} imageAlt={p.imageAlt} className="transition-transform duration-700 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none" />
                    <div className="bg-chart-1 text-[var(--portfolio-on-accent)] absolute end-4 bottom-4 flex translate-y-3 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none">
                      {p.result} <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-balance">{p.title}</h3>
                      <p className="text-muted-foreground mt-1 text-pretty">{p.blurb}</p>
                    </div>
                    <p className="text-muted-foreground shrink-0 text-sm" style={mono}>{p.client}<br />{p.year}</p>
                  </div>
                  <p className="sr-only">Result: {p.result}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="pf-about" className="mx-auto max-w-7xl px-4 pb-20 sm:px-8">
          <h2 id="pf-about" className="sr-only">About</h2>
          <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
            <div className="bg-chart-1 text-[var(--portfolio-on-accent)] relative flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl p-7 md:col-span-2 md:row-span-2">
              <div aria-hidden="true" className="absolute -top-8 -end-8 size-56 rounded-full border-[28px] border-current opacity-15" />
              <div aria-hidden="true" className="absolute top-6 start-6 flex size-24 items-center justify-center rounded-full bg-primary text-4xl font-semibold text-background">IC</div>
              <p className="text-3xl leading-tight font-semibold tracking-[-0.03em] text-balance sm:text-4xl">Hi, I’m Ines. I turn tangled products into ones that feel obvious.</p>
              <p className="mt-3 max-w-md text-pretty opacity-80">Nine years across fintech, health and developer tools. Before going independent I led design at Fernhill and Lumen Health.</p>
            </div>
            <div className="bg-card rounded-3xl border p-6">
              <p className="text-muted-foreground flex items-center gap-2 text-xs" style={mono}><MapPin className="size-3.5" aria-hidden="true" />Based in</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Lisbon</p>
              <p className="text-muted-foreground mt-1 text-sm">Working across Europe and the US East Coast.</p>
            </div>
            <div className="bg-foreground text-background rounded-3xl p-6">
              <dl className="space-y-5">
                <div><dd className="text-5xl font-semibold tracking-[-0.04em] tabular-nums">9</dd><dt className="text-sm opacity-75">years designing</dt></div>
                <div><dd className="text-5xl font-semibold tracking-[-0.04em] tabular-nums">40+</dd><dt className="text-sm opacity-75">products launched</dt></div>
              </dl>
            </div>
            <div className="bg-card rounded-3xl border p-6 md:col-span-2">
              <p className="text-muted-foreground text-xs" style={mono}>Right now</p>
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {[[Hammer, "Building", "A pricing experiment kit for Tessera"], [BookOpen, "Reading", "The Timeless Way of Building"], [Headphones, "Listening", "Fela Kuti, on repeat"]].map(([Icon, k, v]) => {
                  const I = Icon as typeof Hammer
                  return <li key={k as string}><I className="size-5" aria-hidden="true" /><p className="mt-3 text-sm font-semibold">{k as string}</p><p className="text-muted-foreground text-sm text-pretty">{v as string}</p></li>
                })}
              </ul>
            </div>
          </div>
        </section>

        <section aria-label="Kind words" className="border-y py-10">
          <Marquee speed={32} gap={48} reverse pauseOnHover>
            {quotes.map(([q, who]) => (
              <figure key={who} className="w-[26rem] max-w-[80vw]">
                <blockquote className="text-xl leading-snug font-medium tracking-[-0.02em] text-balance">“{q}”</blockquote>
                <figcaption className="text-muted-foreground mt-3 text-sm" style={mono}>{who}</figcaption>
              </figure>
            ))}
          </Marquee>
        </section>

        <section aria-labelledby="pf-writing" className="mx-auto max-w-7xl px-4 pt-20 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 id="pf-writing" className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Recent writing</h2>
            <a href={h.writing} className="focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full text-sm font-semibold underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">All posts <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" /></a>
          </div>
          <ul className="mt-8 divide-y border-y">
            {posts.slice(0, 3).map((p) => (
              <li key={p.slug}>
                <a href={h.writing} className="hover:bg-accent/60 focus-visible:ring-ring/50 group -mx-3 grid grid-cols-[1fr_auto] items-baseline gap-4 rounded-2xl px-3 py-5 outline-none transition-colors focus-visible:ring-[3px] sm:grid-cols-[1fr_8rem_6rem]">
                  <span className="text-xl font-semibold tracking-[-0.02em] text-balance sm:text-2xl">{p.title}</span>
                  <span className="text-muted-foreground hidden text-sm sm:block" style={mono}>{p.tag}</span>
                  <span className="text-muted-foreground text-end text-sm tabular-nums" style={mono}>{p.read} min</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </PortfolioShell>
  )
}

export { PortfolioHome, type PortfolioHomeProps }
