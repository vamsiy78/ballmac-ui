// Ballmac UI: Search 1. https://ui.ballmac.com/blocks/search-1
"use client"

import * as React from "react"
import { ArrowUpRight, ChevronRight, FileText, FolderKanban, Lightbulb, Paperclip, Search, SearchX, User, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Kbd } from "@/components/ballmac/kbd"
import { countMatches, MatchHighlight, matchesAll, queryTokens } from "@/components/ballmac/match-highlight"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Search1Kind = "doc" | "person" | "project" | "file"

type Search1Result = {
  id: string
  title: string
  /** An excerpt around the match. Also searched. */
  snippet?: string
  /** Where it lives, as a trail: ["Docs", "API", "Webhooks"]. Also searched. */
  path?: string[]
  kind: Search1Kind
  /** Already written for people ("3 days ago"). */
  updated?: string
  /** How many days ago it changed, for the date filter and for sorting by newest. */
  ageDays?: number
  author?: string
  href?: string
}

type Search1Props = Omit<React.ComponentProps<"section">, "title" | "results"> &
  StateProps & {
    /** Everything that can be found. The page filters it by the search, type and date. */
    results?: Search1Result[]
    /** The search when the page opens. */
    defaultQuery?: string
    /** Called with every change of the search. Debounce it before calling your API. */
    onQueryChange?: (query: string) => void
    /** Called when a result is opened. Results with an href are also real links. */
    onOpen?: (result: Search1Result) => void
    /** How long the search took, already formatted ("0.14 s"). */
    timing?: string
    /** How many results show before "Show more". */
    pageSize?: number
    /** A spelling you suggest when there are few results ("webhook" for "webhok"). */
    didYouMean?: string
  }

const kinds: Record<Search1Kind, { label: string; plural: string; icon: typeof FileText; tile: string }> = {
  doc: { label: "Doc", plural: "Docs", icon: FileText, tile: "bg-chart-1/20" },
  person: { label: "Person", plural: "People", icon: User, tile: "bg-chart-2/20" },
  project: { label: "Project", plural: "Projects", icon: FolderKanban, tile: "bg-chart-4/20" },
  file: { label: "File", plural: "Files", icon: Paperclip, tile: "bg-chart-3/25" },
}

const sample: Search1Result[] = [
  { id: "r1", kind: "doc", title: "Verify webhook signatures", snippet: "Every webhook request is signed. Check the signature header against your signing secret before you trust the payload, and reject requests older than five minutes.", path: ["Docs", "API", "Webhooks"], updated: "3 days ago", ageDays: 3, author: "Priya Shah", href: "#" },
  { id: "r2", kind: "doc", title: "Webhook events and retries", snippet: "Every event we send, its payload, and how failed webhook deliveries retry: five attempts over 24 hours with exponential backoff.", path: ["Docs", "API", "Webhooks"], updated: "last week", ageDays: 9, author: "Alex Kim", href: "#" },
  { id: "r3", kind: "project", title: "Webhook relay", snippet: "A small service that receives webhooks, stores them for replay, and forwards them to your local machine while you build.", path: ["Projects", "Developer tools"], updated: "2 days ago", ageDays: 2, author: "Mara Ellison", href: "#" },
  { id: "r4", kind: "person", title: "Priya Shah", snippet: "Platform engineer. Wrote the webhook retry logic and maintains the delivery dashboard.", path: ["People", "Engineering"], updated: "online now", ageDays: 0, href: "#" },
  { id: "r5", kind: "file", title: "webhook-event-schema.json", snippet: "JSON Schema for all 42 webhook event types, generated from the API definition on every release.", path: ["Files", "Schemas"], updated: "2 weeks ago", ageDays: 16, author: "Theo Nakamura", href: "#" },
  { id: "r6", kind: "doc", title: "Set up a webhook endpoint", snippet: "Create an endpoint in the dashboard, choose the events it receives, and send a test event to check it works.", path: ["Docs", "Getting started"], updated: "last month", ageDays: 34, author: "Alex Kim", href: "#" },
  { id: "r7", kind: "file", title: "Webhook incident review.pdf", snippet: "What went wrong on 3 March when delayed webhook deliveries affected 6% of customers, and what changed after.", path: ["Files", "Reports"], updated: "7 months ago", ageDays: 220, author: "Jordan Lee", href: "#" },
  { id: "r8", kind: "doc", title: "Create and rotate an API key", snippet: "Keys are shown once. Here is how to replace one safely without downtime, including keys used by webhook consumers.", path: ["Docs", "API", "Authentication"], updated: "4 days ago", ageDays: 4, author: "Priya Shah", href: "#" },
  { id: "r9", kind: "person", title: "Sam Okafor", snippet: "Support lead. Answers webhook and billing questions from customers every day.", path: ["People", "Support"], updated: "away", ageDays: 0, href: "#" },
  { id: "r10", kind: "project", title: "Event inspector", snippet: "A browser tool for looking at webhook payloads, headers and delivery attempts as they arrive.", path: ["Projects", "Developer tools"], updated: "5 weeks ago", ageDays: 36, author: "Theo Nakamura", href: "#" },
  { id: "r11", kind: "doc", title: "Download invoices and receipts", snippet: "Find every invoice as a PDF, with your company details and tax number on it.", path: ["Docs", "Billing"], updated: "2 months ago", ageDays: 61, author: "Sam Okafor", href: "#" },
  { id: "r12", kind: "file", title: "Rate limits.xlsx", snippet: "Limits per plan for every API route, with the headers that tell you how much is left.", path: ["Files", "Reference"], updated: "3 months ago", ageDays: 92, author: "Priya Shah", href: "#" },
]

const rangeDays = { any: Infinity, week: 7, month: 30, year: 365 } as const
type Range = keyof typeof rangeDays

const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2)

function SearchSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]" aria-hidden="true">
      <div className="grid content-start gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 rounded-xl border p-4">
            <Skeleton className="size-10 shrink-0 rounded-lg" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * A search results page: a large search box (press / to reach it), the kind of result as a filter with live counts, a date filter and
 * a sort, results with a trail, highlighted words and who changed them last, and a no-results page that helps instead of just saying no.
 */
function Search1({
  results = sample,
  defaultQuery = "webhook",
  onQueryChange,
  onOpen,
  timing,
  pageSize = 5,
  didYouMean,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Search1Props) {
  const id = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState(defaultQuery)
  const [kind, setKind] = React.useState<"all" | Search1Kind>("all")
  const [range, setRange] = React.useState<Range>("any")
  const [sort, setSort] = React.useState<"relevance" | "newest">("relevance")
  const [shown, setShown] = React.useState(pageSize)
  const ready = state === "ready" || state === "empty"

  const tokens = queryTokens(query)
  const haystack = (r: Search1Result) => `${r.title} ${r.snippet ?? ""} ${(r.path ?? []).join(" ")} ${r.author ?? ""}`
  const matched = state === "empty" ? [] : results.filter((r) => matchesAll(haystack(r), tokens))
  const inRange = matched.filter((r) => range === "any" || (r.ageDays ?? 0) <= rangeDays[range])
  const counts = (Object.keys(kinds) as Search1Kind[]).map((k) => ({ kind: k, n: inRange.filter((r) => r.kind === k).length })).filter((c) => results.some((r) => r.kind === c.kind))
  const filtered = inRange.filter((r) => kind === "all" || r.kind === kind)
  const score = (r: Search1Result) => countMatches(r.title, tokens) * 3 + countMatches(r.snippet ?? "", tokens) + countMatches((r.path ?? []).join(" "), tokens)
  const ordered = [...filtered].sort((a, b) => (sort === "newest" ? (a.ageDays ?? 0) - (b.ageDays ?? 0) : score(b) - score(a)))
  const visible = ordered.slice(0, shown)
  const filtersOn = kind !== "all" || range !== "any"

  React.useEffect(() => setShown(pageSize), [query, kind, range, sort, pageSize])
  // "/" jumps to the search from anywhere on the page, unless you are typing in a field
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return
      e.preventDefault()
      inputRef.current?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const change = (value: string) => {
    setQuery(value)
    onQueryChange?.(value)
  }

  const heading = !tokens.length ? "Search" : filtered.length === 1 ? "1 result" : `${filtered.length} results`
  const noMatch = ready && filtered.length === 0

  const content = (
    <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
      <aside aria-label="Filters" className="grid content-start gap-6">
        <fieldset className="grid gap-2">
          <legend className="text-muted-foreground mb-1 text-xs font-medium">Type</legend>
          <div className="flex flex-wrap gap-2 lg:grid lg:gap-0.5">
            {[{ kind: "all" as const, n: inRange.length }, ...counts].map((c) => {
              const label = c.kind === "all" ? "All" : kinds[c.kind].plural
              const Icon = c.kind === "all" ? Search : kinds[c.kind].icon
              return (
                <label
                  key={c.kind}
                  className={cn(
                    "has-[:focus-visible]:ring-ring/50 flex cursor-pointer items-center gap-2.5 rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 has-[:focus-visible]:ring-[3px]",
                    "hover:bg-accent/60 has-[:checked]:bg-accent has-[:checked]:font-medium has-[:checked]:border-foreground/25",
                    "lg:rounded-lg lg:border-transparent lg:px-2.5 lg:has-[:checked]:border-transparent",
                    !c.n && c.kind !== "all" && "text-muted-foreground"
                  )}
                >
                  <input type="radio" name={`${id}-kind`} value={c.kind} checked={kind === c.kind} onChange={() => setKind(c.kind)} className="sr-only" />
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  <span className="text-muted-foreground text-xs tabular-nums">{c.n}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
        <div className="grid gap-2">
          <span id={`${id}-range`} className="text-muted-foreground text-xs font-medium">
            Updated
          </span>
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger aria-labelledby={`${id}-range`} className="w-full lg:w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="week">Past week</SelectItem>
              <SelectItem value="month">Past month</SelectItem>
              <SelectItem value="year">Past year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filtersOn ? (
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => {
              setKind("all")
              setRange("any")
            }}
          >
            <X aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </aside>

      <div className="min-w-0">
        {noMatch ? (
          <div className="bg-card rounded-2xl border px-6 py-14 text-center">
            <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
              <SearchX className="size-6" />
            </span>
            <h2 className="mt-5 text-lg font-semibold tracking-tight text-balance">{emptyState?.title ?? (tokens.length ? `No results for “${query.trim()}”` : "Nothing to search yet")}</h2>
            <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">{emptyState?.description ?? (filtersOn ? "Nothing matches with these filters on." : "We looked everywhere we could.")}</p>
            {didYouMean && tokens.length ? (
              <p className="mt-4 text-sm">
                Did you mean{" "}
                <button type="button" onClick={() => change(didYouMean)} className="focus-visible:ring-ring/50 rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px]">
                  {didYouMean}
                </button>
                ?
              </p>
            ) : null}
            <ul className="text-muted-foreground mx-auto mt-6 grid max-w-xs gap-2 text-start text-sm">
              {["Check the spelling", "Try fewer or more general words", "Try a different type or time"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <Lightbulb aria-hidden="true" className="size-4 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {filtersOn ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setKind("all")
                    setRange("any")
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
              {emptyState?.action}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h2 className="text-sm font-medium tabular-nums">
                {heading}
                {tokens.length ? (
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    for “{query.trim()}”{timing ? ` · ${timing}` : ""}
                  </span>
                ) : null}
              </h2>
              <p role="status" className="sr-only">
                {tokens.length ? `${heading} for ${query.trim()}` : ""}
              </p>
              <div className="ms-auto flex items-center gap-2">
                <span id={`${id}-sort`} className="text-muted-foreground text-xs">
                  Sort by
                </span>
                <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                  <SelectTrigger size="sm" aria-labelledby={`${id}-sort`} className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {didYouMean && tokens.length && filtered.length < 3 ? (
              <p className="text-muted-foreground mb-4 text-sm">
                Did you mean{" "}
                <button type="button" onClick={() => change(didYouMean)} className="text-foreground focus-visible:ring-ring/50 rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px]">
                  {didYouMean}
                </button>
                ?
              </p>
            ) : null}
            <ol key={`${query}|${kind}|${range}|${sort}`} aria-label="Results" className="animate-in fade-in-0 slide-in-from-bottom-1 grid gap-3 duration-300 motion-reduce:animate-none">
              {visible.map((r) => {
                const K = kinds[r.kind]
                const Title = r.href ? "a" : "button"
                return (
                  <li key={r.id} className="bg-card hover:border-foreground/25 focus-within:ring-ring/50 group/result relative flex gap-4 rounded-xl border p-4 transition-[border-color,box-shadow] duration-200 focus-within:ring-[3px] hover:shadow-sm">
                    {r.kind === "person" ? (
                      <span aria-hidden="true" className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold", K.tile)}>
                        {initials(r.title)}
                      </span>
                    ) : (
                      <span aria-hidden="true" className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-[1.15rem]", K.tile)}>
                        <K.icon />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      {r.path?.length ? (
                        <p className="text-muted-foreground flex flex-wrap items-center gap-x-1 text-xs">
                          {r.path.map((p, i) => (
                            <React.Fragment key={p}>
                              {i ? <ChevronRight aria-hidden="true" className="size-3 rtl:rotate-180" /> : null}
                              <span>{p}</span>
                            </React.Fragment>
                          ))}
                        </p>
                      ) : null}
                      <h3 className="mt-0.5 text-base font-semibold tracking-tight text-pretty">
                        <Title
                          {...(r.href ? { href: r.href } : { type: "button" as const })}
                          onClick={() => onOpen?.(r)}
                          className="group-hover/result:text-primary rounded-sm text-start outline-none after:absolute after:inset-0 after:content-['']"
                        >
                          <MatchHighlight text={r.title} query={tokens} />
                        </Title>
                      </h3>
                      {r.snippet ? (
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed text-pretty">
                          <MatchHighlight text={r.snippet} query={tokens} />
                        </p>
                      ) : null}
                      <p className="text-muted-foreground mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="text-foreground/80 font-medium">{K.label}</span>
                        {r.updated ? <span>{r.kind === "person" ? r.updated : `Updated ${r.updated}`}</span> : null}
                        {r.author && r.kind !== "person" ? <span>by {r.author}</span> : null}
                      </p>
                    </div>
                    <ArrowUpRight aria-hidden="true" className="text-muted-foreground group-hover/result:text-foreground size-4 shrink-0 transition-transform duration-200 group-hover/result:-translate-y-0.5 group-hover/result:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/result:translate-x-0 motion-reduce:group-hover/result:translate-y-0 rtl:-scale-x-100 rtl:group-hover/result:-translate-x-0.5" />
                  </li>
                )
              })}
            </ol>
            {ordered.length > visible.length ? (
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-muted-foreground text-xs tabular-nums">
                  Showing {visible.length} of {ordered.length}
                </p>
                <Button variant="outline" onClick={() => setShown((n) => n + pageSize)}>
                  Show {Math.min(pageSize, ordered.length - visible.length)} more
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )

  return (
    <section data-slot="search-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="sr-only">
        Search
      </h1>
      <div className="focus-within:border-ring focus-within:ring-ring/40 bg-background mb-8 flex h-14 items-center gap-3 rounded-2xl border px-4 shadow-[0_8px_24px_-14px_rgb(0_0_0/0.25)] transition-shadow focus-within:ring-[3px]">
        <Search aria-hidden="true" className="text-muted-foreground size-5 shrink-0" />
        <input
          ref={inputRef}
          type="search"
          aria-label="Search"
          aria-describedby={`${id}-hint`}
          autoComplete="off"
          spellCheck={false}
          disabled={!ready}
          value={query}
          placeholder="Search docs, people, projects and files"
          onChange={(e) => change(e.target.value)}
          className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-base outline-none disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              change("")
              inputRef.current?.focus()
            }}
            className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring/50 flex size-7 items-center justify-center rounded-md outline-none focus-visible:ring-[3px]"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : (
          <Kbd className="hidden sm:inline-flex" aria-hidden="true">
            /
          </Kbd>
        )}
      </div>
      <p id={`${id}-hint`} className="sr-only">
        Results update as you type. Press slash anywhere on the page to jump here.
      </p>
      <StateView
        state={state === "loading" || state === "error" ? state : "ready"}
        onRetry={onRetry}
        label="Searching"
        loading={<SearchSkeleton />}
        error={{ title: errorState?.title ?? "Search is not available right now", description: errorState?.description ?? "Your search was not lost. Check your connection and try again.", ...errorState }}
      >
        {content}
      </StateView>
    </section>
  )
}

export { Search1, type Search1Props, type Search1Result, type Search1Kind }
