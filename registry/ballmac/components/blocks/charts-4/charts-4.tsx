// Ballmac UI: Charts 4. https://ui.ballmac.com/blocks/charts-4
"use client"

import * as React from "react"
import { Target } from "lucide-react"

import { ChartBar } from "@/components/ballmac/chart-bar"
import { ChartRadar } from "@/components/ballmac/chart-radar"
import { ChartRadial } from "@/components/ballmac/chart-radial"
import { KpiItem, KpiRow } from "@/components/ballmac/kpi-row"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Charts4Goal = { name: string; label: string; /** Percent of the target reached. */ value: number }
type Charts4Area = { area: string; current: number; target: number }
type Charts4Leader = { name: string; value: number }

type Charts4Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    /** The goals, each as the percent of its target reached. Up to four read well as rings. */
    goals?: Charts4Goal[]
    /** How the team scores on each area, against the score it is aiming for. 0 to 100. */
    profile?: Charts4Area[]
    /** The people or teams to rank. */
    leaders?: Charts4Leader[]
    /** Writes a leader's number. */
    leaderFormatter?: (value: number) => string
    /** What the leaders are ranked on: "Closed deals". */
    leaderTitle?: string
    locale?: string
  }

const sampleGoals: Charts4Goal[] = [
  { name: "revenue", label: "Revenue", value: 92 },
  { name: "retention", label: "Retention", value: 78 },
  { name: "launches", label: "Launches", value: 60 },
]
const sampleProfile: Charts4Area[] = [
  { area: "Quality", current: 82, target: 90 },
  { area: "Speed", current: 68, target: 80 },
  { area: "Cost", current: 74, target: 75 },
  { area: "Support", current: 88, target: 85 },
  { area: "Docs", current: 57, target: 80 },
  { area: "Security", current: 79, target: 90 },
]
const sampleLeaders: Charts4Leader[] = [
  { name: "Maya Jensen", value: 412000 },
  { name: "Tomás Rivera", value: 368000 },
  { name: "Aiko Tanaka", value: 331000 },
  { name: "Priya Nair", value: 296000 },
  { name: "Liam O'Connor", value: 244000 },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="aspect-square rounded-xl" />
      </div>
      <Skeleton className="aspect-[2/1] rounded-xl" />
    </div>
  )
}

/**
 * A quarterly scorecard: how many goals are met and how far along the rest are, concentric rings for the goals, a radar of the team against its targets
 * and a ranked bar chart. The headline figures are worked out from the data, and every chart has a table view and a CSV download.
 */
function Charts4({
  title = "Quarterly scorecard",
  description = "Goals, how the team scores and who is leading.",
  goals = sampleGoals,
  profile = sampleProfile,
  leaders = sampleLeaders,
  leaderFormatter = (v) => `$${Math.round(v / 1000)}k`,
  leaderTitle = "Closed deals",
  locale = "en",
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Charts4Props) {
  const id = React.useId()
  const g = state === "empty" ? [] : goals
  const met = g.filter((x) => x.value >= 100).length
  const average = g.length ? g.reduce((sum, x) => sum + x.value, 0) / g.length : 0
  const gaps = profile.map((a) => ({ ...a, gap: a.target - a.current })).sort((a, b) => b.gap - a.gap)
  const widest = gaps[0]
  const top = [...leaders].sort((a, b) => b.value - a.value)[0]
  const pct = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })

  const content = !g.length ? null : (
    <div className="grid gap-6">
      <KpiRow columns={4} className="w-full">
        <KpiItem label="Goals met" value={`${met} of ${g.length}`} detail="At or over their target" />
        <KpiItem label="Average progress" value={`${pct.format(average)}%`} detail="Across every goal" />
        <KpiItem label="Biggest gap" value={widest && widest.gap > 0 ? widest.area : "None"} detail={widest && widest.gap > 0 ? `${widest.gap} points under target` : "Every area is on target"} />
        <KpiItem label="Leading" value={top?.name ?? "–"} detail={top ? `${leaderFormatter(top.value)} ${leaderTitle.toLowerCase()}` : undefined} />
      </KpiRow>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 [&>*]:min-w-0">
        <ChartRadial title="Goals" description="Percent of each target" data={g} centerLabel={false} valueFormatter={(v) => `${v}%`} valueLabel="of target" categoryLabel="Goal" locale={locale} />
        <ChartRadar
          title="Team profile"
          description="Score against the target, 0 to 100"
          data={profile}
          xKey="area"
          categoryLabel="Area"
          domain={[0, 100]}
          locale={locale}
          series={[
            { key: "target", label: "Target", color: "var(--chart-3)" },
            { key: "current", label: "Current" },
          ]}
        />
      </div>

      <ChartBar title={leaderTitle} description="This quarter, highest first" data={leaders} xKey="name" categoryLabel="Name" layout="bars" sort="descending" labels valueAxis={false} grid="none" highlight={top?.name} valueFormatter={leaderFormatter} locale={locale} aspect="panorama" series={[{ key: "value", label: leaderTitle }]} radius={8} />
    </div>
  )

  return (
    <section data-slot="charts-4" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">{description}</p>
      </header>
      <StateView
        state={state === "empty" || !g.length ? "empty" : state === "loading" || state === "error" ? state : "ready"}
        onRetry={onRetry}
        label="Loading the scorecard"
        loading={<Skel />}
        empty={{ icon: <Target />, title: emptyState?.title ?? "No goals yet", description: emptyState?.description ?? "Set a goal and its progress appears here.", action: emptyState?.action }}
        error={{ title: errorState?.title ?? "The scorecard could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}
      >
        {content}
      </StateView>
    </section>
  )
}

export { Charts4, type Charts4Props, type Charts4Goal, type Charts4Area, type Charts4Leader }
