// Ballmac UI: Reviews 1. https://ui.ballmac.com/blocks/reviews-1
"use client"

import * as React from "react"
import { BadgeCheck, ChevronDown, MessageSquareText, PenLine, Star, ThumbsUp, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { CoverArt } from "@/components/ballmac/cover-art"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Reviews1Review = {
  id: string
  author: string
  /** 1 to 5. */
  rating: number
  title?: string
  body: string
  /** "14 October 2026", already written for people. */
  date: string
  /** ISO date, used to sort by newest. */
  iso: string
  verified?: boolean
  helpful?: number
  /** A short fact about them or their use, such as "Team of 12" or "Runs a bakery". */
  context?: string
  /** A reply from the business. */
  reply?: { from: string; body: string; date: string }
}

type Reviews1Props = Omit<React.ComponentProps<"section">, "title" | "onSelect"> &
  StateProps & {
    reviews?: Reviews1Review[]
    title?: string
    /** Called by Write a review. Leave out to hide the button. */
    onWrite?: () => void
    /** Called when someone marks a review helpful (true) or takes it back (false). */
    onHelpful?: (review: Reviews1Review, helpful: boolean) => void
  }

const sample: Reviews1Review[] = [
  { id: "r1", author: "Hannah Brooks", rating: 5, title: "Replaced three tools with one", body: "We moved our whole studio over in a weekend. The part I did not expect is how calm everything feels now: one place to look, and nothing falls through the cracks. Support answered a question I had on a Sunday evening, which sold me.", date: "14 October 2026", iso: "2026-10-14", verified: true, helpful: 42, context: "Design studio, team of 9", reply: { from: "Acme team", body: "Thank you Hannah. That Sunday answer was Sam, who will be very pleased to read this.", date: "15 October 2026" } },
  { id: "r2", author: "Marcus Webb", rating: 4, title: "Great, with one wish", body: "Fast, clear and hardly any learning curve. I would love to see recurring tasks with more control over the schedule. Everything else is just what we needed.", date: "9 October 2026", iso: "2026-10-09", verified: true, helpful: 18, context: "Agency, team of 24" },
  { id: "r3", author: "Elif Demir", rating: 5, title: "Our clients noticed", body: "Clients now see progress without asking for an update. It has changed how our weekly calls go: shorter and much friendlier.", date: "2 October 2026", iso: "2026-10-02", verified: true, helpful: 31, context: "Consultancy, team of 6" },
  { id: "r4", author: "Tom Alvarez", rating: 3, title: "Good, but slow on big projects", body: "The basics are lovely. Once a project passed a few thousand tasks it started to lag, and the mobile app is behind the web one. Hopeful, since the team replies to everything.", date: "28 September 2026", iso: "2026-09-28", verified: false, helpful: 12, context: "Operations, team of 40", reply: { from: "Acme team", body: "Fair points. Large projects are our focus this quarter, and the mobile update ships next month.", date: "29 September 2026" } },
  { id: "r5", author: "Aisha Rahman", rating: 5, body: "Easily the nicest tool our team uses. We stopped dreading Mondays.", date: "21 September 2026", iso: "2026-09-21", verified: true, helpful: 9, context: "Startup, team of 14" },
  { id: "r6", author: "Jonas Keller", rating: 2, title: "Import lost our history", body: "Moving from our old tool dropped comments and attachments. Support helped fix most of it, but it cost us two days.", date: "15 September 2026", iso: "2026-09-15", verified: true, helpful: 25, context: "Software, team of 31", reply: { from: "Acme team", body: "We are sorry, Jonas. Comment import is fixed as of last week, and we have written a checklist so it does not happen again.", date: "16 September 2026" } },
  { id: "r7", author: "Priya Nair", rating: 4, title: "Worth it", body: "Pays for itself in meetings we no longer need. Wish the free plan allowed a few more projects.", date: "8 September 2026", iso: "2026-09-08", verified: false, helpful: 6, context: "Freelancer" },
  { id: "r8", author: "Lucas Moreau", rating: 5, title: "Simple and sturdy", body: "I have used a lot of these. This one is the first that my less technical colleagues picked up without a walkthrough.", date: "1 September 2026", iso: "2026-09-01", verified: true, helpful: 14, context: "Marketing, team of 11" },
]

function Stars({ value, size = "size-4", className }: { value: number; size?: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative inline-flex", className)}>
      <span className="text-muted-foreground/35 inline-flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={size} />
        ))}
      </span>
      <span className="absolute inset-0 inline-flex overflow-hidden text-amber-500" style={{ width: `${Math.max(0, Math.min(5, value)) * 20}%` }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={cn(size, "shrink-0 fill-current")} />
        ))}
      </span>
    </span>
  )
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <Skeleton className="h-72 rounded-2xl" />
      <div className="grid gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border p-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Customer reviews: a summary with the average and a bar for each star count that also filters, sorting, a verified-only switch, review cards with
 * Read more, helpful votes that count straight away and a business reply. The average and every bar are worked out from the reviews you pass.
 */
function Reviews1({ reviews = sample, title = "What customers say", onWrite, onHelpful, state = "ready", onRetry, emptyState, errorState, className, ...props }: Reviews1Props) {
  const id = React.useId()
  const list = state === "empty" ? [] : reviews
  const [star, setStar] = React.useState<number | null>(null)
  const [verified, setVerified] = React.useState(false)
  const [sort, setSort] = React.useState("helpful")
  const [open, setOpen] = React.useState<Set<string>>(new Set())
  const [voted, setVoted] = React.useState<Set<string>>(new Set())
  const [limit, setLimit] = React.useState(4)

  const total = list.length
  const avg = total ? list.reduce((n, r) => n + r.rating, 0) / total : 0
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: list.filter((r) => r.rating === s).length }))
  const recommend = total ? Math.round((100 * list.filter((r) => r.rating >= 4).length) / total) : 0
  const shown = list
    .filter((r) => (!star || r.rating === star) && (!verified || r.verified))
    .sort((a, b) => (sort === "newest" ? b.iso.localeCompare(a.iso) : sort === "high" ? b.rating - a.rating || (b.helpful ?? 0) - (a.helpful ?? 0) : sort === "low" ? a.rating - b.rating || (b.helpful ?? 0) - (a.helpful ?? 0) : (b.helpful ?? 0) - (a.helpful ?? 0)))
  const visible = shown.slice(0, limit)

  const toggle = (set: Set<string>, k: string) => {
    const n = new Set(set)
    if (n.has(k)) n.delete(k)
    else n.add(k)
    return n
  }

  const content = !total ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <MessageSquareText className="size-6" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No reviews yet"}</h3>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "Be the first to share what it is like."}</p>
      {emptyState?.action ?? (onWrite ? (
        <Button className="mt-5" onClick={onWrite}>
          <PenLine aria-hidden="true" />
          Write a review
        </Button>
      ) : null)}
    </div>
  ) : (
    <div className="grid items-start gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
      <aside aria-labelledby={`${id}-sum`} className="bg-card rounded-2xl border p-6 lg:sticky lg:top-6">
        <h3 id={`${id}-sum`} className="sr-only">
          Rating summary
        </h3>
        <p className="flex items-end gap-3">
          <span className="text-6xl leading-none font-semibold tracking-[-0.05em] tabular-nums">{avg.toFixed(1)}</span>
          <span className="pb-1">
            <Stars value={avg} size="size-5" />
            <span className="text-muted-foreground mt-1 block text-sm">
              {new Intl.NumberFormat("en").format(total)} {total === 1 ? "review" : "reviews"}
            </span>
          </span>
        </p>
        <span className="sr-only">
          {avg.toFixed(1)} out of 5 from {total} reviews
        </span>
        <ul className="mt-6 grid gap-1.5">
          {dist.map(({ s, n }) => (
            <li key={s}>
              <button
                type="button"
                aria-pressed={star === s}
                aria-label={`${s} ${s === 1 ? "star" : "stars"}, ${n} ${n === 1 ? "review" : "reviews"}`}
                disabled={n === 0}
                onClick={() => setStar(star === s ? null : s)}
                className={cn("focus-visible:ring-ring/50 hover:bg-accent group flex w-full items-center gap-3 rounded-md px-2 py-1 text-sm outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:hover:bg-transparent", star === s && "bg-accent")}
              >
                <span aria-hidden="true" className="flex w-6 items-center gap-0.5 tabular-nums">
                  {s}
                  <Star className="size-3 fill-current text-amber-500" />
                </span>
                <span aria-hidden="true" className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                  <span className="block h-full rounded-full bg-amber-500 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(n / total) * 100}%` }} />
                </span>
                <span aria-hidden="true" className="text-muted-foreground w-6 text-end tabular-nums">
                  {n}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t pt-5 text-sm">
          <span className="font-semibold tabular-nums">{recommend}%</span> <span className="text-muted-foreground">of customers gave 4 or 5 stars</span>
        </p>
        {onWrite ? (
          <Button variant="outline" className="mt-5 w-full" onClick={onWrite}>
            <PenLine aria-hidden="true" />
            Write a review
          </Button>
        ) : null}
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="accent-foreground size-4" />
            Verified customers only
          </label>
          {star ? (
            <button type="button" onClick={() => setStar(null)} className="bg-muted hover:bg-accent focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium outline-none focus-visible:ring-[3px]">
              {star} {star === 1 ? "star" : "stars"}
              <X aria-hidden="true" className="size-3" />
              <span className="sr-only">Clear the star filter</span>
            </button>
          ) : null}
          <div className="ms-auto">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger aria-label="Sort reviews" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="helpful">Most helpful</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="high">Highest rated</SelectItem>
                <SelectItem value="low">Lowest rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p aria-live="polite" className="text-muted-foreground mt-4 text-sm">
          Showing {visible.length} of {shown.length} {shown.length === 1 ? "review" : "reviews"}
        </p>

        {shown.length ? (
          <ul className="mt-4 grid gap-4">
            {visible.map((r) => {
              const long = r.body.length > 220
              const expanded = open.has(r.id)
              const mine = voted.has(r.id)
              return (
                <li key={r.id} className="bg-card rounded-2xl border p-5 sm:p-6">
                  <article aria-labelledby={`${id}-${r.id}`}>
                    <div className="flex items-start gap-3.5">
                      <span aria-hidden="true" className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border text-sm font-semibold">
                        <CoverArt seed={r.author} variant="mesh" className="absolute inset-0" />
                        <span className="relative">{r.author.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span id={`${id}-${r.id}`} className="font-semibold">
                            {r.author}
                          </span>
                          {r.verified ? (
                            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                              <BadgeCheck aria-hidden="true" className="size-3.5 text-sky-600 dark:text-sky-400" />
                              Verified customer
                            </span>
                          ) : null}
                        </p>
                        {r.context ? <p className="text-muted-foreground text-xs">{r.context}</p> : null}
                      </div>
                      <p className="text-muted-foreground shrink-0 text-xs">{r.date}</p>
                    </div>
                    <p className="mt-4 flex items-center gap-2.5">
                      <Stars value={r.rating} />
                      <span className="sr-only">{r.rating} out of 5 stars</span>
                      {r.title ? <span className="font-semibold tracking-tight">{r.title}</span> : null}
                    </p>
                    <p className={cn("text-muted-foreground mt-2 text-sm leading-relaxed text-pretty", long && !expanded && "line-clamp-3")}>{r.body}</p>
                    {long ? (
                      <button type="button" aria-expanded={expanded} onClick={() => setOpen(toggle(open, r.id))} className="focus-visible:ring-ring/50 mt-1.5 inline-flex items-center gap-1 rounded-sm text-sm font-medium outline-none focus-visible:ring-[3px]">
                        {expanded ? "Show less" : "Read more"}
                        <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform motion-reduce:transition-none", expanded && "rotate-180")} />
                      </button>
                    ) : null}
                    {r.reply ? (
                      <div className="bg-muted/50 mt-4 rounded-xl border-s-2 p-4 ps-5 text-sm">
                        <p className="font-medium">
                          {r.reply.from} <span className="text-muted-foreground font-normal">replied · {r.reply.date}</span>
                        </p>
                        <p className="text-muted-foreground mt-1 text-pretty">{r.reply.body}</p>
                      </div>
                    ) : null}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <Button
                        variant={mine ? "secondary" : "outline"}
                        size="sm"
                        aria-pressed={mine}
                        onClick={() => {
                          setVoted(toggle(voted, r.id))
                          onHelpful?.(r, !mine)
                        }}
                      >
                        <ThumbsUp aria-hidden="true" className={cn(mine && "fill-current")} />
                        Helpful <span className="tabular-nums">· {(r.helpful ?? 0) + (mine ? 1 : 0)}</span>
                      </Button>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed px-6 py-14 text-center">
            <p className="font-medium">No reviews match</p>
            <p className="text-muted-foreground mt-1 text-sm">Try another star count, or include customers who are not verified.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setStar(null)
                setVerified(false)
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
        {shown.length > limit ? (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => setLimit((l) => l + 4)}>
              Show more reviews
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )

  return (
    <section data-slot="reviews-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20", className)} {...frameProps(props)}>
      <h2 id={`${id}-title`} className="mb-10 text-4xl font-semibold tracking-[-0.04em] text-balance">
        {title}
      </h2>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading reviews" loading={<Skel />} error={{ title: errorState?.title ?? "Reviews could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Reviews1, type Reviews1Props, type Reviews1Review }
