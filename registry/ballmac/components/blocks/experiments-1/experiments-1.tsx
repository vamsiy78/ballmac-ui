// Ballmac UI: Experiments 1. https://ui.ballmac.com/blocks/experiments-1
"use client"

import * as React from "react"
import { CircleCheck, FlaskConical, Hourglass, Minus, Rocket, TrendingDown, TrendingUp } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Experiments1Variant = { id: string; name: string; visitors: number; conversions: number; /** The version everyone sees today. */ control?: boolean }

type Experiments1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    /** What was changed, in a sentence. */
    hypothesis?: string
    /** What counts as a win, such as "Started a trial". */
    metric?: string
    /** "Running since 4 October" or "Ended 16 October", already written for people. */
    status?: string
    variants?: Experiments1Variant[]
    /** How sure to be before calling a winner, from 0.8 to 0.99. */
    confidence?: number
    /** Called when someone chooses to ship a variant. */
    onShip?: (variant: Experiments1Variant) => void
  }

const sample: Experiments1Variant[] = [
  { id: "a", name: "Current form", visitors: 6420, conversions: 385, control: true },
  { id: "b", name: "Shorter form", visitors: 6388, conversions: 471 },
  { id: "c", name: "Social proof above the fold", visitors: 6451, conversions: 412 },
]

// Normal distribution helpers: Abramowitz and Stegun 7.1.26 for the error function, so there are no dependencies and no randomness.
function erf(x: number) {
  const s = x < 0 ? -1 : 1
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return s * y
}
const cdf = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2))
const Z95 = 1.959964

// Wilson score interval: stays inside 0 to 1 and behaves with small counts, unlike the plain +/- interval.
function wilson(x: number, n: number, z = Z95) {
  if (!n) return [0, 0] as const
  const p = x / n
  const d = 1 + (z * z) / n
  const c = p + (z * z) / (2 * n)
  const m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))
  return [(c - m) / d, (c + m) / d] as const
}

const pct = (x: number, d = 2) => `${(x * 100).toFixed(d)}%`
// Never promise certainty: a chance of 99.97% reads as 99.9%, and 0.02% as 0.1%.
const chance = (x: number) => `${Math.min(99.9, Math.max(0.1, x * 100)).toFixed(1)}%`

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      <Skeleton className="h-28 rounded-2xl" />
      <div className="rounded-2xl border p-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="py-5 first:pt-0 last:pb-0">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-6 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * A/B test results with the statistics done properly: each variant's conversion rate with its 95% confidence interval drawn on one shared
 * axis, the lift over the control, the chance it really beats the control, and a plain verdict (a winner, no clear difference, or how much
 * more traffic is needed). It works out everything from visitors and conversions; the maths is deterministic.
 */
function Experiments1({
  title = "Signup page: form length",
  hypothesis = "A shorter signup form will get more people to start a trial.",
  metric = "Started a trial",
  status = "Running since 4 October",
  variants = sample,
  confidence = 0.95,
  onShip,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Experiments1Props) {
  const id = React.useId()
  const list = state === "empty" ? [] : variants
  const control = list.find((v) => v.control) ?? list[0]

  const rows = list.map((v) => {
    const rate = v.visitors ? v.conversions / v.visitors : 0
    const [lo, hi] = wilson(v.conversions, v.visitors)
    let lift: number | null = null
    let beat: number | null = null
    let p: number | null = null
    if (control && v !== control && control.visitors && v.visitors) {
      const p1 = control.conversions / control.visitors
      const se = Math.sqrt((p1 * (1 - p1)) / control.visitors + (rate * (1 - rate)) / v.visitors)
      const z = se ? (rate - p1) / se : 0
      lift = p1 ? (rate - p1) / p1 : null
      beat = cdf(z)
      // Two-sided p-value of the difference between two proportions.
      const pooled = (control.conversions + v.conversions) / (control.visitors + v.visitors)
      const sep = Math.sqrt(pooled * (1 - pooled) * (1 / control.visitors + 1 / v.visitors))
      p = sep ? 2 * (1 - cdf(Math.abs(rate - p1) / sep)) : 1
    }
    return { v, rate, lo, hi, lift, beat, p }
  })

  const alpha = 1 - confidence
  const contenders = rows.filter((r) => r.p !== null)
  const best = contenders.reduce<(typeof rows)[number] | null>((b, r) => (!b || (r.lift ?? -1) > (b.lift ?? -1) ? r : b), null)
  const significant = best && best.p! < alpha
  // Visitors still needed per variant to see the observed gap with 80% power at this confidence.
  const need = (() => {
    if (!best || !control) return 0
    const p1 = control.conversions / control.visitors
    const p2 = best.rate
    const d = Math.abs(p2 - p1)
    if (d < 1e-6) return Infinity
    const za = 1.959964
    const zb = 0.841621
    const n = (2 * (za + zb) ** 2 * ((p1 + p2) / 2) * (1 - (p1 + p2) / 2)) / (d * d)
    return Math.max(0, Math.ceil(n) - Math.min(control.visitors, best.v.visitors))
  })()

  const verdict = !control || !best
    ? null
    : significant && (best.lift ?? 0) > 0
      ? { tone: "win", icon: CircleCheck, head: `${best.v.name} is winning`, body: `It converts ${pct(best.rate)} against ${pct(control.conversions / control.visitors)}, ${pct(best.lift ?? 0, 1)} better, and there is a ${chance(best.beat ?? 0)} chance it truly beats ${control.name}.` }
      : significant
        ? { tone: "lose", icon: TrendingDown, head: `${control.name} is still the best`, body: `${best.v.name} converts worse than ${control.name}, and the gap is unlikely to be chance.` }
        : Number.isFinite(need) && need > 0
          ? { tone: "wait", icon: Hourglass, head: "Not enough data to call it yet", body: `${best.v.name} looks ahead, but the gap could still be luck. Roughly ${new Intl.NumberFormat("en").format(Math.ceil(need / 100) * 100)} more visitors for each version would settle it.` }
          : { tone: "flat", icon: Minus, head: "No clear difference", body: `The versions convert about the same. More traffic will not change that much.` }

  const max = Math.max(...rows.map((r) => r.hi), 0.0001)
  const min = Math.min(...rows.map((r) => r.lo), max)
  const pad = (max - min) * 0.12
  const lo0 = Math.max(0, min - pad)
  const hi0 = max + pad
  const x = (v: number) => `${((v - lo0) / (hi0 - lo0 || 1)) * 100}%`
  const toneBox = { win: "bg-chart-2/10 border-chart-2/30", lose: "bg-destructive/10 border-destructive/30", wait: "bg-amber-500/10 border-amber-500/40", flat: "bg-muted border-border" }

  const content = !list.length ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <FlaskConical className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No results yet"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm text-pretty">{emptyState?.description ?? "Once visitors have seen the versions, their results appear here."}</p>
      {emptyState?.action}
    </div>
  ) : (
    <div className="grid gap-6">
      {verdict ? (
        <div role="status" className={cn("flex items-start gap-4 rounded-2xl border p-5 sm:p-6", toneBox[verdict.tone as keyof typeof toneBox])}>
          <verdict.icon aria-hidden="true" className="mt-0.5 size-7 shrink-0" />
          <div className="min-w-0">
            <p className="text-xl font-semibold tracking-tight text-balance">{verdict.head}</p>
            <p className="text-muted-foreground mt-1 text-sm text-pretty">{verdict.body}</p>
          </div>
        </div>
      ) : null}

      <div className="bg-card rounded-2xl border">
        <div className="flex items-center justify-between gap-4 border-b px-5 py-3.5 text-sm sm:px-6">
          <p className="font-medium">{metric}</p>
          <p className="text-muted-foreground tabular-nums">
            {new Intl.NumberFormat("en").format(rows.reduce((n, r) => n + r.v.visitors, 0))} visitors
          </p>
        </div>
        <ul className="divide-y">
          {rows.map((r) => {
            const leader = r === best && significant && (r.lift ?? 0) > 0
            return (
              <li key={r.v.id} className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                  <div className="min-w-0">
                    <h3 className="flex flex-wrap items-center gap-2 font-semibold tracking-tight">
                      {r.v.name}
                      {r.v.control ? <span className="bg-muted rounded-full border px-2 py-0.5 text-xs font-medium">Control</span> : null}
                      {leader ? <span className="bg-chart-2/15 rounded-full border px-2 py-0.5 text-xs font-medium">Winning</span> : null}
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-sm tabular-nums">
                      {new Intl.NumberFormat("en").format(r.v.conversions)} of {new Intl.NumberFormat("en").format(r.v.visitors)} visitors
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-3xl font-semibold tracking-[-0.04em] tabular-nums">{pct(r.rate)}</p>
                    {r.lift !== null ? (
                      <p className={cn("mt-0.5 inline-flex items-center gap-1 text-sm font-medium tabular-nums", r.lift > 0 ? "text-chart-2" : r.lift < 0 ? "text-destructive" : "text-muted-foreground")}>
                        {r.lift >= 0 ? <TrendingUp aria-hidden="true" className="size-4" /> : <TrendingDown aria-hidden="true" className="size-4" />}
                        <span className="text-foreground">
                          {r.lift >= 0 ? "+" : ""}
                          {pct(r.lift, 1)} <span className="text-muted-foreground font-normal">vs control</span>
                        </span>
                      </p>
                    ) : (
                      <p className="text-muted-foreground mt-0.5 text-sm">The baseline</p>
                    )}
                  </div>
                </div>

                <div dir="ltr" role="img" aria-label={`${r.v.name}: ${pct(r.rate)}, likely between ${pct(r.lo)} and ${pct(r.hi)}`} className="relative mt-5 h-6">
                  <span aria-hidden="true" className="bg-border absolute inset-x-0 top-1/2 h-px" />
                  {control ? <span aria-hidden="true" className="bg-foreground/40 absolute inset-y-0 w-px border-s border-dashed" style={{ left: x(control.conversions / control.visitors) }} /> : null}
                  <span aria-hidden="true" className={cn("absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full", leader ? "bg-chart-2/40" : "bg-foreground/15")} style={{ left: x(r.lo), width: `calc(${x(r.hi)} - ${x(r.lo)})` }} />
                  <span aria-hidden="true" className={cn("border-background absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-sm", leader ? "bg-chart-2" : "bg-foreground")} style={{ left: x(r.rate) }} />
                </div>
                <div aria-hidden="true" dir="ltr" className="text-muted-foreground mt-1 flex justify-between text-xs tabular-nums">
                  <span>{pct(lo0, 1)}</span>
                  <span>{pct(hi0, 1)}</span>
                </div>

                {r.beat !== null ? (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm">
                      <span className="font-semibold tabular-nums">{chance(r.beat)}</span> <span className="text-muted-foreground">chance to beat the control</span>
                      <span className="text-muted-foreground tabular-nums"> · p = {r.p! < 0.001 ? "<0.001" : r.p!.toFixed(3)}</span>
                    </p>
                    {onShip ? (
                      <Button variant={leader ? "default" : "outline"} size="sm" onClick={() => onShip(r.v)}>
                        <Rocket aria-hidden="true" />
                        Ship {r.v.name}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
      <p className="text-muted-foreground text-xs text-pretty">
        Bars show where the true rate most likely lies (95% confidence interval). The dashed line is the control. A winner is called when the chance the difference is luck is under {pct(alpha, 0)}.
      </p>
    </div>
  )

  return (
    <section data-slot="experiments-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <FlaskConical aria-hidden="true" className="size-4" />
          Experiment · {status}
        </p>
        <h1 id={`${id}-title`} className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">{hypothesis}</p>
      </header>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading experiment results" loading={<Skel />} error={{ title: errorState?.title ?? "Results could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Experiments1, type Experiments1Props, type Experiments1Variant }
