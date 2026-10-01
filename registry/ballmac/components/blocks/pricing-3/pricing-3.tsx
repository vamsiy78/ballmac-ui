// Ballmac UI: Pricing 3. https://ui.ballmac.com/blocks/pricing-3
"use client"

import * as React from "react"
import { Check, ChevronDown, Minus } from "lucide-react"

import { Badge } from "@/components/ballmac/badge"
import { buttonVariants } from "@/components/ballmac/button"
import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { cn } from "@/lib/utils"

type Pricing3Plan = {
  /** Stable key used by the feature rows. */
  key: string
  /** Plan name. */
  name: string
  /** Price text, e.g. "$29". */
  price: string
  /** What the price covers, e.g. "per seat / month". */
  period?: string
  /** Button. */
  cta: { label: string; href: string }
  /** Emphasise this plan. */
  featured?: boolean
}

type Pricing3Row = {
  /** Feature name. */
  label: string
  /** Extra detail shown under the name. */
  hint?: string
  /** Value for each plan key: true (included), false (not included) or text such as "10 GB". */
  values: Record<string, boolean | string>
}

type Pricing3Group = {
  /** Group heading, e.g. "Collaboration". */
  title: string
  rows: Pricing3Row[]
}

type Pricing3Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Section heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** The columns to compare. */
  plans?: Pricing3Plan[]
  /** Feature groups, each a set of rows. */
  groups?: Pricing3Group[]
  /** Distance in pixels the sticky header keeps from the top of the page, e.g. the height of your site header. */
  stickyOffset?: number
}

const defaultPlans: Pricing3Plan[] = [
  { key: "starter", name: "Starter", price: "$12", period: "per month", cta: { label: "Start free", href: "#" } },
  { key: "pro", name: "Pro", price: "$32", period: "per seat / month", cta: { label: "Start trial", href: "#" }, featured: true },
  { key: "scale", name: "Scale", price: "$79", period: "per seat / month", cta: { label: "Talk to sales", href: "#" } },
]

const defaultGroups: Pricing3Group[] = [
  {
    title: "Core",
    rows: [
      { label: "Projects", values: { starter: "3", pro: "Unlimited", scale: "Unlimited" } },
      { label: "Storage", values: { starter: "10 GB", pro: "1 TB", scale: "10 TB" } },
      { label: "Version history", hint: "Restore any earlier version", values: { starter: "7 days", pro: "90 days", scale: "Unlimited" } },
      { label: "Custom domain", values: { starter: false, pro: true, scale: true } },
    ],
  },
  {
    title: "Collaboration",
    rows: [
      { label: "Guests", values: { starter: "5", pro: "50", scale: "Unlimited" } },
      { label: "Comments and mentions", values: { starter: true, pro: true, scale: true } },
      { label: "Team roles", values: { starter: false, pro: true, scale: true } },
      { label: "Shared workspaces", values: { starter: false, pro: true, scale: true } },
    ],
  },
  {
    title: "Security and support",
    rows: [
      { label: "Single sign-on (SAML)", values: { starter: false, pro: true, scale: true } },
      { label: "Audit log", values: { starter: false, pro: false, scale: true } },
      { label: "SCIM provisioning", values: { starter: false, pro: false, scale: true } },
      { label: "Support", values: { starter: "Community", pro: "Priority email", scale: "Dedicated manager" } },
      { label: "Uptime SLA", values: { starter: false, pro: false, scale: "99.99%" } },
    ],
  },
]

function Value({ value, label }: { value: boolean | string; label: string }) {
  if (typeof value === "string") return <span className="text-sm font-medium">{value}</span>
  return value ? (
    <Check className="text-chart-2 mx-auto size-4.5" aria-label={`${label}: included`} role="img" />
  ) : (
    <Minus className="text-muted-foreground mx-auto size-4" aria-label={`${label}: not included`} role="img" />
  )
}

function Pricing3({
  title = "Compare every plan.",
  description = "All the details, side by side.",
  plans = defaultPlans,
  groups = defaultGroups,
  stickyOffset = 0,
  className,
  ...props
}: Pricing3Props) {
  const [closed, setClosed] = React.useState<Set<string>>(() => new Set())
  const [mobilePlan, setMobilePlan] = React.useState(plans.find((p) => p.featured)?.key ?? plans[0]?.key ?? "")
  const selected = plans.find((p) => p.key === mobilePlan) ?? plans[0]
  const baseId = React.useId()

  function toggle(group: string) {
    setClosed((prev) => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  return (
    <section data-slot="pricing-3" className={cn("mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
      </div>

      {/* Phones: one plan at a time. */}
      {selected && (
        <div className="mt-10 md:hidden">
          <SegmentedControl aria-label="Plan to view" value={selected.key} onValueChange={setMobilePlan} fullWidth>
            {plans.map((p) => (
              <SegmentedControlItem key={p.key} value={p.key}>{p.name}</SegmentedControlItem>
            ))}
          </SegmentedControl>
          <div className="bg-card mt-5 rounded-2xl border p-5">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-[-0.04em]">{selected.price}</span>
              {selected.period && <span className="text-muted-foreground text-sm">{selected.period}</span>}
            </div>
            <a href={selected.cta.href} className={buttonVariants({ variant: selected.featured ? "default" : "outline", shape: "pill", className: "mt-4 w-full" })}>
              {selected.cta.label}
            </a>
          </div>
          {groups.map((g) => (
            <div key={g.title} className="mt-6">
              <h3 className="text-muted-foreground px-1 pb-2 text-xs font-semibold tracking-wide uppercase">{g.title}</h3>
              <ul className="bg-card divide-y rounded-2xl border">
                {g.rows.map((r) => (
                  <li key={r.label} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-sm">{r.label}</span>
                    <span className="shrink-0 text-right"><Value value={r.values[selected.key] ?? false} label={r.label} /></span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Tablets and up: the full table with a sticky header. */}
      <div className="mt-14 hidden md:block">
        <table className="w-full border-separate border-spacing-0 text-left">
          <caption className="sr-only">Plan comparison</caption>
          <thead>
            <tr>
              <th scope="col" className="bg-background/90 sticky z-10 w-[32%] border-b p-0 backdrop-blur-xl" style={{ top: stickyOffset }}>
                <span className="sr-only">Feature</span>
              </th>
              {plans.map((p) => (
                <th
                  key={p.key}
                  scope="col"
                  style={{ top: stickyOffset }}
                  className={cn("bg-background/90 sticky z-10 border-b px-4 pt-2 pb-5 align-bottom backdrop-blur-xl", p.featured && "bg-muted/60")}
                >
                  <span className="flex items-center gap-2 text-base font-semibold">
                    {p.name}
                    {p.featured && <Badge>Popular</Badge>}
                  </span>
                  <span className="mt-2 flex items-baseline gap-1.5 font-normal">
                    <span className="text-3xl font-semibold tracking-[-0.04em]">{p.price}</span>
                    {p.period && <span className="text-muted-foreground text-xs">{p.period}</span>}
                  </span>
                  <a href={p.cta.href} className={buttonVariants({ variant: p.featured ? "default" : "outline", size: "sm", shape: "pill", className: "mt-4 w-full" })}>
                    {p.cta.label}
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((g, gi) => {
            const open = !closed.has(g.title)
            const panelId = `${baseId}-g${gi}`
            return (
              <tbody key={g.title}>
                <tr>
                  <th scope="colgroup" colSpan={plans.length + 1} className="p-0 pt-8 text-left">
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => toggle(g.title)}
                      className="focus-visible:ring-ring/50 group/head flex w-full items-center justify-between rounded-lg px-1 py-2 text-sm font-semibold outline-none focus-visible:ring-[3px]"
                    >
                      {g.title}
                      <ChevronDown className={cn("text-muted-foreground size-4 transition-transform duration-200 motion-reduce:transition-none", !open && "-rotate-90")} aria-hidden="true" />
                    </button>
                  </th>
                </tr>
                {open &&
                  g.rows.map((r, ri) => (
                    <tr key={r.label} id={ri === 0 ? panelId : undefined} className="group/row">
                      <th scope="row" className="border-t px-1 py-3.5 text-left text-sm font-normal">
                        {r.label}
                        {r.hint && <span className="text-muted-foreground block text-xs">{r.hint}</span>}
                      </th>
                      {plans.map((p) => (
                        <td key={p.key} className={cn("border-t px-4 py-3.5 text-center", p.featured && "bg-muted/40")}>
                          <Value value={r.values[p.key] ?? false} label={r.label} />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            )
          })}
        </table>
      </div>
    </section>
  )
}

export { Pricing3, type Pricing3Props, type Pricing3Plan, type Pricing3Group, type Pricing3Row }
