// Ballmac UI: Publication home page. https://ui.ballmac.com/templates/template-publication
"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { articles, formatShort, getAuthor, sections } from "@/components/ballmac/templates/publication/publication-data"
import { MagArt, PublicationShell, pubSerifClass, pubTextClass, type PublicationHrefs } from "@/components/ballmac/templates/publication/publication-theme"
import { cn } from "@/lib/utils"

const kicker = "text-chart-1 text-xs font-bold tracking-[0.14em] uppercase"

function Newsletter({ tone = "card" }: { tone?: "card" | "ink" }) {
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState("")
  const [done, setDone] = React.useState(false)
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter an email like you@example.com.")
    setError("")
    setDone(true)
  }
  return (
    <section aria-labelledby={`nl-${tone}`} className={cn("border-foreground border-y-4 border-double px-2 py-10 text-center sm:py-14", tone === "ink" && "bg-secondary")}>
      <p className={kicker}>The Sunday Margin</p>
      <h2 id={`nl-${tone}`} className={cn("mx-auto mt-3 max-w-xl text-4xl text-balance sm:text-5xl", pubSerifClass)}>One good essay, every Sunday morning.</h2>
      <p className={cn("text-muted-foreground mx-auto mt-3 max-w-md text-pretty", pubTextClass)}>Free, short and unhurried. Read by 41,000 people over breakfast.</p>
      {done ? (
        <p role="status" className="mt-6 inline-flex items-center gap-2 font-semibold"><Check className="text-chart-4 size-5" aria-hidden="true" />You’re on the list. See you Sunday.</p>
      ) : (
        <form onSubmit={submit} noValidate className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
          <label htmlFor={`nl-email-${tone}`} className="sr-only">Email address</label>
          <input id={`nl-email-${tone}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `nl-err-${tone}` : undefined} placeholder="you@example.com" className="bg-background focus-visible:ring-ring/50 placeholder:text-muted-foreground aria-[invalid=true]:border-destructive h-12 flex-1 rounded-sm border px-4 outline-none focus-visible:ring-[3px]" />
          <button type="submit" className="bg-foreground text-background focus-visible:ring-ring/50 h-12 rounded-sm px-6 text-sm font-bold tracking-wide uppercase outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Sign me up</button>
        </form>
      )}
      {error && <p id={`nl-err-${tone}`} role="alert" className="text-destructive mt-2 text-sm">{error}</p>}
    </section>
  )
}

type PublicationHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<PublicationHrefs> }

/** The Publication home page: a lead story with a dek, supporting stories, an opinion column, picks and a newsletter. */
function PublicationHome({ hrefs, ...props }: PublicationHomeProps) {
  const [lead, ...rest] = articles
  const side = rest.slice(0, 3)
  const grid = rest.slice(3, 6)
  const popular = [...articles].filter((a) => a.popular).sort((a, b) => (a.popular ?? 0) - (b.popular ?? 0))
  const a = hrefs?.article ?? "/publication/essays/the-unfinished-city"
  return (
    <PublicationShell page="home" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-10">
          <article>
            <a href={a} className="group focus-visible:ring-ring/50 block rounded outline-none focus-visible:ring-[3px]">
              <MagArt variant={lead.art} className="aspect-[16/10]" />
              <p className={cn("mt-5", kicker)}>{lead.kicker}</p>
              <h1 className={cn("mt-2 text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.02] tracking-[-0.01em] text-balance group-hover:underline decoration-1 underline-offset-4", pubSerifClass)}>{lead.title}</h1>
              <p className={cn("text-muted-foreground mt-4 max-w-2xl text-xl leading-relaxed text-pretty", pubTextClass)}>{lead.dek}</p>
              <p className="text-muted-foreground mt-4 text-sm">By <span className="text-foreground font-semibold">{getAuthor(lead.author).name}</span> · {lead.read} min read</p>
            </a>
          </article>
          <aside aria-label="More stories" className="lg:border-l lg:pl-10">
            <ul className="divide-y">
              {side.map((s) => (
                <li key={s.id} className="py-5 first:pt-0 lg:last:pb-0">
                  <a href={a} className="group focus-visible:ring-ring/50 block rounded outline-none focus-visible:ring-[3px]">
                    <p className={kicker}>{s.section}</p>
                    <h2 className={cn("mt-1.5 text-2xl leading-tight text-balance group-hover:underline underline-offset-4", pubSerifClass)}>{s.title}</h2>
                    <p className="text-muted-foreground mt-2 text-sm">{getAuthor(s.author).name} · {s.read} min</p>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <section aria-label="Latest" className="mt-12 border-t-2 border-current pt-8">
          <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-3">
            {grid.map((g) => (
              <li key={g.id}>
                <a href={a} className="group focus-visible:ring-ring/50 block rounded outline-none focus-visible:ring-[3px]">
                  <MagArt variant={g.art} />
                  <p className={cn("mt-4", kicker)}>{g.section}</p>
                  <h3 className={cn("mt-1.5 text-2xl leading-tight text-balance group-hover:underline underline-offset-4", pubSerifClass)}>{g.title}</h3>
                  <p className={cn("text-muted-foreground mt-2 text-pretty", pubTextClass)}>{g.dek}</p>
                  <p className="text-muted-foreground mt-3 text-sm">{getAuthor(g.author).name} · {formatShort(g.date)}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_20rem]">
          <section aria-labelledby="pub-opinion">
            <h2 id="pub-opinion" className="border-foreground border-b-2 pb-2 text-sm font-bold tracking-[0.14em] uppercase">Opinion &amp; essays</h2>
            <ul className="divide-y">
              {articles.filter((x) => x.section === "Essays" || x.section === "Interviews").slice(1, 5).map((o) => {
                const au = getAuthor(o.author)
                return (
                  <li key={o.id} className="grid grid-cols-[3.5rem_1fr] gap-4 py-6">
                    <span className={cn("flex size-14 items-center justify-center rounded-full text-lg", pubSerifClass, ["bg-chart-3 text-[var(--publication-on-accent)]", "bg-chart-5 text-[var(--publication-on-accent)]", "bg-chart-4 text-background", "bg-secondary text-secondary-foreground"][au.tone - 1])} aria-hidden="true">{au.name.split(" ").map((w) => w[0]).join("")}</span>
                    <a href={a} className="group focus-visible:ring-ring/50 rounded outline-none focus-visible:ring-[3px]">
                      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{au.name}</p>
                      <h3 className={cn("mt-1 text-2xl leading-tight text-balance group-hover:underline underline-offset-4", pubSerifClass)}>{o.title}</h3>
                      <p className={cn("text-muted-foreground mt-1.5 text-pretty", pubTextClass)}>{o.dek}</p>
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>
          <aside aria-labelledby="pub-popular" className="bg-surface h-fit border p-6">
            <h2 id="pub-popular" className="text-sm font-bold tracking-[0.14em] uppercase">Most read</h2>
            <ol className="mt-4 space-y-5">
              {popular.map((p, i) => (
                <li key={p.id} className="grid grid-cols-[2rem_1fr] gap-2">
                  <span className={cn("text-chart-1 text-4xl leading-none", pubSerifClass)} aria-hidden="true">{i + 1}</span>
                  <a href={a} className={cn("hover:underline text-lg leading-snug text-balance underline-offset-4", pubSerifClass)}><span className="sr-only">{i + 1}. </span>{p.title}</a>
                </li>
              ))}
            </ol>
          </aside>
        </div>

        <div className="mt-16"><Newsletter /></div>
        <ul aria-label="Browse by section" className="mt-10 flex flex-wrap justify-center gap-2">{sections.map((s) => <li key={s}><a href={hrefs?.section ?? "/publication/essays"} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-10 items-center rounded-full border px-5 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px]">{s}</a></li>)}</ul>
      </main>
    </PublicationShell>
  )
}

export { Newsletter, PublicationHome, type PublicationHomeProps }
