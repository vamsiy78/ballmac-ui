// Ballmac UI: Reviews 2. https://ui.ballmac.com/blocks/reviews-2
"use client"

import * as React from "react"
import { Star } from "lucide-react"

import { BarList, type BarListItem } from "@/components/ballmac/bar-list"
import { RatingDistribution, type RatingCounts } from "@/components/ballmac/rating-distribution"
import { Skeleton } from "@/components/ballmac/skeleton"
import { SplitBar, type SplitSegment } from "@/components/ballmac/split-bar"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Reviews2Review = { id: string; author: string; rating: 1 | 2 | 3 | 4 | 5; date: string; title: string; body: string; verified?: boolean; helpful?: number }

type Reviews2Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    reviews?: Reviews2Review[]
    /** Counts per size for the whole set. Defaults to counting the reviews given. */
    counts?: RatingCounts
    themes?: BarListItem[]
    sentiment?: SplitSegment[]
  }

const sampleReviews: Reviews2Review[] = [
  { id: "1", author: "Priya N.", rating: 5, date: "Oct 21", title: "Saved us a week of work", body: "We dropped the pricing block and the settings screens in and had a real product page the same afternoon. Keyboard navigation just worked.", verified: true, helpful: 14 },
  { id: "2", author: "Tomás R.", rating: 5, date: "Oct 18", title: "The dark mode is actually good", body: "Most kits look fine in light and fall apart in dark. Every screen here held up, and the contrast is right.", verified: true, helpful: 9 },
  { id: "3", author: "Hannah W.", rating: 4, date: "Oct 12", title: "Great, wish it had a Svelte version", body: "Everything we use is React so it fits. Documentation is clear, and the install command for each item is a nice touch.", helpful: 5 },
  { id: "4", author: "Dmitri K.", rating: 3, date: "Oct 3", title: "Good, but the table was missing a feature", body: "The data table does most of what we need. Column pinning would have saved us a custom wrapper.", verified: true, helpful: 3 },
  { id: "5", author: "Aisha B.", rating: 2, date: "Sep 28", title: "Needed more examples", body: "It took a while to find how to wire the form block to our API. The example for the error state helped once I found it.", helpful: 2 },
  { id: "6", author: "Leo M.", rating: 5, date: "Sep 22", title: "Worth it for the agent screens alone", body: "The review desk and the run workbench are things I would have spent a month on. They are polished and accessible.", verified: true, helpful: 11 },
]

const sampleThemes: BarListItem[] = [
  { id: "a", label: "Saves time", value: 412 },
  { id: "b", label: "Looks polished", value: 356 },
  { id: "c", label: "Accessibility", value: 241 },
  { id: "d", label: "Documentation", value: 187 },
  { id: "e", label: "Missing a feature", value: 64 },
  { id: "f", label: "Price", value: 41 },
]

const sampleSentiment: SplitSegment[] = [
  { id: "pos", label: "Positive", value: 1610 },
  { id: "neu", label: "Mixed", value: 390 },
  { id: "neg", label: "Negative", value: 219 },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="grid gap-4"><Skeleton className="h-40 rounded-xl" />{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <div className="grid content-start gap-4"><Skeleton className="h-56 rounded-xl" /><Skeleton className="h-32 rounded-xl" /></div>
    </div>
  )
}

/**
 * Reviews with the whole picture: the average and the shape of the ratings (which filter the list), what people keep mentioning, and whether the mood is
 * positive. The list below the summary follows the star size you choose.
 */
function Reviews2({ title = "What customers say", description = "Real reviews, and what they keep coming back to.", reviews = sampleReviews, counts, themes = sampleThemes, sentiment = sampleSentiment, state = "ready", onRetry, emptyState, errorState, className, ...props }: Reviews2Props) {
  const id = React.useId()
  const [sel, setSel] = React.useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const view = state === "ready" && reviews.length === 0 ? "empty" : state
  const tally = React.useMemo<RatingCounts>(() => counts ?? reviews.reduce((c, r) => ({ ...c, [r.rating]: c[r.rating] + 1 }), { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }), [counts, reviews])
  const shown = sel ? reviews.filter((r) => r.rating === sel) : reviews

  return (
    <section data-slot="reviews-2" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading reviews" loading={<Skel />} empty={{ title: "No reviews yet", description: "When customers leave a review, it appears here.", ...emptyState }} error={{ title: "Reviews could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="grid min-w-0 gap-4">
            <div className="rounded-xl border bg-card p-5 sm:p-6">
              <RatingDistribution counts={tally} selected={sel} onSelect={setSel} />
            </div>
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {sel ? `Showing ${shown.length} ${sel}-star ${shown.length === 1 ? "review" : "reviews"}.` : `Showing all ${shown.length} reviews.`}
            </p>
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-3">
              {shown.map((r) => (
                <li key={r.id} className="grid gap-2 rounded-xl border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">{r.author.charAt(0)}</span>
                      {r.author}
                      {r.verified && <span className="rounded-full border px-1.5 py-px text-[11px] font-medium text-muted-foreground">Verified buyer</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span aria-hidden="true" className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={cn("size-3.5", n <= r.rating ? "fill-foreground text-foreground" : "text-border")} />)}</span>
                    <span className="sr-only">{r.rating} out of 5 stars.</span>
                    {r.title}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{r.body}</p>
                  {r.helpful !== undefined && <p className="text-xs text-muted-foreground">{r.helpful} people found this helpful</p>}
                </li>
              ))}
              {shown.length === 0 && <li className="rounded-xl border border-dashed px-5 py-10 text-center text-sm text-muted-foreground">No reviews with this rating.</li>}
            </ul>
          </div>
          <div className="grid gap-4 lg:sticky lg:top-6">
            <div className="rounded-xl border bg-card p-5"><BarList title="What people mention" items={themes} showShare={false} /></div>
            <div className="rounded-xl border bg-card p-5"><SplitBar title="Overall mood" segments={sentiment} /></div>
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Reviews2, type Reviews2Props, type Reviews2Review }
