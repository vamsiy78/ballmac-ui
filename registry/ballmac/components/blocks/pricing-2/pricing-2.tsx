// Ballmac UI: Pricing 2. https://ui.ballmac.com/blocks/pricing-2
"use client"

import * as React from "react"
import { ArrowRight, Check } from "lucide-react"

import { AnimatedNumberFlow } from "@/components/ballmac/animated-number-flow"
import { Badge } from "@/components/ballmac/badge"
import { BorderBeam } from "@/components/ballmac/border-beam"
import { buttonVariants } from "@/components/ballmac/button"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { cn } from "@/lib/utils"

type Pricing2Interval = "monthly" | "yearly"

type Pricing2Plan = {
  /** Plan name. */
  name: string
  /** One sentence about who it is for. */
  description: string
  /**
   * Price per month. Give `{ monthly, yearly }` where `yearly` is the per-month price when billed
   * annually, or a string such as "Custom" for a plan without a number.
   */
  price: { monthly: number; yearly: number } | string
  /** What the price is for, e.g. "per seat". */
  unit?: string
  /** Lead-in line above the feature list, e.g. "Everything in Starter, plus:". */
  lead?: string
  /** Included features. */
  features: string[]
  /** Button. */
  cta: { label: string; href: string }
  /** Emphasise this plan. */
  featured?: boolean
}

type Pricing2Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Section heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** Three plans read best. */
  plans?: Pricing2Plan[]
  /** Billing interval shown first. */
  defaultInterval?: Pricing2Interval
  /** Controlled billing interval. */
  interval?: Pricing2Interval
  /** Called when the visitor switches interval. */
  onIntervalChange?: (interval: Pricing2Interval) => void
  /** Badge next to the yearly option. Set to an empty string to hide it. */
  discountLabel?: string
  /** Currency code for the numeric prices. */
  currency?: string
  /** Small print under the plans. */
  note?: string
  /** Strip under the plans for a sales-led offer. Set to null to hide it. */
  enterprise?: { title: string; description: string; cta: { label: string; href: string } } | null
}

const defaultPlans: Pricing2Plan[] = [
  {
    name: "Starter",
    description: "For individuals and small side projects.",
    price: { monthly: 12, yearly: 9 },
    unit: "per month",
    features: ["Up to 3 projects", "10 GB storage", "Basic analytics", "Community support"],
    cta: { label: "Start free", href: "#" },
  },
  {
    name: "Pro",
    description: "For growing teams that ship every week.",
    price: { monthly: 32, yearly: 25 },
    unit: "per seat / month",
    lead: "Everything in Starter, plus:",
    features: ["Unlimited projects", "1 TB storage", "Advanced analytics", "Team roles and SSO", "Priority support"],
    cta: { label: "Start 14-day trial", href: "#" },
    featured: true,
  },
  {
    name: "Scale",
    description: "For companies with security and volume needs.",
    price: { monthly: 79, yearly: 63 },
    unit: "per seat / month",
    lead: "Everything in Pro, plus:",
    features: ["Audit log and SCIM", "Custom data retention", "99.99% uptime SLA", "Dedicated success manager"],
    cta: { label: "Talk to sales", href: "#" },
  },
]

function Pricing2({
  title = "Plans that grow with your team.",
  description = "Start free for 14 days. Switch or cancel whenever you like.",
  plans = defaultPlans,
  defaultInterval = "yearly",
  interval: intervalProp,
  onIntervalChange,
  discountLabel = "Save 20%",
  currency = "USD",
  note = "Prices in USD, billed per workspace. Taxes may apply.",
  enterprise = {
    title: "Need something custom?",
    description: "Volume pricing, private cloud and procurement support for 500+ seats.",
    cta: { label: "Contact sales", href: "#" },
  },
  className,
  ...props
}: Pricing2Props) {
  const [internal, setInternal] = React.useState<Pricing2Interval>(defaultInterval)
  const interval = intervalProp ?? internal
  const yearly = interval === "yearly"
  const format = React.useMemo<Intl.NumberFormatOptions>(() => ({ style: "currency", currency, maximumFractionDigits: 0 }), [currency])

  function change(next: string) {
    const value = next as Pricing2Interval
    if (intervalProp === undefined) setInternal(value)
    onIntervalChange?.(value)
  }

  return (
    <section data-slot="pricing-2" className={cn("mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <SegmentedControl aria-label="Billing interval" value={interval} onValueChange={change}>
            <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
            <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
          </SegmentedControl>
          {discountLabel && (
            <Badge status="success" className={cn("transition-opacity duration-200", !yearly && "opacity-60")}>
              {discountLabel}
            </Badge>
          )}
        </div>
        <p role="status" className="sr-only">{yearly ? "Showing yearly prices, billed annually." : "Showing monthly prices."}</p>
      </div>

      <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const numeric = typeof plan.price === "string" ? null : plan.price
          const amount = numeric ? (yearly ? numeric.yearly : numeric.monthly) : null
          return (
            <div
              key={plan.name}
              data-featured={plan.featured || undefined}
              className={cn(
                "bg-card relative flex flex-col rounded-3xl border p-7 sm:p-8",
                plan.featured && "border-foreground/20 shadow-[0_40px_90px_-45px_rgb(0_0_0/0.5)] lg:-my-3 lg:py-10"
              )}
            >
              {plan.featured && <BorderBeam duration={12} className="rounded-3xl" />}
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {plan.featured && <Badge>Most popular</Badge>}
              </div>
              <p className="text-muted-foreground mt-2 text-sm text-pretty lg:min-h-10">{plan.description}</p>
              <div className="mt-7 flex items-baseline gap-2">
                {amount === null ? (
                  <span className="text-5xl font-semibold tracking-[-0.04em]">{plan.price as string}</span>
                ) : (
                  <AnimatedNumberFlow value={amount} format={format} fade className="text-5xl font-semibold tracking-[-0.04em]" />
                )}
                {plan.unit && amount !== null && <span className="text-muted-foreground text-sm">{plan.unit}</span>}
              </div>
              <p className="text-muted-foreground mt-1.5 h-5 text-xs">
                {numeric && (yearly ? `Billed ${new Intl.NumberFormat("en-US", format).format(numeric.yearly * 12)} per year` : "Billed monthly")}
              </p>
              <a
                href={plan.cta.href}
                className={buttonVariants({ variant: plan.featured ? "default" : "outline", size: "lg", shape: "pill", className: "mt-6 w-full" })}
              >
                {plan.cta.label}
                {plan.featured && <ArrowRight  className="rtl:rotate-180"/>}
              </a>
              <div className="mt-7 border-t pt-6">
                {plan.lead && <p className="mb-3 text-sm font-medium">{plan.lead}</p>}
                <ul className="space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="text-chart-2 mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {enterprise && (
        <div className="bg-muted/40 mt-8 flex flex-col items-start gap-4 rounded-3xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-semibold">{enterprise.title}</p>
            <p className="text-muted-foreground mt-1 text-sm">{enterprise.description}</p>
          </div>
          <a className={buttonVariants({ variant: "outline", shape: "pill" })} href={enterprise.cta.href}>
            {enterprise.cta.label} <ArrowRight  className="rtl:rotate-180"/>
          </a>
        </div>
      )}
      {note && <p className="text-muted-foreground mt-8 text-center text-sm">{note}</p>}
    </section>
  )
}

export { Pricing2, type Pricing2Props, type Pricing2Plan, type Pricing2Interval }
