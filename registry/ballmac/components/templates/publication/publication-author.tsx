// Ballmac UI: Publication author page. https://ui.ballmac.com/templates/template-publication
import * as React from "react"

import { articles, authors, formatShort } from "@/components/ballmac/templates/publication/publication-data"
import { MagArt, PublicationShell, pubSerifClass, pubTextClass, type PublicationHrefs } from "@/components/ballmac/templates/publication/publication-theme"
import { cn } from "@/lib/utils"

type PublicationAuthorProps = React.ComponentProps<"div"> & { hrefs?: Partial<PublicationHrefs>; authorId?: string }

/** A Publication author page: portrait initials, a bio, the byline count and every story they wrote. */
function PublicationAuthor({ hrefs, authorId = "ines", ...props }: PublicationAuthorProps) {
  const au = authors.find((x) => x.id === authorId) ?? authors[0]
  const mine = articles.filter((a) => a.author === au.id)
  const total = mine.reduce((n, a) => n + a.read, 0)
  const a = hrefs?.article ?? "/publication/essays/the-unfinished-city"
  return (
    <PublicationShell page="author" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-4xl px-4 pt-12 sm:px-6">
        <header className="grid gap-8 border-b-4 border-double border-foreground pb-10 sm:grid-cols-[10rem_1fr] sm:items-center">
          <span className={cn("flex size-36 items-center justify-center rounded-full text-6xl sm:size-40", pubSerifClass, ["bg-chart-3 text-[var(--publication-on-accent)]", "bg-chart-5 text-[var(--publication-on-accent)]", "bg-chart-4 text-background", "bg-secondary text-secondary-foreground"][au.tone - 1])} aria-hidden="true">{au.name.split(" ").map((w) => w[0]).join("")}</span>
          <div>
            <p className="text-chart-1 text-xs font-bold tracking-[0.14em] uppercase">{au.role}</p>
            <h1 className={cn("mt-2 text-[clamp(2.8rem,7vw,4.8rem)] leading-none", pubSerifClass)}>{au.name}</h1>
            <p className={cn("text-muted-foreground mt-4 max-w-xl text-xl leading-relaxed text-pretty", pubTextClass)}>{au.bio}</p>
            <dl className="mt-5 flex gap-8 text-sm"><div><dd className="text-2xl font-bold tabular-nums">{mine.length}</dd><dt className="text-muted-foreground">stories</dt></div><div><dd className="text-2xl font-bold tabular-nums">{total}</dd><dt className="text-muted-foreground">minutes of reading</dt></div></dl>
          </div>
        </header>
        <section aria-labelledby="pub-by" className="mt-10">
          <h2 id="pub-by" className="text-sm font-bold tracking-[0.14em] uppercase">Stories by {au.name.split(" ")[0]}</h2>
          <ul className="divide-y">
            {mine.map((s) => (
              <li key={s.id}><a href={a} className="group focus-visible:ring-ring/50 grid gap-5 rounded py-7 outline-none focus-visible:ring-[3px] sm:grid-cols-[1fr_12rem]"><div><p className="text-chart-1 text-xs font-bold tracking-[0.14em] uppercase">{s.section} · {formatShort(s.date)}</p><h3 className={cn("mt-2 text-3xl leading-tight text-balance group-hover:underline underline-offset-4", pubSerifClass)}>{s.title}</h3><p className={cn("text-muted-foreground mt-2 text-pretty", pubTextClass)}>{s.dek}</p></div><MagArt variant={s.art} className="order-first sm:order-none" /></a></li>
            ))}
          </ul>
        </section>
      </main>
    </PublicationShell>
  )
}

export { PublicationAuthor, type PublicationAuthorProps }
