// Ballmac UI: Docs search page. https://ui.ballmac.com/templates/template-docs
"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { searchIndex, type DocsKind } from "@/components/ballmac/templates/docs/docs-data"
import { DocsShell, docsKindStyle, docsMonoClass, docsSerifClass, type DocsHrefs } from "@/components/ballmac/templates/docs/docs-theme"
import { cn } from "@/lib/utils"

const kinds = ["All", "Guide", "API", "Changelog"] as const
const suggestions = ["retry", "idempotency", "dead letter", "visibility", "region"]

function Marked({ text, query }: { text: string; query: string }) {
  const terms = query.trim().split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  if (terms.length === 0) return <>{text}</>
  const parts = text.split(new RegExp(`(${terms.join("|")})`, "ig"))
  return <>{parts.map((p, i) => (i % 2 === 1 ? <mark key={i} className="bg-chart-3/35 text-foreground rounded-sm px-0.5">{p}</mark> : <React.Fragment key={i}>{p}</React.Fragment>))}</>
}

type DocsSearchProps = React.ComponentProps<"div"> & { hrefs?: Partial<DocsHrefs>; initialQuery?: string }

/** A full search page: filter by type, matches highlighted in titles and summaries, helpful suggestions when nothing matches. */
function DocsSearch({ hrefs, initialQuery = "message", ...props }: DocsSearchProps) {
  const [query, setQuery] = React.useState(initialQuery)
  const [kind, setKind] = React.useState<(typeof kinds)[number]>("All")
  const link = { guide: "/docs/guides", reference: "/docs/reference", changelog: "/docs/changelog", ...hrefs }
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const all = searchIndex.filter((e) => terms.every((t) => `${e.title} ${e.summary} ${e.path}`.toLowerCase().includes(t)))
  const results = all.filter((e) => kind === "All" || e.kind === kind)
  const count = (k: DocsKind) => all.filter((e) => e.kind === k).length
  return (
    <DocsShell page="search" hrefs={hrefs} sidebar={false} {...props}>
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className={cn("text-[clamp(2.4rem,6vw,4rem)] leading-none", docsSerifClass)}>Search</h1>
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-8">
          <label htmlFor="ds-q" className="sr-only">Search the docs</label>
          <div className="bg-card focus-within:ring-ring/50 relative rounded-xl border shadow-sm focus-within:ring-[3px]">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" aria-hidden="true" />
            <input id="ds-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search guides, endpoints and releases" className="h-14 w-full rounded-xl bg-transparent pr-4 pl-12 text-base outline-none" />
          </div>
        </form>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          {kinds.map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className="hover:bg-accent focus-visible:ring-ring/50 aria-pressed:bg-primary aria-pressed:text-primary-foreground inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-[3px]">
              {k === "API" ? "API reference" : k === "Guide" ? "Guides" : k === "Changelog" ? "Releases" : "Everything"}
              {k !== "All" && <span className={cn("text-xs opacity-100", docsMonoClass)}>{count(k)}</span>}
            </button>
          ))}
        </div>
        <p role="status" className="text-muted-foreground mt-6 text-sm">{results.length} {results.length === 1 ? "result" : "results"}{query.trim() ? <> for “{query.trim()}”</> : null}</p>
        {results.length > 0 ? (
          <ul className="mt-2 divide-y">
            {results.map((e) => (
              <li key={e.title}>
                <a href={link[e.page]} className="hover:bg-accent focus-visible:ring-ring/50 -mx-3 block rounded-xl px-3 py-5 outline-none focus-visible:ring-[3px]">
                  <span className="flex items-center gap-2 text-xs">
                    <span className={cn("rounded-md px-2 py-0.5 font-bold", docsKindStyle[e.kind])}>{e.kind === "API" ? "API" : e.kind}</span>
                    <span className={cn("text-muted-foreground truncate", e.kind === "API" && docsMonoClass)}>{e.path}</span>
                  </span>
                  <span className={cn("mt-2 block text-2xl", docsSerifClass)}><Marked text={e.title} query={query} /></span>
                  <span className="text-muted-foreground mt-1 block text-pretty"><Marked text={e.summary} query={query} /></span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-surface mt-4 rounded-2xl border p-10 text-center">
            <p className={cn("text-3xl", docsSerifClass)}>Nothing for “{query.trim()}”.</p>
            <p className="text-muted-foreground mt-2">Check the spelling, try fewer words or start from one of these.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">{suggestions.map((s) => <button key={s} type="button" onClick={() => { setQuery(s); setKind("All") }} className="bg-card hover:bg-accent focus-visible:ring-ring/50 h-9 rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-[3px]">{s}</button>)}</div>
          </div>
        )}
      </main>
    </DocsShell>
  )
}

export { DocsSearch, type DocsSearchProps }
