// Ballmac UI: Publication section page. https://ui.ballmac.com/templates/template-publication
"use client"

import * as React from "react"

import { articles, formatShort, getAuthor, sections, type Section } from "@/components/ballmac/templates/publication/publication-data"
import { MagArt, PublicationShell, pubSerifClass, pubTextClass, type PublicationHrefs } from "@/components/ballmac/templates/publication/publication-theme"
import { cn } from "@/lib/utils"

const descriptions: Record<string, string> = { Essays: "Long arguments, patiently made. New essays every week.", Culture: "Food, music, books and the small rituals of daily life.", Science: "Field work, deep time and the people who count things.", Technology: "Slow technology: tools, craft and the people who make them.", Interviews: "Unhurried conversations with writers and makers." }

type PublicationSectionProps = React.ComponentProps<"div"> & { hrefs?: Partial<PublicationHrefs>; initial?: Section | "All" }

/** A Publication section page: a topic switch, a sort, a story list with thumbnails and a "load more" that adds stories. */
function PublicationSection({ hrefs, initial = "Essays", ...props }: PublicationSectionProps) {
  const [section, setSection] = React.useState<Section | "All">(initial)
  const [sort, setSort] = React.useState<"new" | "long">("new")
  const [count, setCount] = React.useState(4)
  const list = articles.filter((a) => section === "All" || a.section === section).sort((a, b) => (sort === "new" ? b.date.localeCompare(a.date) : b.read - a.read))
  const shown = list.slice(0, count)
  const a = hrefs?.article ?? "/publication/essays/the-unfinished-city"
  return (
    <PublicationShell page="section" section={section === "All" ? undefined : section} hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
        <p className="text-chart-1 text-xs font-bold tracking-[0.14em] uppercase">Section</p>
        <h1 className={cn("mt-2 text-[clamp(3rem,8vw,5.5rem)] leading-none", pubSerifClass)}>{section === "All" ? "Everything" : section}</h1>
        <p className={cn("text-muted-foreground mt-4 max-w-xl text-xl text-pretty", pubTextClass)}>{section === "All" ? "Every story, newest first." : descriptions[section]}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3 border-y py-3">
          <div role="group" aria-label="Choose a section" className="flex flex-wrap gap-1.5">
            {(["All", ...sections] as const).map((s) => <button key={s} type="button" aria-pressed={section === s} onClick={() => { setSection(s); setCount(4) }} className={cn("focus-visible:ring-ring/50 h-9 rounded-full border px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px]", section === s ? "bg-foreground text-background border-transparent" : "hover:bg-accent")}>{s}</button>)}
          </div>
          <label className="text-muted-foreground ms-auto flex items-center gap-2 text-sm">Sort <select value={sort} onChange={(e) => setSort(e.target.value as "new" | "long")} className="bg-background focus-visible:ring-ring/50 text-foreground h-9 rounded border px-2 outline-none focus-visible:ring-[3px]"><option value="new">Newest</option><option value="long">Longest</option></select></label>
        </div>
        <p className="sr-only" role="status">Showing {shown.length} of {list.length} stories</p>
        {shown.length === 0 && <p className="text-muted-foreground mt-12 border border-dashed p-12 text-center">Nothing in this section yet.</p>}
        <ul className="divide-y">
          {shown.map((s) => (
            <li key={s.id}>
              <a href={a} className="group focus-visible:ring-ring/50 grid gap-5 rounded py-8 outline-none focus-visible:ring-[3px] sm:grid-cols-[1fr_14rem]">
                <div>
                  <p className="text-chart-1 text-xs font-bold tracking-[0.14em] uppercase">{s.section} · {s.kicker}</p>
                  <h2 className={cn("mt-2 text-3xl leading-tight text-balance group-hover:underline underline-offset-4 sm:text-4xl", pubSerifClass)}>{s.title}</h2>
                  <p className={cn("text-muted-foreground mt-3 text-pretty", pubTextClass)}>{s.dek}</p>
                  <p className="text-muted-foreground mt-4 text-sm">By <span className="text-foreground font-semibold">{getAuthor(s.author).name}</span> · {formatShort(s.date)} · {s.read} min</p>
                </div>
                <MagArt variant={s.art} image={s.image} imageAlt={s.imageAlt} className="order-first sm:order-none" />
              </a>
            </li>
          ))}
        </ul>
        {count < list.length && <div className="mt-6 text-center"><button type="button" onClick={() => setCount((c) => c + 4)} className="hover:bg-accent focus-visible:ring-ring/50 h-12 rounded-sm border-2 border-current px-8 text-sm font-bold tracking-wide uppercase outline-none transition-colors focus-visible:ring-[3px]">Load more stories</button></div>}
      </main>
    </PublicationShell>
  )
}

export { PublicationSection, type PublicationSectionProps }
