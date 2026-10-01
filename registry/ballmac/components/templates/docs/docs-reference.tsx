// Ballmac UI: Docs API reference page. https://ui.ballmac.com/templates/template-docs
"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { ApiEndpoint } from "@/components/ballmac/api-endpoint"
import { Callout } from "@/components/ballmac/callout"
import { CopyButton } from "@/components/ballmac/copy-button"
import { TableOfContents } from "@/components/ballmac/table-of-contents"
import { endpointGroups } from "@/components/ballmac/templates/docs/docs-data"
import { Crumbs, DocsShell, docsMonoClass, docsSerifClass, type DocsHrefs } from "@/components/ballmac/templates/docs/docs-theme"
import { cn } from "@/lib/utils"

const methods = ["All", "GET", "POST", "DELETE"] as const
const limits = [["Requests", "600 per minute per key"], ["Message size", "256 KB"], ["Batch receive", "50 messages"], ["Long poll", "20 seconds"], ["Idempotency keys", "24 hours"]]
const toc = [
  { id: "auth", title: "Authentication", level: 2 },
  { id: "limits", title: "Limits", level: 2 },
  { id: "queues", title: "Queues", level: 2 },
  { id: "messages", title: "Messages", level: 2 },
]

type DocsReferenceProps = React.ComponentProps<"div"> & { hrefs?: Partial<DocsHrefs> }

/** The API reference: authentication, limits and expandable endpoint cards that filter by method or text. */
function DocsReference({ hrefs, ...props }: DocsReferenceProps) {
  const [method, setMethod] = React.useState<(typeof methods)[number]>("All")
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const groups = endpointGroups
    .map((g) => ({ ...g, endpoints: g.endpoints.filter((e) => (method === "All" || e.method === method) && (!q || `${e.summary} ${e.path} ${e.description}`.toLowerCase().includes(q))) }))
    .filter((g) => g.endpoints.length > 0)
  const total = groups.reduce((n, g) => n + g.endpoints.length, 0)
  return (
    <DocsShell page="reference" hrefs={hrefs} {...props}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 px-4 py-10 sm:px-8 xl:grid-cols-[minmax(0,1fr)_14rem]">
        <main className="mx-auto w-full min-w-0 max-w-3xl">
          <Crumbs items={["API reference", "Overview"]} />
          <h1 className={cn("mt-5 text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.05] text-balance", docsSerifClass)}>API reference</h1>
          <p className="text-muted-foreground mt-4 text-xl text-pretty">A small, regular HTTP API. Every endpoint takes and returns JSON, and every SDK method maps to exactly one of them.</p>
          <div className="bg-card mt-6 flex items-center justify-between gap-3 rounded-xl border p-3 pl-4">
            <div className="min-w-0"><p className="text-muted-foreground text-xs">Base URL</p><p className={cn("truncate text-sm", docsMonoClass)}>https://eu.api.tern.dev</p></div>
            <CopyButton value="https://eu.api.tern.dev" ariaLabel="Copy the base URL" variant="outline" size="sm" />
          </div>

          <section aria-labelledby="auth" className="mt-12">
            <h2 id="auth" className={cn("scroll-mt-24 text-3xl", docsSerifClass)}>Authentication</h2>
            <p className="mt-3 text-pretty">Send your key as a bearer token. Test keys start with <code className={docsMonoClass}>tern_test_</code> and live keys with <code className={docsMonoClass}>tern_live_</code>.</p>
            <pre tabIndex={0} role="region" aria-label="Authorization header" className={cn("bg-muted/60 mt-4 overflow-x-auto rounded-xl border p-4 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", docsMonoClass)}>Authorization: Bearer tern_live_••••••••</pre>
            <div className="mt-4"><Callout kind="caution" title="Keep live keys on the server">Never ship a live key in a browser or a mobile app. Create a restricted key that can only send messages if a client must call Tern directly.</Callout></div>
          </section>

          <section aria-labelledby="limits" className="mt-12">
            <h2 id="limits" className={cn("scroll-mt-24 text-3xl", docsSerifClass)}>Limits</h2>
            <dl className="mt-4 divide-y rounded-xl border">
              {limits.map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className={cn("font-medium", docsMonoClass)}>{v}</dd></div>)}
            </dl>
          </section>

          <div className="mt-14 flex flex-wrap items-center gap-3" role="group" aria-label="Filter endpoints">
            <div className="relative min-w-52 flex-1">
              <label htmlFor="dr-q" className="sr-only">Filter endpoints</label>
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden="true" />
              <input id="dr-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter endpoints" className="bg-card focus-visible:ring-ring/50 h-10 w-full rounded-lg border pr-3 pl-9 text-sm outline-none focus-visible:ring-[3px]" />
            </div>
            <div className="flex gap-1.5">
              {methods.map((m) => (
                <button key={m} type="button" aria-pressed={method === m} onClick={() => setMethod(m)} className={cn("hover:bg-accent focus-visible:ring-ring/50 aria-pressed:bg-primary aria-pressed:text-primary-foreground h-10 rounded-lg border px-3 text-xs font-bold outline-none focus-visible:ring-[3px]", docsMonoClass)}>{m}</button>
              ))}
            </div>
          </div>
          <p role="status" className="text-muted-foreground mt-3 text-sm">{total} {total === 1 ? "endpoint" : "endpoints"}</p>

          {groups.map((g) => (
            <section key={g.title} aria-labelledby={g.title.toLowerCase()} className="mt-8">
              <h2 id={g.title.toLowerCase()} className={cn("scroll-mt-24 text-3xl", docsSerifClass)}>{g.title}</h2>
              <div className="mt-5 grid gap-4">
                {g.endpoints.map((e, i) => (
                  <ApiEndpoint key={e.method + e.path} method={e.method} path={e.path} summary={e.summary} description={e.description} baseUrl="https://eu.api.tern.dev" auth="Bearer key" parameters={e.parameters} requestExample={e.requestExample} responses={e.responses} defaultOpen={i === 0 && g.title === groups[0]?.title} />
                ))}
              </div>
            </section>
          ))}
          {total === 0 && <div className="bg-surface mt-8 rounded-2xl border p-10 text-center"><p className={cn("text-2xl", docsSerifClass)}>No endpoint matches “{query}”.</p><p className="text-muted-foreground mt-2 text-sm">Try a shorter word, or clear the method filter.</p><button type="button" onClick={() => { setQuery(""); setMethod("All") }} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mt-5 h-10 rounded-lg px-5 text-sm font-semibold outline-none focus-visible:ring-[3px]">Clear filters</button></div>}
        </main>
        <aside className="hidden xl:block" aria-label="On this page"><div className="sticky top-24"><TableOfContents items={toc} title="On this page" offset={96} /></div></aside>
      </div>
    </DocsShell>
  )
}

export { DocsReference, type DocsReferenceProps }
