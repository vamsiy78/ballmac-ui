// Ballmac UI: Docs home page. https://ui.ballmac.com/templates/template-docs
"use client"

import * as React from "react"
import { ArrowRight, BookOpen, Code2, History, Rocket, Search } from "lucide-react"

import { SnippetTabs } from "@/components/ballmac/snippet-tabs"
import { releases, searchIndex, snippets } from "@/components/ballmac/templates/docs/docs-data"
import { DocsShell, docsMonoClass, docsSerifClass, type DocsHrefs } from "@/components/ballmac/templates/docs/docs-theme"
import { cn } from "@/lib/utils"

const paths = [
  { icon: Rocket, title: "Quickstart", body: "Send and receive your first message in about seven minutes.", key: "guide" as const, tint: "bg-chart-1/15" },
  { icon: BookOpen, title: "Guides", body: "Retries, dead letters, schedules and idempotent consumers, explained with code.", key: "guide" as const, tint: "bg-chart-2/15" },
  { icon: Code2, title: "API reference", body: "Every endpoint, parameter and error code, with examples in four languages.", key: "reference" as const, tint: "bg-chart-3/20" },
  { icon: History, title: "Changelog", body: "What shipped, what changed and what to do about it.", key: "changelog" as const, tint: "bg-chart-4/15" },
]

/** Producer, queue and consumer with packets travelling between them. Decorative; the sentence below carries the meaning. */
function Flow() {
  const box = "bg-card grid h-20 w-24 shrink-0 place-items-center rounded-xl border text-center text-xs font-semibold shadow-xs sm:w-32 sm:text-sm"
  return (
    <figure className="mx-auto w-full max-w-xl" aria-label="How a message travels">
      <div aria-hidden="true" className="flex items-center">
        <div className={box}><span>Producer<span className={cn("text-muted-foreground block text-xs font-normal", docsMonoClass)}>your app</span></span></div>
        <div className="relative h-px min-w-6 flex-1 border-t-2 border-dashed [--docs-travel:1.75rem] sm:[--docs-travel:5rem]"><span className="docs-packet bg-chart-1 absolute -top-[7px] start-0 size-3 rounded-full" /></div>
        <div className={cn(box, "bg-primary text-primary-foreground border-primary")}><span>Queue<span className={cn("block text-xs font-normal opacity-100", docsMonoClass)}>invoices</span></span></div>
        <div className="relative h-px min-w-6 flex-1 border-t-2 border-dashed [--docs-travel:1.75rem] sm:[--docs-travel:5rem]"><span className="docs-packet bg-chart-3 absolute -top-[7px] start-0 size-3 rounded-full" style={{ animationDelay: "1.1s" }} /></div>
        <div className={box}><span>Consumer<span className={cn("text-muted-foreground block text-xs font-normal", docsMonoClass)}>worker</span></span></div>
      </div>
      <figcaption className="text-muted-foreground mt-4 text-center text-sm">A producer sends, Tern holds the message until a consumer acknowledges it.</figcaption>
    </figure>
  )
}

type DocsHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<DocsHrefs> }

/** The Docs landing page: a search-first hero, four paths in, install tabs and the latest releases. */
function DocsHome({ hrefs, ...props }: DocsHomeProps) {
  const link = { ...{ home: "/docs", guide: "/docs/guides", reference: "/docs/reference", search: "/docs/search", changelog: "/docs/changelog" }, ...hrefs }
  return (
    <DocsShell page="home" hrefs={hrefs} sidebar={false} {...props}>
      <main>
        <section aria-labelledby="dh-title" className="relative isolate overflow-hidden border-b">
          <div aria-hidden="true" className="absolute inset-0 -z-10 [background-image:radial-gradient(var(--border)_1.2px,transparent_1.2px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <div className="mx-auto max-w-5xl px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-24">
            <p className={cn("bg-accent text-accent-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold", docsMonoClass)}><span className="bg-chart-4 size-1.5 rounded-full" aria-hidden="true" />v3.2 · message replay is here</p>
            <h1 id="dh-title" className={cn("mx-auto mt-6 max-w-3xl text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.02] text-balance", docsSerifClass)}>Queues that <em className="text-primary">never lose</em> a message.</h1>
            <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg text-pretty">Everything you need to send, receive and retry messages at any scale, written by the people who run the queues.</p>
            <form action={link.search} method="get" role="search" className="mx-auto mt-9 flex max-w-xl items-center gap-2">
              <label htmlFor="dh-q" className="sr-only">Search the docs</label>
              <div className="bg-card focus-within:ring-ring/50 relative flex-1 rounded-xl border shadow-sm focus-within:ring-[3px]">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 start-4 size-5 -translate-y-1/2" aria-hidden="true" />
                <input id="dh-q" name="q" type="search" placeholder="Search: retries, idempotency, dead letters…" className="h-14 w-full rounded-xl bg-transparent pe-4 ps-12 text-base outline-none" />
              </div>
              <button type="submit" className="bg-primary text-primary-foreground focus-visible:ring-ring/50 h-14 rounded-xl px-6 text-base font-semibold outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Search</button>
            </form>
            <p className="text-muted-foreground mt-4 text-sm">Popular: {["Retries", "Dead letters", "Idempotency"].map((t, i) => <React.Fragment key={t}>{i > 0 && ", "}<a href={`${link.search}?q=${t.toLowerCase()}`} className="text-foreground underline underline-offset-4">{t}</a></React.Fragment>)}</p>
            <div className="mt-14"><Flow /></div>
          </div>
        </section>

        <section aria-labelledby="dh-paths" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="dh-paths" className="sr-only">Where to start</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paths.map((p) => (
              <li key={p.title}>
                <a href={link[p.key]} className="bg-card hover:border-primary/50 focus-visible:ring-ring/50 group flex h-full flex-col rounded-2xl border p-6 outline-none transition-[border-color,transform] hover:-translate-y-0.5 focus-visible:ring-[3px] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <span className={cn("inline-flex size-11 items-center justify-center rounded-xl", p.tint)}><p.icon className="size-5" aria-hidden="true" /></span>
                  <span className={cn("mt-5 text-2xl", docsSerifClass)}>{p.title}</span>
                  <span className="text-muted-foreground mt-2 flex-1 text-sm text-pretty">{p.body}</span>
                  <span className="text-primary mt-5 inline-flex items-center gap-1 text-sm font-semibold">Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" /></span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="dh-install" className="bg-surface border-y">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 id="dh-install" className={cn("text-4xl text-balance sm:text-5xl", docsSerifClass)}>One command, then a message.</h2>
              <p className="text-muted-foreground mt-4 text-lg text-pretty">Official SDKs for Node, Python and Go, and a plain HTTP API for everything else. Pick a language once and every code sample in the docs follows you.</p>
              <ul className="mt-6 grid gap-2 text-sm">{["Retries and backoff built in", "Typed clients, generated from the API", "Same behaviour in every language"].map((t) => <li key={t} className="flex items-center gap-2"><span className="bg-chart-4 size-1.5 rounded-full" aria-hidden="true" />{t}</li>)}</ul>
            </div>
            <SnippetTabs storageKey="tern-lang" title="Install" snippets={(Object.entries(snippets.install) as [string, string][]).map(([label, code]) => ({ label, code, language: "bash" }))} />
          </div>
        </section>

        <section aria-labelledby="dh-pop" className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 id="dh-pop" className={cn("text-3xl", docsSerifClass)}>Most read</h2>
            <ol className="mt-5 divide-y border-y">
              {searchIndex.filter((e) => e.kind === "Guide").slice(0, 5).map((e, i) => (
                <li key={e.title}>
                  <a href={link[e.page]} className="hover:bg-accent focus-visible:ring-ring/50 group grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-2 py-4 outline-none focus-visible:ring-[3px] focus-visible:ring-inset">
                    <span className={cn("text-muted-foreground text-sm", docsMonoClass)}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0"><span className="block font-semibold">{e.title}</span><span className="text-muted-foreground block truncate text-sm">{e.summary}</span></span>
                    <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div className="flex items-end justify-between"><h2 className={cn("text-3xl", docsSerifClass)}>What’s new</h2><a href={link.changelog} className="text-primary text-sm font-semibold underline-offset-4 hover:underline">All releases</a></div>
            <ul className="mt-5 grid gap-4">
              {releases.slice(0, 3).map((r) => (
                <li key={r.version} className="bg-card rounded-2xl border p-5">
                  <div className="flex items-center gap-3"><span className={cn("bg-secondary rounded-md px-2 py-0.5 text-xs font-bold", docsMonoClass)}>{r.version}</span><span className="text-muted-foreground text-xs">{new Date(r.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</span></div>
                  <h3 className="mt-3 text-lg font-semibold">{r.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm text-pretty">{r.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="dh-help" className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <div className="bg-primary text-primary-foreground flex flex-col items-start justify-between gap-6 rounded-3xl p-8 sm:flex-row sm:items-center sm:p-12">
            <div><h2 id="dh-help" className={cn("text-3xl sm:text-4xl", docsSerifClass)}>Stuck? A human will answer.</h2><p className="mt-2 max-w-lg text-pretty">Average first reply on weekdays is eleven minutes. Bring your message id and we will find it.</p></div>
            <a href={link.search} className="bg-primary-foreground text-primary focus-visible:ring-ring inline-flex h-12 shrink-0 items-center gap-2 rounded-xl px-6 font-semibold outline-none focus-visible:ring-[3px]">Ask support <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></a>
          </div>
        </section>
      </main>
    </DocsShell>
  )
}

export { DocsHome, type DocsHomeProps }
