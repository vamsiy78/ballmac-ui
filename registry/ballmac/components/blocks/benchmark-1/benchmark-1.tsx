// Ballmac UI: Benchmark 1. https://ui.ballmac.com/blocks/benchmark-1
"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"

import { BarList, type BarListItem } from "@/components/ballmac/bar-list"
import { DumbbellChart, type DumbbellRow } from "@/components/ballmac/dumbbell-chart"
import { Skeleton } from "@/components/ballmac/skeleton"
import { SplitBar, type SplitSegment } from "@/components/ballmac/split-bar"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Benchmark1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    /** The two things compared, for example two model versions. */
    from?: string
    to?: string
    /** Quality per task, in percent, for both. */
    quality?: DumbbellRow[]
    /** Response time per task in milliseconds, for both. */
    speed?: DumbbellRow[]
    /** What a thousand runs cost, split by what it was spent on, for the new one. */
    cost?: SplitSegment[]
    /** The slowest steps of the new one. */
    slowest?: BarListItem[]
  }

const sampleQuality: DumbbellRow[] = [
  { id: "1", label: "Refund questions", before: 71, after: 86 },
  { id: "2", label: "Order status", before: 92, after: 94 },
  { id: "3", label: "Account access", before: 88, after: 81 },
  { id: "4", label: "Billing disputes", before: 54, after: 69 },
  { id: "5", label: "Product advice", before: 63, after: 63 },
  { id: "6", label: "Shipping times", before: 90, after: 95 },
]
const sampleSpeed: DumbbellRow[] = [
  { id: "1", label: "Refund questions", before: 1480, after: 920 },
  { id: "2", label: "Order status", before: 760, after: 540 },
  { id: "3", label: "Account access", before: 980, after: 1120 },
  { id: "4", label: "Billing disputes", before: 2100, after: 1650 },
]
const sampleCost: SplitSegment[] = [
  { id: "in", label: "Reading the question and context", value: 310 },
  { id: "tools", label: "Tool calls", value: 180 },
  { id: "out", label: "Writing the answer", value: 420 },
  { id: "check", label: "Checking the answer", value: 90 },
]
const sampleSlow: BarListItem[] = [
  { id: "1", label: "Search the help center", value: 640 },
  { id: "2", label: "Look up the order", value: 410 },
  { id: "3", label: "Write the answer", value: 380 },
  { id: "4", label: "Check against policy", value: 190 },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-96 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div>
    </div>
  )
}

/**
 * A before-and-after benchmark for two versions of a model or prompt: a sentence that sums up what got better and what got worse, quality and speed task by task,
 * what a run costs and where the time goes. Each chart says its changes in words.
 */
function Benchmark1({ title = "Model benchmark", description = "What changed between the two versions, task by task.", from = "Prompt v14", to = "Prompt v15", quality = sampleQuality, speed = sampleSpeed, cost = sampleCost, slowest = sampleSlow, state = "ready", onRetry, emptyState, errorState, className, ...props }: Benchmark1Props) {
  const id = React.useId()
  const view = state === "ready" && quality.length === 0 ? "empty" : state
  const better = quality.filter((r) => r.after > r.before).length
  const worse = quality.filter((r) => r.after < r.before).length
  const avgBefore = quality.reduce((s, r) => s + r.before, 0) / (quality.length || 1)
  const avgAfter = quality.reduce((s, r) => s + r.after, 0) / (quality.length || 1)
  const faster = speed.filter((r) => r.after < r.before).length
  const costTotal = cost.reduce((s, c) => s + c.value, 0)

  return (
    <section data-slot="benchmark-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-6">
        <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.03em] text-balance">{title}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono text-xs text-foreground">{from}</span>
          <ArrowRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
          <span className="font-mono text-xs text-foreground">{to}</span>
          <span className="text-pretty">· {description}</span>
        </p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading the benchmark" loading={<Skel />} empty={{ title: "Nothing to compare yet", description: "Run both versions on the same cases to see how they differ.", ...emptyState }} error={{ title: "The benchmark could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid gap-6">
          <p className="rounded-xl border bg-card px-5 py-4 text-base text-pretty">
            <span className="font-semibold">{to}</span> is better on {better} of {quality.length} tasks and worse on {worse}. Average quality went from {avgBefore.toFixed(0)}% to {avgAfter.toFixed(0)}%, and {faster} of {speed.length} tasks got faster.
          </p>
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-5 sm:p-6">
              <DumbbellChart title="Answers rated helpful" rows={quality} beforeLabel={from} afterLabel={to} format={(v) => `${v}%`} />
            </div>
            <div className="rounded-xl border bg-card p-5 sm:p-6">
              <DumbbellChart title="Time to answer" rows={speed} beforeLabel={from} afterLabel={to} lowerIsBetter format={(v) => `${(v / 1000).toFixed(2)} s`} />
            </div>
          </div>
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-5 sm:p-6">
              <SplitBar title={`Cost of 1,000 runs on ${to}`} total={`$${costTotal.toLocaleString("en-US")}`} segments={cost} format={(v) => `$${v}`} />
            </div>
            <div className="rounded-xl border bg-card p-5 sm:p-6">
              <BarList title={`Where the time goes on ${to}`} items={slowest} format={(v) => `${v} ms`} showShare />
            </div>
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Benchmark1, type Benchmark1Props }
