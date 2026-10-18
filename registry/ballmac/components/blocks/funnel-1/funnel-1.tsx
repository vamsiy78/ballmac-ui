// Ballmac UI: Funnel 1. https://ui.ballmac.com/blocks/funnel-1
"use client"

import * as React from "react"
import { ArrowDown, Filter, Lightbulb } from "lucide-react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Funnel1Step = { id: string; name: string; /** People who reached this step. */ count: number }
type Funnel1Segment = { id: string; label: string; steps: Funnel1Step[] }

type Funnel1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    /** One list of steps per group of people (all, mobile, from ads). The first is shown at first. */
    segments?: Funnel1Segment[]
    /** "Last 30 days", already written for people. */
    period?: string
    locale?: string
    /** The step whose details are open at first. */
    defaultSelectedId?: string
  }

const steps = (counts: number[]): Funnel1Step[] => ["Visited the site", "Viewed a product", "Added to cart", "Started checkout", "Paid"].map((name, i) => ({ id: `s${i}`, name, count: counts[i]! }))

const sample: Funnel1Segment[] = [
  { id: "all", label: "Everyone", steps: steps([48210, 29840, 11620, 6180, 4390]) },
  { id: "mobile", label: "Mobile", steps: steps([31470, 17450, 5980, 2540, 1480]) },
  { id: "desktop", label: "Desktop", steps: steps([16740, 12390, 5640, 3640, 2910]) },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-5">
      {[100, 70, 45, 28, 16].map((w, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mx-auto mt-3 h-12 rounded-xl" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  )
}

/**
 * A conversion funnel: each step as a bar sized against the first, joined by connectors that narrow as people drop away, with what share
 * continued and how many were lost between steps. The biggest leak is found for you and written out as a sentence, a segment switch compares
 * groups, and choosing a step shows exactly what happened there. Every figure is worked out from the counts.
 */
function Funnel1({
  title = "Checkout funnel",
  description = "Where people stop on the way from a first visit to a payment.",
  segments = sample,
  period = "Last 30 days",
  locale = "en",
  defaultSelectedId,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Funnel1Props) {
  const id = React.useId()
  const list = state === "empty" ? [] : segments
  const [seg, setSeg] = React.useState(list[0]?.id ?? "")
  const [pick, setPick] = React.useState<string | null>(defaultSelectedId ?? null)
  const active = list.find((s) => s.id === seg) ?? list[0]
  const n = (x: number) => new Intl.NumberFormat(locale).format(x)

  const model = React.useMemo(() => {
    if (!active?.steps.length) return null
    const st = active.steps
    const top = st[0]!.count || 1
    const rows = st.map((s, i) => {
      const prev = i ? st[i - 1]!.count : s.count
      return { ...s, share: s.count / top, kept: prev ? s.count / prev : 0, lost: prev - s.count, i }
    })
    const leak = rows.slice(1).reduce((b, r) => (!b || r.lost / (rows[r.i - 1]!.count || 1) > b.lost / (rows[b.i - 1]!.count || 1) ? r : b), null as (typeof rows)[number] | null)
    return { rows, leak, overall: st.at(-1)!.count / top }
  }, [active])

  const chosen = model?.rows.find((r) => r.id === pick)

  const content = !model ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Filter className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No funnel data yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "Once visitors move through the steps, the funnel appears here."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="bg-card rounded-2xl border p-5 sm:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Overall conversion</p>
            <p className="text-4xl font-semibold tracking-[-0.04em] tabular-nums">
              {(model.overall * 100).toFixed(model.overall < 0.1 ? 1 : 0)}%
              <span className="text-muted-foreground ms-3 text-base font-normal tracking-normal">
                {n(model.rows.at(-1)!.count)} of {n(model.rows[0]!.count)}
              </span>
            </p>
          </div>
          {list.length > 1 ? (
            <SegmentedControl value={seg} onValueChange={(v) => { setSeg(v); setPick(null) }} aria-label="Group" size="sm">
              {list.map((s) => (
                <SegmentedControlItem key={s.id} value={s.id}>
                  {s.label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          ) : null}
        </div>

        <ol>
          {model.rows.map((r, i) => {
            const next = model.rows[i + 1]
            const w = Math.max(r.share * 100, 6)
            const nw = next ? Math.max(next.share * 100, 6) : 0
            const isLeak = model.leak && next && model.leak.id === next.id
            return (
              <li key={r.id}>
                <button
                  type="button"
                  aria-pressed={pick === r.id}
                  aria-label={`${r.name}: ${n(r.count)} people, ${(r.share * 100).toFixed(1)}% of the first step${r.i ? `, ${(r.kept * 100).toFixed(1)}% of the step before` : ""}`}
                  onClick={() => setPick(pick === r.id ? null : r.id)}
                  className="focus-visible:ring-ring/50 group block w-full rounded-xl text-start outline-none focus-visible:ring-[3px]"
                >
                  <span aria-hidden="true" className="mb-2 flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium">
                      <span className="text-muted-foreground me-2 tabular-nums">{r.i + 1}</span>
                      {r.name}
                    </span>
                    <span className="tabular-nums">
                      <span className="font-semibold">{n(r.count)}</span> <span className="text-muted-foreground">· {(r.share * 100).toFixed(r.share < 0.1 ? 1 : 0)}%</span>
                    </span>
                  </span>
                  <span aria-hidden="true" className="flex justify-center">
                    <span
                      className={cn("block h-12 rounded-xl transition-[width,filter] duration-700 ease-out group-hover:brightness-110 motion-reduce:transition-none", pick === r.id ? "ring-foreground ring-2 ring-offset-2" : "")}
                      style={{ width: `${w}%`, background: `color-mix(in oklab, var(--chart-1) ${100 - i * 14}%, var(--chart-2))` }}
                    />
                  </span>
                </button>
                {next ? (
                  <div className="relative my-1 flex h-12 items-center justify-center" aria-hidden="true">
                    <span
                      className="absolute inset-y-0 start-1/2 -translate-x-1/2 rtl:translate-x-1/2"
                      style={{ width: `${w}%`, background: "color-mix(in oklab, var(--chart-1) 14%, transparent)", clipPath: `polygon(0 0, 100% 0, ${50 + nw / w * 50}% 100%, ${50 - nw / w * 50}% 100%)` }}
                    />
                    <span className={cn("bg-card relative flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tabular-nums", isLeak && "border-destructive/50 text-destructive")}>
                      <ArrowDown className="size-3" />
                      {n(next.lost)} lost · {((1 - next.kept) * 100).toFixed(0)}%
                    </span>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ol>
      </div>

      <aside aria-label="Insights" className="grid gap-4 lg:sticky lg:top-6">
        {model.leak ? (
          <div className="bg-card rounded-2xl border p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb aria-hidden="true" className="size-4 text-amber-500" />
              Biggest leak
            </h2>
            <p className="mt-3 text-pretty">
              Between <strong>{model.rows[model.leak.i - 1]!.name}</strong> and <strong>{model.leak.name}</strong>, {((1 - model.leak.kept) * 100).toFixed(0)}% of people stop: {n(model.leak.lost)} {model.leak.lost === 1 ? "person" : "people"} in {period.toLowerCase()}.
            </p>
            <p className="text-muted-foreground mt-2 text-sm text-pretty">Winning back one in ten of them would bring in about {n(Math.round(model.leak.lost / 10 * model.rows.slice(model.leak.i).reduce((p, r, k, a) => (k ? p * (r.kept || 0) : p), 1)))} more at the end.</p>
          </div>
        ) : null}
        <div className="bg-card rounded-2xl border p-5" aria-live="polite">
          {chosen ? (
            <>
              <h2 className="text-sm font-semibold">{chosen.name}</h2>
              <dl className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Reached it</dt><dd className="font-medium tabular-nums">{n(chosen.count)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Of the first step</dt><dd className="font-medium tabular-nums">{(chosen.share * 100).toFixed(1)}%</dd></div>
                {chosen.i ? <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Of the step before</dt><dd className="font-medium tabular-nums">{(chosen.kept * 100).toFixed(1)}%</dd></div> : null}
                {chosen.i ? <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Lost on the way in</dt><dd className="font-medium tabular-nums">{n(chosen.lost)}</dd></div> : null}
              </dl>
            </>
          ) : (
            <p className="text-muted-foreground text-sm text-pretty">Choose a step to see what happened there.</p>
          )}
        </div>
      </aside>
    </div>
  )

  return (
    <section data-slot="funnel-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <p className="text-muted-foreground text-sm font-medium">{period}</p>
        <h1 id={`${id}-title`} className="mt-1 text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 text-pretty">{description}</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the funnel" loading={<Skel />} error={{ title: errorState?.title ?? "The funnel could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Funnel1, type Funnel1Props, type Funnel1Segment, type Funnel1Step }
