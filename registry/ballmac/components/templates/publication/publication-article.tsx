// Ballmac UI: Publication article page. https://ui.ballmac.com/templates/template-publication
"use client"

import * as React from "react"
import { Link2 } from "lucide-react"

import { CopyButton } from "@/components/ballmac/copy-button"
import { ScrollProgress } from "@/components/ballmac/scroll-progress"
import { articles, formatDate, getAuthor } from "@/components/ballmac/templates/publication/publication-data"
import { Newsletter } from "@/components/ballmac/templates/publication/publication-home"
import { MagArt, PublicationShell, pubSerifClass, pubTextClass, type PublicationHrefs } from "@/components/ballmac/templates/publication/publication-theme"
import { cn } from "@/lib/utils"

/** A paragraph with an optional margin note: beside the text on wide screens, under it on small ones. */
function Para({ children, note, n }: { children: React.ReactNode; note?: string; n?: number }) {
  return (
    <div className="relative">
      <p className={cn("text-[1.1875rem] leading-[1.8] text-pretty", pubTextClass)}>
        {children}
        {n && <sup className="ms-0.5"><a href={`#note-${n}`} id={`ref-${n}`} className="text-chart-1 focus-visible:ring-ring/50 rounded px-0.5 font-sans text-xs font-bold outline-none focus-visible:ring-[3px]" aria-label={`Note ${n}`}>{n}</a></sup>}
      </p>
      {note && n && (
        <aside id={`note-${n}`} aria-label={`Note ${n}`} className="text-muted-foreground border-chart-1 mt-3 border-s-2 ps-4 text-sm leading-relaxed xl:absolute xl:top-0 xl:start-full xl:mt-0 xl:ms-10 xl:w-56 xl:border-s-0 xl:ps-0">
          <span className="text-chart-1 me-1.5 font-bold">{n}</span>{note}
        </aside>
      )}
    </div>
  )
}

type PublicationArticleProps = React.ComponentProps<"div"> & { hrefs?: Partial<PublicationHrefs> }

/** The Publication article page: a reading-progress bar, drop cap, margin notes that sit beside the text on wide screens, a pull quote and an author card. */
function PublicationArticle({ hrefs, ...props }: PublicationArticleProps) {
  const a = articles[0]
  const au = getAuthor(a.author)
  const related = articles.slice(1, 4)
  return (
    <PublicationShell page="article" section="Essays" hrefs={hrefs} {...props}>
      <ScrollProgress position="top" className="[&>*]:bg-chart-1" />
      <main>
        <header className="mx-auto max-w-3xl px-4 pt-12 text-center sm:px-6">
          <p className="text-chart-1 text-xs font-bold tracking-[0.14em] uppercase">{a.section} · {a.kicker}</p>
          <h1 className={cn("mt-4 text-[clamp(2.6rem,6.4vw,4.8rem)] leading-[1.02] tracking-[-0.01em] text-balance", pubSerifClass)}>{a.title}</h1>
          <p className={cn("text-muted-foreground mt-5 text-xl leading-relaxed text-pretty", pubTextClass)}>{a.dek}</p>
          <div className="mt-7 flex items-center justify-center gap-3 text-sm">
            <span className={cn("bg-chart-3 text-[var(--publication-on-accent)] flex size-11 items-center justify-center rounded-full text-base", pubSerifClass)} aria-hidden="true">IM</span>
            <p className="text-start"><span className="block font-semibold">By {au.name}</span><span className="text-muted-foreground">{formatDate(a.date)} · {a.read} min read</span></p>
          </div>
        </header>
        <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6"><MagArt variant={a.art} image={a.image} imageAlt={a.imageAlt} className="aspect-[16/8]" /><p className="text-muted-foreground mt-2 text-xs">Scaffolding on Rua da Madalena, Lisbon. Illustration.</p></div>

        <article className="mx-auto mt-12 max-w-[40rem] space-y-7 px-4 sm:px-6">
          <div className="relative">
            <p className={cn("first-letter:float-start first-letter:me-3 first-letter:text-[5.2rem] first-letter:leading-[0.8] first-letter:font-bold first-letter:[font-family:var(--pub-display)] text-[1.1875rem] leading-[1.8] text-pretty", pubTextClass)}>
              There is a street near my flat that has been covered in scaffolding for as long as I have lived here. The poles have weathered, a pigeon has opinions about the third floor, and the building behind it appears to be neither getting worse nor better. I used to find it depressing.<sup className="ms-0.5"><a href="#note-1" id="ref-1" className="text-chart-1 focus-visible:ring-ring/50 rounded px-0.5 font-sans text-xs font-bold outline-none focus-visible:ring-[3px]" aria-label="Note 1">1</a></sup>
            </p>
            <aside id="note-1" aria-label="Note 1" className="text-muted-foreground border-chart-1 mt-3 border-s-2 ps-4 text-sm leading-relaxed xl:absolute xl:top-0 xl:start-full xl:mt-0 xl:ms-10 xl:w-56 xl:border-s-0 xl:ps-0"><span className="text-chart-1 me-1.5 font-bold">1</span>The building is a 1920s tenement. The scaffold went up in 2019 after a cornice fell on a parked car.</aside>
          </div>
          <Para n={2} note="Jane Jacobs made this point in 1961. Cities, she wrote, need old buildings, and a great many of them, mixed in with the new.">Then I started to notice how many of the places I love are unfinished in exactly this way: the cathedral with a crane, the square half dug up, the market that is always about to be renovated. A city that is finished is a museum.</Para>
          <h2 className={cn("pt-4 text-3xl leading-tight text-balance", pubSerifClass)}>What patience looks like in stone</h2>
          <Para>Stonemasons talk about work they will never see completed. The medieval builders of a cathedral knew they would die before the spire went up, and they built the foundations for a roof they would never stand under. We have mostly lost that habit of mind.</Para>
          <blockquote className="border-foreground my-10 border-y-4 border-double py-8 text-center"><p className={cn("text-[clamp(1.7rem,3.6vw,2.4rem)] leading-tight text-balance", pubSerifClass)}>“A city that is finished is a museum.”</p></blockquote>
          <Para n={3} note="The scaffold on the Rua da Madalena has a name among neighbours: ‘o esqueleto’. The skeleton.">I asked the neighbours what they thought. Nobody wanted it gone. They had named it, mapped their bicycles to its poles and learned which floor had the best light. The scaffold had become part of the street’s grammar.</Para>
          <Para>None of this is an argument for neglect. It is an argument for noticing that the stage between the old and the new is not a failure, and for learning to live there gracefully, perhaps even with affection.</Para>
        </article>

        <div className="mx-auto mt-14 flex max-w-[40rem] flex-wrap items-center justify-between gap-4 border-y px-4 py-4 sm:px-6">
          <p className="text-muted-foreground text-sm">Filed under <a href={hrefs?.section ?? "/publication/essays"} className="text-foreground font-semibold underline-offset-4 hover:underline">Essays</a></p>
          <div className="flex items-center gap-2"><span className="text-sm font-semibold">Share</span><CopyButton value="https://marginalia.example/essays/the-unfinished-city" ariaLabel="Copy link to this article" /></div>
        </div>

        <aside aria-labelledby="pub-author" className="mx-auto mt-10 flex max-w-[40rem] gap-5 px-4 sm:px-6">
          <span className={cn("bg-chart-3 text-[var(--publication-on-accent)] flex size-16 shrink-0 items-center justify-center rounded-full text-2xl", pubSerifClass)} aria-hidden="true">IM</span>
          <div><h2 id="pub-author" className="font-semibold">About {au.name}</h2><p className={cn("text-muted-foreground mt-1 text-pretty", pubTextClass)}>{au.bio}</p><a href={hrefs?.author ?? "/publication/authors/ines"} className="text-chart-1 mt-2 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"><Link2 className="size-4" aria-hidden="true" />More by {au.name.split(" ")[0]}</a></div>
        </aside>

        <section aria-labelledby="pub-related" className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
          <h2 id="pub-related" className="border-foreground border-b-2 pb-2 text-sm font-bold tracking-[0.14em] uppercase">Keep reading</h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-3">{related.map((r) => <li key={r.id}><a href={hrefs?.article ?? "#"} className="group focus-visible:ring-ring/50 block rounded outline-none focus-visible:ring-[3px]"><MagArt variant={r.art} image={r.image} imageAlt={r.imageAlt} /><h3 className={cn("mt-4 text-2xl leading-tight text-balance group-hover:underline underline-offset-4", pubSerifClass)}>{r.title}</h3><p className="text-muted-foreground mt-2 text-sm">{getAuthor(r.author).name} · {r.read} min</p></a></li>)}</ul>
        </section>
        <div className="mx-auto mt-16 max-w-6xl px-4 sm:px-6"><Newsletter tone="ink" /></div>
      </main>
    </PublicationShell>
  )
}

export { PublicationArticle, type PublicationArticleProps }
