// Ballmac UI: Pricing 4. https://ui.ballmac.com/blocks/pricing-4
"use client"

import * as React from "react"
import { Check, ShieldCheck } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { buttonVariants } from "@/components/ballmac/button"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ballmac/chart"
import { Label } from "@/components/ballmac/label"
import { RadioGroup, RadioGroupOption } from "@/components/ballmac/radio-group"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { Switch } from "@/components/ballmac/switch"
import { cn } from "@/lib/utils"

type Pricing4Tier = {
  /** Stable key, e.g. "solo". */
  id: string
  /** Tier name, e.g. "1 Mac". */
  name: string
  /** One short line, e.g. "For your own Mac". */
  description?: string
  /** One-time price for this tier, in whole currency units. */
  once: number
  /** Subscription price per year for this tier. */
  yearly: number
}

type Pricing4Mode = "once" | "subscribe"

type Pricing4Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Section heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** License sizes to choose from. */
  tiers?: Pricing4Tier[]
  /** Which tier starts selected (an `id`). Defaults to the second tier. */
  defaultTier?: string
  /** Which way to pay starts selected. */
  defaultMode?: Pricing4Mode
  /** Yearly price of optional updates after the first year of a one-time license, per tier id. A single number applies to every tier. */
  renewal?: number | Record<string, number>
  /** Number of years the cost chart covers (2 to 8). */
  years?: number
  /** ISO 4217 currency code. */
  currency?: string
  /** What the one-time license includes. */
  onceIncludes?: string[]
  /** What the subscription includes. */
  subscribeIncludes?: string[]
  /** Where the buy button goes. Receives the tier id and the way to pay. */
  href?: (tierId: string, mode: Pricing4Mode) => string
  /** Money-back line under the button. Pass null to hide it. */
  guarantee?: string | null
}

const defaultTiers: Pricing4Tier[] = [
  { id: "solo", name: "1 Mac", description: "Just for you", once: 49, yearly: 39 },
  { id: "trio", name: "3 Macs", description: "Desk, laptop and studio", once: 99, yearly: 79 },
  { id: "five", name: "5 Macs", description: "A small team", once: 149, yearly: 119 },
]

const defaultOnce = ["Yours to keep, no account needed", "A full year of updates", "Every Mac you license, forever"]
const defaultSubscribe = ["Every update, always current", "Priority email support", "Cancel any time, keep your data"]

const MODE_COPY: Record<Pricing4Mode, { label: string; cta: string; period: string }> = {
  once: { label: "Buy once", cta: "Buy a license", period: "one payment" },
  subscribe: { label: "Subscribe", cta: "Start subscription", period: "per year" },
}

function Pricing4({
  title = "Pay once, or stay current.",
  description = "Own it outright with a one-time license, or subscribe for every update. See exactly when each one pays off.",
  tiers = defaultTiers,
  defaultTier,
  defaultMode = "once",
  renewal = 19,
  years: yearsProp = 5,
  currency = "USD",
  onceIncludes = defaultOnce,
  subscribeIncludes = defaultSubscribe,
  href = () => "#",
  guarantee = "30-day money-back guarantee",
  className,
  ...props
}: Pricing4Props) {
  const years = Math.min(8, Math.max(2, Math.round(yearsProp)))
  const [mode, setMode] = React.useState<Pricing4Mode>(defaultMode)
  const [tierId, setTierId] = React.useState(defaultTier ?? tiers[1]?.id ?? tiers[0]?.id ?? "")
  const [keepUpdates, setKeepUpdates] = React.useState(false)
  const baseId = React.useId()

  const tier = tiers.find((t) => t.id === tierId) ?? tiers[0]
  const money = React.useMemo(() => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }), [currency])

  if (!tier) return null

  const renew = typeof renewal === "number" ? renewal : (renewal[tier.id] ?? 0)
  const onceAt = (y: number) => tier.once + (keepUpdates ? renew * (y - 1) : 0)
  const subAt = (y: number) => tier.yearly * y
  const data = Array.from({ length: years }, (_, i) => ({ year: `Year ${i + 1}`, once: onceAt(i + 1), subscribe: subAt(i + 1) }))
  const breakEven = data.findIndex((_, i) => subAt(i + 1) >= onceAt(i + 1))
  const breakYear = breakEven === -1 ? null : breakEven + 1
  const saved = subAt(years) - onceAt(years)

  const headline =
    breakYear === null
      ? `Subscribing costs less than buying over ${years} years`
      : breakYear === 1
        ? "A one-time license is cheaper from day one"
        : `A one-time license pays for itself in year ${breakYear}`
  const detail =
    breakYear === null
      ? `The subscription totals ${money.format(subAt(years))} against ${money.format(onceAt(years))} for the license, so it is the cheaper way to pay.`
      : `By year ${years} you will have paid ${money.format(onceAt(years))} instead of ${money.format(subAt(years))}${saved > 0 ? `, saving ${money.format(saved)}` : ""}.`

  const config = {
    once: { label: keepUpdates ? "Buy once, with updates" : "Buy once", color: "var(--chart-1)" },
    subscribe: { label: "Subscribe", color: "var(--chart-3)" },
  } satisfies ChartConfig

  const price = mode === "once" ? tier.once : tier.yearly
  const includes = mode === "once" ? onceIncludes : subscribeIncludes
  const modeLabelId = `${baseId}-mode`
  const tierLabelId = `${baseId}-tier`

  return (
    <section data-slot="pricing-4" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
      </div>

      <div className="mt-12 grid items-start gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="bg-card rounded-3xl border p-5 shadow-sm sm:p-6">
          <p id={modeLabelId} className="sr-only">Way to pay</p>
          <SegmentedControl aria-labelledby={modeLabelId} value={mode} onValueChange={(v) => setMode(v as Pricing4Mode)} fullWidth>
            <SegmentedControlItem value="once">{MODE_COPY.once.label}</SegmentedControlItem>
            <SegmentedControlItem value="subscribe">{MODE_COPY.subscribe.label}</SegmentedControlItem>
          </SegmentedControl>

          <p id={tierLabelId} className="text-muted-foreground mt-6 text-xs font-semibold tracking-wide uppercase">License size</p>
          <RadioGroup aria-labelledby={tierLabelId} value={tier.id} onValueChange={setTierId} className="mt-2 grid gap-2">
            {tiers.map((t) => (
              <RadioGroupOption key={t.id} value={t.id} title={t.name} description={t.description}>
                <span className="text-sm font-semibold tabular-nums">{money.format(mode === "once" ? t.once : t.yearly)}</span>
              </RadioGroupOption>
            ))}
          </RadioGroup>

          <div className="mt-6 flex items-baseline gap-2" aria-live="polite">
            <span className="text-5xl font-semibold tracking-[-0.045em] tabular-nums">{money.format(price)}</span>
            <span className="text-muted-foreground text-sm">{MODE_COPY[mode].period}</span>
          </div>
          <ul className="mt-4 grid gap-2">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <Check className="text-chart-2 mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <a href={href(tier.id, mode)} className={buttonVariants({ shape: "pill", size: "lg", className: "mt-6 w-full" })}>
            {MODE_COPY[mode].cta}
          </a>
          {guarantee && (
            <p className="text-muted-foreground mt-3 flex items-center justify-center gap-1.5 text-xs">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              {guarantee}
            </p>
          )}
        </div>

        <div className="bg-card rounded-3xl border p-5 sm:p-6">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">What you pay over time · {tier.name}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-balance sm:text-2xl" aria-live="polite">{headline}</h3>
          <p className="text-muted-foreground mt-1.5 text-sm text-pretty">{detail}</p>

          <ChartContainer
            config={config}
            label={`Total cost over ${years} years: one-time license against subscription`}
            summary={`${headline}. ${detail}`}
            className="mt-5 aspect-[16/10] w-full"
          >
            <LineChart data={data} margin={{ left: 0, right: 12, top: 8 }} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => money.format(v)} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" formatter={(v) => money.format(Number(v))} />} />
              <Line dataKey="subscribe" type="monotone" stroke="var(--color-subscribe)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              <Line dataKey="once" type="monotone" stroke="var(--color-once)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>

          {renew > 0 && (
            <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border p-3">
              <Label htmlFor={`${baseId}-keep`} className="text-sm leading-snug">
                Keep updates after year 1
                <span className="text-muted-foreground block text-xs font-normal">{money.format(renew)} per year, optional</span>
              </Label>
              <Switch id={`${baseId}-keep`} checked={keepUpdates} onCheckedChange={setKeepUpdates} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export { Pricing4, type Pricing4Props, type Pricing4Tier, type Pricing4Mode }
