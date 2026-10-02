// Ballmac UI: Docs changelog page. https://ui.ballmac.com/templates/template-docs
"use client"

import * as React from "react"
import { Rss } from "lucide-react"

import { releases, type Release } from "@/components/ballmac/templates/docs/docs-data"
import { DocsShell, docsMonoClass, docsSerifClass, type DocsHrefs } from "@/components/ballmac/templates/docs/docs-theme"
import { cn } from "@/lib/utils"

const tags = ["All", "Added", "Improved", "Fixed", "Breaking"] as const
const tagStyle: Record<Release["tag"], string> = { Added: "bg-chart-4/15", Improved: "bg-chart-2/15", Fixed: "bg-chart-3/20", Breaking: "bg-destructive/15" }
/** Renders `code` spans written with backticks. */
function Ticks({ text }: { text: string }) {
  return <>{text.split("`").map((part, i) => (i % 2 === 1 ? <code key={i} className={cn("bg-muted rounded px-1 py-0.5 text-[0.85em]", docsMonoClass)}>{part}</code> : <React.Fragment key={i}>{part}</React.Fragment>))}</>
}
const fmt = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })

type DocsChangelogProps = React.ComponentProps<"div"> & { hrefs?: Partial<DocsHrefs> }

/** The changelog: a version rail, tag filters and each release with its upgrade notes. */
function DocsChangelog({ hrefs, ...props }: DocsChangelogProps) {
  const [tag, setTag] = React.useState<(typeof tags)[number]>("All")
  const list = releases.filter((r) => tag === "All" || r.tag === tag)
  return (
    <DocsShell page="changelog" hrefs={hrefs} {...props}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 px-4 py-10 sm:px-8 xl:grid-cols-[minmax(0,1fr)_14rem]">
        <main className="mx-auto w-full min-w-0 max-w-3xl">
          <h1 className={cn("text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.05]", docsSerifClass)}>Changelog</h1>
          <p className="text-muted-foreground mt-4 text-xl text-pretty">What shipped, what changed and what to do about it. Breaking changes always get a major version and a month of notice.</p>
          <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter releases">
            {tags.map((t) => <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(t)} className="hover:bg-accent focus-visible:ring-ring/50 aria-pressed:bg-primary aria-pressed:text-primary-foreground h-9 rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-[3px]">{t}</button>)}
            <a href="/docs/changelog.xml" className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 ms-auto inline-flex items-center gap-1.5 rounded-md text-sm font-medium outline-none focus-visible:ring-[3px]"><Rss className="size-4" aria-hidden="true" />RSS</a>
          </div>
          <p role="status" className="text-muted-foreground mt-4 text-sm">{list.length} {list.length === 1 ? "release" : "releases"}</p>
          <ol className="mt-4">
            {list.map((r, i) => (
              <li key={r.version} id={`v${r.version}`} className="relative grid scroll-mt-24 grid-cols-[1.5rem_minmax(0,1fr)] gap-x-4">
                <div className="flex flex-col items-center"><span aria-hidden="true" className={cn("mt-2 size-3 rounded-full border-2", r.tag === "Breaking" ? "border-destructive bg-destructive" : "border-primary bg-background")} />{i < list.length - 1 && <span aria-hidden="true" className="bg-border mt-1 w-px flex-1" />}</div>
                <article aria-labelledby={`r-${r.version}`} className="pb-12">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={cn("bg-secondary rounded-md px-2 py-0.5 text-xs font-bold", docsMonoClass)}>{r.version}</span>
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", tagStyle[r.tag])}>{r.tag}</span>
                    <time dateTime={r.date} className="text-muted-foreground">{fmt(r.date)}</time>
                  </div>
                  <h2 id={`r-${r.version}`} className={cn("mt-3 text-3xl", docsSerifClass)}>{r.title}</h2>
                  <p className="mt-2 text-pretty"><Ticks text={r.body} /></p>
                  <ul className="mt-4 grid gap-2">{r.points.map((p) => <li key={p} className="text-muted-foreground flex gap-3 text-sm"><span className="bg-border mt-2 size-1.5 shrink-0 rounded-full" aria-hidden="true" /><span className="text-pretty"><Ticks text={p} /></span></li>)}</ul>
                </article>
              </li>
            ))}
          </ol>
          {list.length === 0 && <p className="text-muted-foreground py-10 text-center">No releases with this tag yet.</p>}
        </main>
        <aside className="hidden xl:block" aria-label="Versions"><div className="sticky top-24"><h2 className="text-xs font-bold tracking-[0.12em] uppercase">Versions</h2><ul className="mt-3 grid gap-1 border-s text-sm">{releases.map((r) => <li key={r.version}><a href={`#v${r.version}`} className={cn("text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 -ms-px block rounded-e-md border-s-2 border-transparent px-3 py-1 outline-none hover:border-current focus-visible:ring-[3px]", docsMonoClass)}>{r.version}</a></li>)}</ul></div></aside>
      </div>
    </DocsShell>
  )
}

export { DocsChangelog, type DocsChangelogProps }
