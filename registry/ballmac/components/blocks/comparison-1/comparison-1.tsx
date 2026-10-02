// Ballmac UI: Comparison 1. https://ui.ballmac.com/blocks/comparison-1
"use client"

import * as React from "react"
import { Check, Minus, X } from "lucide-react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ballmac/segmented-control"
import { cn } from "@/lib/utils"

type Comparison1Value = boolean | "partial" | string

type Comparison1Competitor = {
  /** Key used by the rows. */
  key: string
  /** Name shown in the header. */
  name: string
}

type Comparison1Row = {
  /** The capability being compared. */
  label: string
  /** One short line of detail. */
  hint?: string
  /** Value per column: your product uses the key "us". true is a check, false a cross, "partial" a dash, any other text is shown as text. */
  values: Record<string, Comparison1Value>
}

type Comparison1Reason = { value: string; label: string }

type Comparison1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Section heading. */
  title?: string
  /** One sentence under the heading. */
  description?: string
  /** Your product's name. */
  product?: string
  /** The alternatives. */
  competitors?: Comparison1Competitor[]
  /** What is compared. */
  rows?: Comparison1Row[]
  /** Headline reasons shown under the table. Pass an empty array to hide them. */
  reasons?: Comparison1Reason[]
}

const defaultCompetitors: Comparison1Competitor[] = [
  { key: "sheets", name: "Spreadsheets" },
  { key: "legacy", name: "Legacy suite" },
]

const defaultRows: Comparison1Row[] = [
  { label: "Set up in under an hour", hint: "From sign-up to first invoice sent", values: { us: true, sheets: true, legacy: false } },
  { label: "Real-time collaboration", values: { us: true, sheets: "partial", legacy: false } },
  { label: "Automatic approvals", hint: "Rules, reminders and escalation", values: { us: true, sheets: false, legacy: true } },
  { label: "Audit trail on every change", values: { us: true, sheets: false, legacy: "partial" } },
  { label: "Bank and card sync", values: { us: true, sheets: false, legacy: true } },
  { label: "Works on your phone", values: { us: true, sheets: "partial", legacy: false } },
  { label: "Price for 10 people", values: { us: "$250 / mo", sheets: "Free", legacy: "$900 / mo" } },
]

const defaultReasons: Comparison1Reason[] = [
  { value: "5x", label: "faster month-end close" },
  { value: "−62%", label: "time spent on approvals" },
  { value: "1 hr", label: "median time to first invoice" },
]

function Cell({ value, label, product }: { value: Comparison1Value; label: string; product?: boolean }) {
  if (typeof value === "string" && value !== "partial") return <span className={cn("text-sm", product && "font-semibold")}>{value}</span>
  if (value === true)
    return (
      <span className={cn("inline-flex size-6 items-center justify-center rounded-full", product ? "bg-foreground text-background" : "bg-chart-2/15")}>
        <Check className="size-3.5" aria-hidden="true" />
        <span className="sr-only">{label}: yes</span>
      </span>
    )
  if (value === "partial")
    return (
      <span className="bg-chart-3/20 inline-flex size-6 items-center justify-center rounded-full">
        <Minus className="size-3.5" aria-hidden="true" />
        <span className="sr-only">{label}: partly</span>
      </span>
    )
  return (
    <span className="text-muted-foreground inline-flex size-6 items-center justify-center">
      <X className="size-4" aria-hidden="true" />
      <span className="sr-only">{label}: no</span>
    </span>
  )
}

function Comparison1({
  title = "See how we stack up.",
  description = "An honest look at where Acme fits next to the tools you might be using today.",
  product = "Acme",
  competitors = defaultCompetitors,
  rows = defaultRows,
  reasons = defaultReasons,
  className,
  ...props
}: Comparison1Props) {
  const [pick, setPick] = React.useState(competitors[0]?.key ?? "")
  const chosen = competitors.find((c) => c.key === pick) ?? competitors[0]

  return (
    <section data-slot="comparison-1" className={cn("mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28", className)} {...props}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="text-muted-foreground mt-4 text-lg text-pretty">{description}</p>
      </div>

      {/* Phones: us against one alternative at a time. */}
      {chosen && (
        <div className="mt-10 md:hidden">
          <SegmentedControl aria-label="Compare with" value={chosen.key} onValueChange={setPick} fullWidth>
            {competitors.map((c) => (
              <SegmentedControlItem key={c.key} value={c.key}>{c.name}</SegmentedControlItem>
            ))}
          </SegmentedControl>
          <div className="bg-card mt-5 overflow-hidden rounded-3xl border">
            <div className="bg-muted/50 grid grid-cols-[1fr_5.5rem_5.5rem] items-center gap-2 border-b px-4 py-3 text-xs font-semibold">
              <span className="sr-only">Capability</span>
              <span className="col-start-2 text-center">{product}</span>
              <span className="text-muted-foreground text-center">{chosen.name}</span>
            </div>
            <ul className="divide-y">
              {rows.map((r) => (
                <li key={r.label} className="grid grid-cols-[1fr_5.5rem_5.5rem] items-center gap-2 px-4 py-3.5">
                  <span className="text-sm">{r.label}</span>
                  <span className="text-center"><Cell value={r.values.us ?? false} label={`${product}, ${r.label}`} product /></span>
                  <span className="text-center"><Cell value={r.values[chosen.key] ?? false} label={`${chosen.name}, ${r.label}`} /></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tablets and up: the product column is lifted into its own card. */}
      <div className="mt-16 hidden md:block">
        <table className="w-full border-separate border-spacing-0 text-start">
          <caption className="sr-only">{product} compared with {competitors.map((c) => c.name).join(" and ")}</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[38%] pb-5"><span className="sr-only">Capability</span></th>
              <th scope="col" className="bg-card relative w-[20%] rounded-t-3xl border-x border-t px-4 pt-7 pb-5 text-center shadow-[0_-30px_80px_-50px_rgb(0_0_0/0.35)]">
                <span aria-hidden="true" className="bg-chart-1/60 absolute inset-x-8 top-0 h-px" />
                <span className="text-lg font-semibold tracking-tight">{product}</span>
              </th>
              {competitors.map((c) => (
                <th key={c.key} scope="col" className="text-muted-foreground px-4 pb-5 text-center text-sm font-medium">{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const last = i === rows.length - 1
              return (
                <tr key={r.label}>
                  <th scope="row" className="border-t py-4 pe-4 text-start font-normal">
                    <span className="block text-[15px] font-medium">{r.label}</span>
                    {r.hint && <span className="text-muted-foreground block text-sm">{r.hint}</span>}
                  </th>
                  <td className={cn("bg-card border-x border-t px-4 py-4 text-center", last && "rounded-b-3xl border-b shadow-[0_40px_80px_-50px_rgb(0_0_0/0.35)]")}>
                    <Cell value={r.values.us ?? false} label={`${product}, ${r.label}`} product />
                  </td>
                  {competitors.map((c) => (
                    <td key={c.key} className="border-t px-4 py-4 text-center"><Cell value={r.values[c.key] ?? false} label={`${c.name}, ${r.label}`} /></td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {reasons.length > 0 && (
        <dl className="mt-16 grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-3">
          {reasons.map((r) => (
            <div key={r.label} className="bg-card flex flex-col-reverse p-6 text-center sm:p-8">
              <dt className="text-muted-foreground mt-2 text-sm">{r.label}</dt>
              <dd className="text-4xl font-semibold tracking-[-0.04em] tabular-nums">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}

export { Comparison1, type Comparison1Props, type Comparison1Row, type Comparison1Competitor, type Comparison1Reason, type Comparison1Value }
