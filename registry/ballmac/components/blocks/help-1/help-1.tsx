// Ballmac UI: Help 1. https://ui.ballmac.com/blocks/help-1
"use client"

import * as React from "react"
import { ArrowRight, BookOpen, Code2, CreditCard, FileSearch, LifeBuoy, MessageCircle, Plug, Rocket, Search, ShieldCheck, Users, X } from "lucide-react"

import { BlurFade, BlurFadeGroup } from "@/components/ballmac/blur-fade"
import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { DotPattern } from "@/components/ballmac/dot-pattern"
import { Kbd } from "@/components/ballmac/kbd"
import { MatchHighlight } from "@/components/ballmac/match-highlight"
import { Skeleton } from "@/components/ballmac/skeleton"
import { SpotlightCard } from "@/components/ballmac/spotlight-card"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Help1Category = {
  id: string
  title: string
  description: string
  icon?: React.ReactNode
  /** How many articles it holds. */
  count: number
  href?: string
}

type Help1Article = {
  id: string
  title: string
  /** One line shown under the title in search. Also searched. */
  summary?: string
  categoryId: string
  /** Reading time in minutes. */
  minutes?: number
  href?: string
  /** Listed under Popular articles. */
  popular?: boolean
}

type Help1Channel = {
  id: string
  label: string
  description: string
  icon?: React.ReactNode
  /** A green dot and "Online" when true. */
  online?: boolean
  /** The button's text ("Start a chat", "Send an email"). */
  action: string
  href?: string
}

type Help1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    categories?: Help1Category[]
    articles?: Help1Article[]
    /** Searches shown under the box as shortcuts. */
    suggestions?: string[]
    /** Ways to reach a person. */
    channels?: Help1Channel[]
    /** Called when an article is chosen from search or the Popular list. Without it, articles with an href are followed. */
    onOpenArticle?: (article: Help1Article) => void
    onOpenCategory?: (category: Help1Category) => void
    onContact?: (channel: Help1Channel) => void
    /** Called with each search, once typing has paused, for analytics or your own results. */
    onSearch?: (query: string) => void
    /** Text in the search box at first, with its suggestions open. */
    defaultQuery?: string
  }

const sampleCategories: Help1Category[] = [
  { id: "start", title: "Getting started", description: "Set up your workspace, invite your team and import your data.", icon: <Rocket />, count: 14 },
  { id: "billing", title: "Billing and plans", description: "Invoices, seats, payment methods and changing your plan.", icon: <CreditCard />, count: 11 },
  { id: "security", title: "Security and privacy", description: "Two-step sign-in, single sign-on, data export and deletion.", icon: <ShieldCheck />, count: 9 },
  { id: "integrations", title: "Integrations", description: "Connect chat, calendars, code hosting and your own tools.", icon: <Plug />, count: 18 },
  { id: "teams", title: "Teams and roles", description: "Permissions, groups and what each role can see and change.", icon: <Users />, count: 8 },
  { id: "api", title: "API and webhooks", description: "Keys, rate limits, events and examples in four languages.", icon: <Code2 />, count: 22 },
]

const sampleArticles: Help1Article[] = [
  { id: "a1", title: "Reset your password", summary: "Get back into your account in two minutes.", categoryId: "security", minutes: 2, popular: true },
  { id: "a2", title: "Download invoices and receipts", summary: "Find every invoice as a PDF, with your company details.", categoryId: "billing", minutes: 3, popular: true },
  { id: "a3", title: "Create and rotate an API key", summary: "Keys are shown once. Here is how to replace one safely.", categoryId: "api", minutes: 4, popular: true },
  { id: "a4", title: "Invite teammates and set their role", summary: "Add people by email or by link, and choose what they can do.", categoryId: "teams", minutes: 3, popular: true },
  { id: "a5", title: "Turn on two-step sign-in", summary: "Use an authenticator app or a passkey to protect your account.", categoryId: "security", minutes: 3, popular: true },
  { id: "a6", title: "Connect your chat workspace", summary: "Post updates to a channel and reply to alerts from chat.", categoryId: "integrations", minutes: 5, popular: true },
  { id: "a7", title: "Change or cancel your plan", summary: "What happens to your seats and data when you change plans.", categoryId: "billing", minutes: 4 },
  { id: "a8", title: "Import data from a spreadsheet", summary: "Upload a CSV and map its columns in under five minutes.", categoryId: "start", minutes: 6 },
  { id: "a9", title: "Webhook events and retries", summary: "Every event we send, its payload and how failed deliveries retry.", categoryId: "api", minutes: 7 },
  { id: "a10", title: "Export or delete your data", summary: "Download everything, or permanently remove your workspace.", categoryId: "security", minutes: 4 },
]

const sampleSuggestions = ["Reset password", "Invoices", "API keys", "Two-step sign-in"]

const sampleChannels: Help1Channel[] = [
  { id: "chat", label: "Live chat", description: "Replies in about 2 minutes", icon: <MessageCircle />, online: true, action: "Start a chat" },
  { id: "email", label: "Email", description: "Replies within one working day", icon: <LifeBuoy />, action: "Send an email" },
  { id: "docs", label: "Community", description: "Ask other people who use it", icon: <BookOpen />, action: "Open the forum" },
]

const tones = ["bg-chart-1/20", "bg-chart-2/20", "bg-chart-3/25", "bg-chart-4/20", "bg-chart-5/20", "bg-chart-1/20"]

function HelpSkeleton() {
  return (
    <div className="grid gap-10" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

/** A link when there is an address, otherwise a button, so one row works for both. */
function Action({ href, onClick, className, children, ...rest }: { href?: string; onClick?: () => void; className?: string; children: React.ReactNode } & Omit<React.ComponentProps<"button">, "onClick">) {
  if (href)
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    )
  return (
    <button type="button" onClick={onClick} className={className} {...rest}>
      {children}
    </button>
  )
}

/**
 * A help center home: a hero with a search that suggests articles as you type (highlighted matches, arrow keys, press / to focus),
 * categories that light up under the pointer, the most read articles, and ways to reach a person with who is online.
 */
function Help1({
  title = "How can we help?",
  description = "Search the guides, or browse by topic.",
  categories = sampleCategories,
  articles = sampleArticles,
  suggestions = sampleSuggestions,
  channels = sampleChannels,
  onOpenArticle,
  onOpenCategory,
  onContact,
  onSearch,
  defaultQuery = "",
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Help1Props) {
  const id = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState(defaultQuery)
  const [open, setOpen] = React.useState(defaultQuery !== "")
  const [active, setActive] = React.useState(0)
  const ready = state === "ready" || state === "empty"
  const noGuides = state === "empty" || (state === "ready" && !categories.length)

  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const results = tokens.length
    ? articles
        .map((a) => {
          const haystack = `${a.title} ${a.summary ?? ""}`.toLowerCase()
          const inTitle = a.title.toLowerCase()
          return { a, hit: tokens.every((t) => haystack.includes(t)), score: tokens.filter((t) => inTitle.includes(t)).length }
        })
        .filter((r) => r.hit)
        .sort((x, y) => y.score - x.score)
        .map((r) => r.a)
        .slice(0, 6)
    : []
  const showList = open && ready && tokens.length > 0
  const categoryName = (cid: string) => categories.find((c) => c.id === cid)?.title

  React.useEffect(() => setActive(0), [query])
  React.useEffect(() => {
    if (!onSearch || !tokens.length) return
    const t = setTimeout(() => onSearch(query.trim()), 600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])
  // "/" jumps to the search from anywhere on the page, as it does on most documentation sites
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

  function choose(a: Help1Article) {
    setOpen(false)
    if (onOpenArticle) onOpenArticle(a)
    else if (a.href) window.location.assign(a.href)
  }

  const popular = articles.filter((a) => a.popular).slice(0, 6)

  const content = (
    <div className="grid gap-14">
      <section aria-labelledby={`${id}-cats`}>
        <h2 id={`${id}-cats`} className="text-xl font-semibold tracking-tight">
          Browse by topic
        </h2>
        <StateView
          state={noGuides ? "empty" : "ready"}
          bare
          empty={{ title: emptyState?.title ?? "No guides yet", description: emptyState?.description ?? "Help articles will be listed here.", icon: emptyState?.icon ?? <FileSearch />, action: emptyState?.action }}
          className="mt-5"
        >
          <BlurFadeGroup stagger={0.06} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:h-full [&>*>*]:h-full" item={{ direction: "up", offset: 12, blur: 6 }}>
            {categories.map((c, i) => (
              <SpotlightCard key={c.id} size={300} className="focus-within:ring-ring/50 group/card flex flex-col gap-4 rounded-2xl p-6 transition-shadow duration-200 focus-within:ring-[3px] hover:shadow-md">
                <span aria-hidden="true" className={cn("text-foreground flex size-11 items-center justify-center rounded-xl border [&_svg]:size-5", tones[i % tones.length])}>
                  {c.icon ?? <BookOpen />}
                </span>
                <div className="flex-1">
                  <h3 className="text-base font-semibold tracking-tight">
                    <Action href={c.href} onClick={() => onOpenCategory?.(c)} className="outline-none after:absolute after:inset-0 after:content-['']">
                      {c.title}
                    </Action>
                  </h3>
                  <p className="text-muted-foreground mt-1.5 text-sm text-pretty">{c.description}</p>
                </div>
                <p className="text-muted-foreground flex items-center justify-between text-xs tabular-nums">
                  <span>{c.count === 1 ? "1 article" : `${c.count} articles`}</span>
                  <ArrowRight aria-hidden="true" className="text-foreground size-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover/card:translate-x-0 group-hover/card:opacity-100 group-focus-within/card:translate-x-0 group-focus-within/card:opacity-100 motion-reduce:transition-none rtl:translate-x-1 rtl:rotate-180 rtl:group-hover/card:translate-x-0 rtl:group-focus-within/card:translate-x-0" />
                </p>
              </SpotlightCard>
            ))}
          </BlurFadeGroup>
        </StateView>
      </section>

      {popular.length ? (
        <section aria-labelledby={`${id}-popular`}>
          <h2 id={`${id}-popular`} className="text-xl font-semibold tracking-tight">
            Popular articles
          </h2>
          <ol className="mt-5 grid gap-x-10 sm:grid-cols-2">
            {popular.map((a, i) => (
              <li key={a.id} className="border-b">
                <Action href={a.href} onClick={() => choose(a)} className="group/row hover:bg-accent/50 focus-visible:ring-ring/50 -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-4 rounded-lg px-3 py-4 text-start outline-none focus-visible:ring-[3px]">
                  <span aria-hidden="true" className="text-muted-foreground w-5 shrink-0 font-mono text-xs tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-pretty">{a.title}</span>
                    <span className="text-muted-foreground mt-0.5 block text-xs">
                      {categoryName(a.categoryId)}
                      {a.minutes ? ` · ${a.minutes} min read` : ""}
                    </span>
                  </span>
                  <ArrowRight aria-hidden="true" className="text-muted-foreground group-hover/row:text-foreground size-4 shrink-0 transition-transform duration-200 group-hover/row:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/row:translate-x-0 rtl:rotate-180 rtl:group-hover/row:-translate-x-0.5" />
                </Action>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

    </div>
  )

  return (
    <section data-slot="help-1" data-state={state} aria-label="Help center" className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      {/* the suggestions open over the sections below, so the hero is not clipped: only its decoration is */}
      <div className="bg-card relative isolate z-10 mb-14 rounded-3xl border px-5 py-14 text-center sm:px-10 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_30%,color-mix(in_oklch,var(--chart-1)_14%,transparent),transparent)]" />
          <DotPattern width={16} height={16} radius={1} radialMask />
        </div>
        <BlurFade direction="up" offset={10} duration={0.5}>
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">{title}</h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md text-base text-pretty">{description}</p>
        </BlurFade>

        <BlurFade direction="up" offset={10} duration={0.5} delay={0.1}>
          <div className="relative mx-auto mt-8 max-w-2xl text-start">
            <div className="bg-background focus-within:border-ring focus-within:ring-ring/40 flex h-14 items-center gap-3 rounded-2xl border px-4 shadow-[0_10px_30px_-14px_rgb(0_0_0/0.3)] transition-shadow focus-within:ring-[3px]">
              <Search aria-hidden="true" className="text-muted-foreground size-5 shrink-0" />
              <input
                ref={inputRef}
                role="combobox"
                aria-label="Search the help center"
                aria-expanded={showList}
                aria-controls={`${id}-results`}
                aria-activedescendant={showList && results[active] ? `${id}-r-${results[active]!.id}` : undefined}
                aria-autocomplete="list"
                aria-describedby={`${id}-hint`}
                autoComplete="off"
                spellCheck={false}
                disabled={!ready}
                value={query}
                placeholder="Search for answers"
                onChange={(e) => {
                  setQuery(e.target.value)
                  setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    if (open && query) setOpen(false)
                    else setQuery("")
                    return
                  }
                  if (!showList || !results.length) return
                  if (e.key === "ArrowDown") {
                    e.preventDefault()
                    setActive((a) => (a + 1) % results.length)
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault()
                    setActive((a) => (a - 1 + results.length) % results.length)
                  } else if (e.key === "Enter" && results[active]) {
                    e.preventDefault()
                    choose(results[active]!)
                  }
                }}
                className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-base outline-none disabled:opacity-50"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQuery("")
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
              Type to see matching articles. Up and down arrows choose one, Enter opens it. Press slash anywhere on the page to jump here.
            </p>

            {showList ? (
              <div className="bg-popover absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border p-2 shadow-xl">
                {results.length ? (
                  <ul id={`${id}-results`} role="listbox" aria-label="Matching articles">
                    {results.map((a, i) => (
                      <li
                        key={a.id}
                        id={`${id}-r-${a.id}`}
                        role="option"
                        aria-selected={i === active}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseMove={() => setActive(i)}
                        onClick={() => choose(a)}
                        className={cn("flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5", i === active && "bg-accent")}
                      >
                        <FileSearch aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            <MatchHighlight text={a.title} query={tokens} />
                          </span>
                          {a.summary ? (
                            <span className="text-muted-foreground block truncate text-xs">
                              <MatchHighlight text={a.summary} query={tokens} />
                            </span>
                          ) : null}
                        </span>
                        <span className="text-muted-foreground hidden shrink-0 text-xs sm:block">{categoryName(a.categoryId)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div id={`${id}-results`} className="px-4 py-8 text-center">
                    <p className="text-sm font-medium">No articles match “{query.trim()}”</p>
                    <p className="text-muted-foreground mt-1 text-xs text-pretty">Check the spelling, try fewer words, or ask us directly.</p>
                    {channels[0] ? (
                      <Button variant="outline" size="sm" className="mt-4" onMouseDown={(e) => e.preventDefault()} onClick={() => onContact?.(channels[0]!)}>
                        {channels[0].action}
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
            <p aria-live="polite" className="sr-only">
              {showList ? (results.length === 1 ? "1 article found" : `${results.length} articles found`) : ""}
            </p>
          </div>

          {suggestions.length && ready && !showList ? (
            <p className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Popular:</span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuery(s)
                    setOpen(true)
                    inputRef.current?.focus()
                  }}
                  className="hover:bg-accent focus-visible:ring-ring/50 rounded-full border px-3 py-1 text-[13px] outline-none focus-visible:ring-[3px]"
                >
                  {s}
                </button>
              ))}
            </p>
          ) : null}
        </BlurFade>
      </div>

      <StateView
        state={state === "loading" || state === "error" ? state : "ready"}
        onRetry={onRetry}
        label="Loading the help center"
        loading={<HelpSkeleton />}
        error={{ title: errorState?.title ?? "The help center could not be loaded", description: errorState?.description ?? "Check your connection and try again. You can still reach us below.", ...errorState }}
      >
        {content}
      </StateView>
      <div className="mt-14">
      {channels.length ? (
          <section aria-labelledby={`${id}-contact`} className="bg-card relative isolate overflow-hidden rounded-3xl border">
            <CoverArt seed="support" variant="mesh" className="absolute inset-0 -z-10 opacity-60" />
            <div className="from-card via-card/85 absolute inset-0 -z-10 bg-gradient-to-r to-transparent" aria-hidden="true" />
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-center">
              <div>
                <h2 id={`${id}-contact`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">
                  Still stuck? Talk to a person.
                </h2>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm text-pretty">Our team reads every message. Tell us what you tried and we will take it from there.</p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-3">
                {channels.map((c) => (
                  <li key={c.id} className="bg-background/80 flex flex-col gap-3 rounded-2xl border p-4 backdrop-blur-sm">
                    <span aria-hidden="true" className="bg-muted flex size-9 items-center justify-center rounded-lg [&_svg]:size-4">
                      {c.icon}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{c.label}</p>
                      <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                        {c.online ? <span aria-hidden="true" className="bg-chart-2 size-1.5 shrink-0 rounded-full" /> : null}
                        {c.online ? <><span className="sr-only">Online.</span>{" "}</> : null}
                        {c.description}
                      </p>
                    </div>
                    {c.href ? (
                      <a href={c.href} onClick={() => onContact?.(c)} className="focus-visible:ring-ring/50 hover:bg-accent inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-3 text-[13px] font-medium outline-none focus-visible:ring-[3px]">
                        {c.action}
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => onContact?.(c)}>
                        {c.action}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </section>
  )
}

export { Help1, type Help1Props, type Help1Category, type Help1Article, type Help1Channel }
