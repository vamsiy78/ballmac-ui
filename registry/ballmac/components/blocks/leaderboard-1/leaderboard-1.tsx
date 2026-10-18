// Ballmac UI: Leaderboard 1. https://ui.ballmac.com/blocks/leaderboard-1
"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, Crown, Minus, Search, Trophy, UsersRound } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ballmac/avatar"
import { BlurFade } from "@/components/ballmac/blur-fade"
import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { NumberTicker } from "@/components/ballmac/number-ticker"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Leaderboard1Period = "week" | "month" | "all"

type Leaderboard1Entry = {
  id: string
  name: string
  /** A line under the name: a team, a city, a title. */
  subtitle?: string
  /** A picture, or leave out for art drawn from the name. */
  avatar?: string
  /** The score in each period. */
  scores: Record<Leaderboard1Period, number>
  /** How many places they moved since the period before: positive is up, negative is down. */
  change?: Partial<Record<Leaderboard1Period, number>>
  /** The person using the page. Highlighted, and pinned at the bottom when they are further down the list. */
  isYou?: boolean
}

type Leaderboard1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    entries?: Leaderboard1Entry[]
    title?: string
    description?: string
    /** What the score is called ("pts", "commits", "sales"). */
    unit?: string
    defaultPeriod?: Leaderboard1Period
    /** How many places show under the podium before Show more. */
    pageSize?: number
    /** BCP 47 locale for numbers. */
    locale?: string
    onPeriodChange?: (period: Leaderboard1Period) => void
    /** Called when a person is chosen. Makes each row a button. */
    onSelect?: (entry: Leaderboard1Entry) => void
  }

const sample: Leaderboard1Entry[] = [
  { id: "p1", name: "Priya Shah", subtitle: "Platform", scores: { week: 1840, month: 6120, all: 41200 }, change: { week: 1, month: 0, all: 0 } },
  { id: "p2", name: "Theo Nakamura", subtitle: "Tooling", scores: { week: 1710, month: 6480, all: 39800 }, change: { week: -1, month: 1, all: 0 } },
  { id: "p3", name: "Mara Ellison", subtitle: "Design", scores: { week: 1620, month: 5300, all: 36900 }, change: { week: 2, month: -1, all: 1 } },
  { id: "p4", name: "Alex Kim", subtitle: "Support", scores: { week: 1480, month: 5050, all: 33100 }, change: { week: 0, month: 2, all: -1 } },
  { id: "p5", name: "Sam Okafor", subtitle: "Support", scores: { week: 1390, month: 4720, all: 30400 }, change: { week: -2, month: 0, all: 0 } },
  { id: "p6", name: "Lena Fischer", subtitle: "Growth", scores: { week: 1275, month: 4410, all: 28950 }, change: { week: 3, month: 1, all: 2 } },
  { id: "p7", name: "Diego Marín", subtitle: "Platform", scores: { week: 1190, month: 4380, all: 27300 }, change: { week: -1, month: -1, all: -1 } },
  { id: "p8", name: "Noor Haddad", subtitle: "Design", scores: { week: 1105, month: 3900, all: 25100 }, change: { week: 1, month: 0, all: 1 } },
  { id: "p9", name: "Jordan Lee", subtitle: "Product", scores: { week: 1020, month: 3640, all: 22400 }, change: { week: 4, month: 2, all: 0 }, isYou: true },
  { id: "p10", name: "Kofi Mensah", subtitle: "Tooling", scores: { week: 940, month: 3510, all: 21800 }, change: { week: -1, month: 0, all: -2 } },
  { id: "p11", name: "Yuki Tanaka", subtitle: "Growth", scores: { week: 880, month: 3200, all: 19600 }, change: { week: 0, month: -2, all: 0 } },
  { id: "p12", name: "Ines Costa", subtitle: "Support", scores: { week: 790, month: 2980, all: 18200 }, change: { week: -3, month: 1, all: 1 } },
  { id: "p13", name: "Oliver Reed", subtitle: "Product", scores: { week: 720, month: 2760, all: 16900 }, change: { week: 0, month: 0, all: 0 } },
  { id: "p14", name: "Amara Okoye", subtitle: "Design", scores: { week: 640, month: 2410, all: 15200 }, change: { week: 1, month: -1, all: -1 } },
]

const periodLabel: Record<Leaderboard1Period, string> = { week: "This week", month: "This month", all: "All time" }
const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2)

const podium = [
  { rank: 1, height: "h-36 sm:h-48", tone: "from-chart-3/45 to-chart-3/5", ring: "ring-chart-3", numeral: "text-chart-3" },
  { rank: 2, height: "h-28 sm:h-36", tone: "from-foreground/20 to-foreground/[0.03]", ring: "ring-muted-foreground/60", numeral: "text-muted-foreground" },
  { rank: 3, height: "h-20 sm:h-28", tone: "from-chart-4/35 to-chart-4/5", ring: "ring-chart-4", numeral: "text-chart-4" },
] as const

function Face({ entry, className }: { entry: Leaderboard1Entry; className?: string }) {
  return (
    <Avatar className={cn("shrink-0", className)}>
      {entry.avatar ? <AvatarImage src={entry.avatar} alt="" /> : null}
      <AvatarFallback className="text-foreground relative overflow-hidden bg-transparent font-semibold">
        <CoverArt seed={entry.name} variant="mesh" className="absolute inset-0" />
        <span className="relative">{initials(entry.name)}</span>
      </AvatarFallback>
    </Avatar>
  )
}

function Movement({ change }: { change?: number }) {
  if (change === undefined) return <span className="w-12 sm:w-14" />
  const Icon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus
  return (
    <span className={cn("flex w-12 items-center justify-end gap-1 text-xs tabular-nums sm:w-14", change > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
      <Icon aria-hidden="true" className={cn("size-3.5", change > 0 && "text-chart-2", change < 0 && "text-destructive")} />
      <span aria-hidden="true">{change === 0 ? "" : Math.abs(change)}</span>
      <span className="sr-only">{change === 0 ? "No change" : `${change > 0 ? "Up" : "Down"} ${Math.abs(change)} ${Math.abs(change) === 1 ? "place" : "places"}`}</span>
    </span>
  )
}

function BoardSkeleton() {
  return (
    <div className="grid gap-8" aria-hidden="true">
      <div className="grid grid-cols-3 items-end gap-3 sm:gap-6">
        <Skeleton className="h-56 rounded-t-3xl" />
        <Skeleton className="h-72 rounded-t-3xl" />
        <Skeleton className="h-48 rounded-t-3xl" />
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-14 rounded-xl" />
      ))}
    </div>
  )
}

/**
 * A leaderboard: a podium with the leader raised, the rest as ranked rows with a bar against the leader's score that grows in, rank
 * movement written in words, a switch between week, month and all time, a way to find someone, and your own place highlighted and
 * pinned when you are further down the list.
 */
function Leaderboard1({
  entries: entriesProp = sample,
  title = "Leaderboard",
  description = "Who is moving the most. Scores update every night.",
  unit = "pts",
  defaultPeriod = "week",
  pageSize = 8,
  locale = "en-US",
  onPeriodChange,
  onSelect,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Leaderboard1Props) {
  const id = React.useId()
  const [period, setPeriod] = React.useState<Leaderboard1Period>(defaultPeriod)
  const [query, setQuery] = React.useState("")
  const [shown, setShown] = React.useState(pageSize)
  const [grown, setGrown] = React.useState(false)
  const ready = state === "ready" || state === "empty"
  const nf = new Intl.NumberFormat(locale)

  // bars start empty and grow once the page is on screen
  React.useEffect(() => {
    const t = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(t)
  }, [])
  React.useEffect(() => setShown(pageSize), [period, query, pageSize])

  const ranked = React.useMemo(
    () =>
      state === "empty"
        ? []
        : [...entriesProp]
            .sort((a, b) => b.scores[period] - a.scores[period] || a.name.localeCompare(b.name))
            .map((e, i) => ({ ...e, rank: i + 1, score: e.scores[period], delta: e.change?.[period] })),
    [entriesProp, period, state]
  )
  const top = ranked.slice(0, 3)
  const leader = ranked[0]?.score ?? 1
  const q = query.trim().toLowerCase()
  const rest = ranked.slice(3).filter((e) => !q || `${e.name} ${e.subtitle ?? ""}`.toLowerCase().includes(q))
  const visible = rest.slice(0, shown)
  const you = ranked.find((e) => e.isYou)
  const youHidden = !!you && you.rank > 3 && !visible.some((v) => v.id === you.id) && !q

  const row = (e: (typeof ranked)[number], pinned = false) => {
    const body = (
      <>
        <span className="text-muted-foreground w-8 shrink-0 text-center font-mono text-sm tabular-nums">{e.rank}</span>
        <Face entry={e} className="size-10" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="truncate">{e.name}</span>
            {e.isYou ? <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold">You</span> : null}
          </span>
          {e.subtitle ? <span className="text-muted-foreground block truncate text-xs">{e.subtitle}</span> : null}
        </span>
        <span aria-hidden="true" className="bg-muted relative hidden h-1.5 w-32 shrink-0 overflow-hidden rounded-full md:block lg:w-44">
          <span className="bg-foreground/70 absolute inset-y-0 start-0 rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none" style={{ width: grown ? `${Math.max(4, (e.score / leader) * 100)}%` : "0%" }} />
        </span>
        <span className="shrink-0 text-end text-sm font-semibold tabular-nums sm:w-20">
          {nf.format(e.score)}
          <span className="text-muted-foreground ms-1 hidden text-xs font-normal sm:inline">{unit}</span>
        </span>
        <Movement change={e.delta} />
      </>
    )
    const cls = cn("flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-[background-color,border-color] duration-150 sm:gap-4 sm:px-4", e.isYou ? "bg-accent border-foreground/25" : "bg-card hover:border-foreground/20", pinned && "shadow-lg")
    return onSelect ? (
      <button type="button" onClick={() => onSelect(e)} aria-label={`Rank ${e.rank}: ${e.name}`} className={cn(cls, "focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]")}>
        {body}
      </button>
    ) : (
      <div className={cls}>{body}</div>
    )
  }

  const empty = ready && ranked.length === 0

  const content = empty ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <UsersRound className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No scores yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "The board fills up as soon as the first points are earned. Be the first."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-10">
      <ol aria-label="Top three" className="border-border mx-auto grid w-full max-w-2xl list-none grid-cols-3 items-end gap-2 border-b sm:gap-6">
        {[top[1], top[0], top[2]].map((e, slot) => {
          if (!e) return <li key={slot} />
          const P = podium[e.rank - 1]!
          const first = e.rank === 1
          return (
            <BlurFade key={e.id} as="li" direction="up" offset={first ? 30 : 22} duration={0.7} delay={first ? 0 : slot === 0 ? 0.12 : 0.22} className="flex flex-col items-center">
              <span className="sr-only">
                Rank {e.rank}: {e.name}, {nf.format(e.score)} {unit}
              </span>
              <div aria-hidden="true" className="flex w-full flex-col items-center">
                <div className="relative">
                  {first ? <Crown className="text-chart-3 fill-chart-3/30 absolute -top-7 left-1/2 size-7 -translate-x-1/2" /> : null}
                  <Face entry={e} className={cn("ring-4 ring-offset-2 ring-offset-background", P.ring, first ? "size-20 sm:size-28" : "size-14 sm:size-20")} />
                </div>
                <p className="mt-3 flex max-w-full items-center gap-1.5 text-sm font-semibold sm:text-base">
                  <span className="truncate">{e.name}</span>
                  {e.isYou ? <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-[10px]">You</span> : null}
                </p>
                {e.subtitle ? <p className="text-muted-foreground hidden text-xs sm:block">{e.subtitle}</p> : null}
                <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                  <NumberTicker value={e.score} locale={locale} />
                </p>
                <p className="text-muted-foreground text-[11px] sm:text-xs">{unit}</p>
                <div className={cn("relative mt-4 w-full overflow-hidden rounded-t-2xl border border-b-0 bg-gradient-to-b", P.tone, P.height)}>
                  <span className={cn("absolute inset-x-0 top-2 text-center font-mono text-4xl font-semibold opacity-50 sm:top-3 sm:text-6xl", P.numeral)}>{e.rank}</span>
                </div>
              </div>
            </BlurFade>
          )
        })}
      </ol>

      {rest.length || q ? (
        <div className="mx-auto w-full max-w-3xl">
          <div className="bg-background focus-within:ring-ring/50 mb-4 flex h-9 items-center gap-2 rounded-md border px-2.5 focus-within:ring-[3px]">
            <Search aria-hidden="true" className="text-muted-foreground size-4" />
            <input type="search" aria-label="Find a person" placeholder="Find a person" value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <ol start={4} aria-label="Rankings from fourth place" className="grid list-none grid-cols-1 gap-2">
            {visible.map((e) => (
              <li key={e.id} className="min-w-0">{row(e)}</li>
            ))}
            {!visible.length ? <li className="text-muted-foreground py-8 text-center text-sm">Nobody matches “{query}”.</li> : null}
          </ol>
          {rest.length > visible.length ? (
            <div className="mt-5 flex flex-col items-center gap-2">
              <p className="text-muted-foreground text-xs tabular-nums">
                Showing {visible.length + 3} of {ranked.length}
              </p>
              <Button variant="outline" onClick={() => setShown((n) => n + pageSize)}>
                Show {Math.min(pageSize, rest.length - visible.length)} more
              </Button>
            </div>
          ) : null}
          {youHidden && you ? (
            <div className="sticky bottom-4 z-10 mt-6">
              <p className="text-muted-foreground mb-1.5 text-center text-xs">Your place</p>
              {row(you, true)}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )

  return (
    <section data-slot="leaderboard-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-12 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <h1 id={`${id}-title`} className="flex items-center gap-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            <Trophy aria-hidden="true" className="text-chart-3 size-8 sm:size-10" />
            {title}
          </h1>
          <p className="text-muted-foreground mt-3 text-base text-pretty">{description}</p>
        </div>
        <SegmentedControl
          value={period}
          onValueChange={(v) => {
            setPeriod(v as Leaderboard1Period)
            onPeriodChange?.(v as Leaderboard1Period)
          }}
          aria-label="Period"
          disabled={!ready}
        >
          {(Object.keys(periodLabel) as Leaderboard1Period[]).map((p) => (
            <SegmentedControlItem key={p} value={p}>
              {periodLabel[p]}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the leaderboard" loading={<BoardSkeleton />} error={{ title: errorState?.title ?? "The leaderboard could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Leaderboard1, type Leaderboard1Props, type Leaderboard1Entry, type Leaderboard1Period }
