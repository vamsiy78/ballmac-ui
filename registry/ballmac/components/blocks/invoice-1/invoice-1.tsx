// Ballmac UI: Invoice 1. https://ui.ballmac.com/blocks/invoice-1
"use client"

import * as React from "react"
import { CircleAlert, CircleCheck, Clock, CreditCard, Download, Loader2, Printer } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Invoice1Line = { id: string; description: string; detail?: string; quantity: number; unitPrice: number }
type Invoice1Party = { name: string; lines: string[] }

type Invoice1Data = {
  number: string
  /** ISO dates. */
  issued: string
  due: string
  /** Set when it has been paid. */
  paidOn?: string
  from: Invoice1Party
  to: Invoice1Party
  lines: Invoice1Line[]
  /** Percent off the subtotal, 0 to 100. */
  discountPercent?: number
  /** Tax rate in percent. */
  taxPercent?: number
  note?: string
  /** How to pay by transfer, shown when unpaid. */
  paymentDetails?: { label: string; value: string }[]
}

type Invoice1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    invoice?: Invoice1Data
    /** An ISO date for "today", used to say whether it is overdue. The block never reads the clock. */
    today?: string
    currency?: string
    locale?: string
    /** Called by Pay now. Return a promise; reject to show its message. Leave out to hide the button. */
    onPay?: () => void | Promise<void>
    /** Called by Download. Leave out to hide the button. */
    onDownload?: () => void
  }

const sample: Invoice1Data = {
  number: "INV-2041",
  issued: "2026-10-01",
  due: "2026-10-15",
  from: { name: "Acme Studio Ltd", lines: ["Rua da Prata 120", "1100-420 Lisboa, Portugal", "VAT PT 509 123 456"] },
  to: { name: "Northwind Logistics", lines: ["Attn: Elena Marsh", "88 Orchard St", "New York, NY 10002"] },
  lines: [
    { id: "1", description: "Product design sprint", detail: "Two weeks, three designers", quantity: 1, unitPrice: 9600 },
    { id: "2", description: "Design system audit", detail: "Components, tokens and accessibility", quantity: 1, unitPrice: 3200 },
    { id: "3", description: "Workshop days", detail: "On site, including travel", quantity: 2, unitPrice: 1450 },
    { id: "4", description: "Prototype hosting", detail: "Per month", quantity: 3, unitPrice: 40 },
  ],
  discountPercent: 5,
  taxPercent: 0,
  note: "Thank you for working with us. Payment is due within 14 days. A late fee of 1.5% a month applies after that.",
  paymentDetails: [
    { label: "Bank", value: "Banco Atlântico" },
    { label: "IBAN", value: "PT50 0002 0123 1234 5678 9015 4" },
    { label: "Reference", value: "INV-2041" },
  ],
}

const DAY = 86_400_000
const toT = (iso: string) => Date.parse(`${iso}T00:00:00Z`)

function Skel() {
  return (
    <div aria-hidden="true" className="bg-card rounded-3xl border p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-8 h-24" />
      <Skeleton className="mt-8 h-56" />
    </div>
  )
}

/**
 * An invoice you can read, print and pay: who it is from and to, the dates, each line with its quantity and amount, then the subtotal,
 * discount, tax and total, all worked out from the lines. Its status (paid, due in N days, overdue by N days) comes from the dates and the day
 * you pass, never the clock. Pay now handles the wait and a failure, and the print view hides the buttons.
 */
function Invoice1({ invoice = sample, today = "2026-10-18", currency = "USD", locale = "en", onPay, onDownload, state = "ready", onRetry, errorState, className, ...props }: Invoice1Props) {
  const id = React.useId()
  const [paidNow, setPaidNow] = React.useState(false)
  const [paying, setPaying] = React.useState(false)
  const [payError, setPayError] = React.useState<string>()
  const money = (n: number) => new Intl.NumberFormat(locale, { style: "currency", currency }).format(n)
  const date = React.useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }), [locale])

  const subtotal = invoice.lines.reduce((n, l) => n + l.quantity * l.unitPrice, 0)
  const discount = (subtotal * (invoice.discountPercent ?? 0)) / 100
  const taxable = subtotal - discount
  const tax = (taxable * (invoice.taxPercent ?? 0)) / 100
  const total = taxable + tax

  const paid = !!invoice.paidOn || paidNow
  const daysLate = Math.floor((toT(today) - toT(invoice.due)) / DAY)
  const status = paid
    ? { tone: "paid" as const, label: "Paid", note: invoice.paidOn ? `on ${date.format(toT(invoice.paidOn))}` : "just now", icon: CircleCheck }
    : daysLate > 0
      ? { tone: "late" as const, label: "Overdue", note: `by ${daysLate} ${daysLate === 1 ? "day" : "days"}`, icon: CircleAlert }
      : { tone: "due" as const, label: "Due", note: daysLate === 0 ? "today" : `in ${-daysLate} ${-daysLate === 1 ? "day" : "days"}`, icon: Clock }
  const tone = { paid: "bg-chart-2/10 border-chart-2/30", late: "bg-destructive/10 border-destructive/30", due: "bg-amber-500/10 border-amber-500/40" }[status.tone]

  async function pay() {
    setPayError(undefined)
    setPaying(true)
    try {
      await onPay?.()
      setPaidNow(true)
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "The payment did not go through. You have not been charged.")
    } finally {
      setPaying(false)
    }
  }

  const content = (
    <article aria-labelledby={`${id}-title`} className="bg-card overflow-hidden rounded-3xl border shadow-sm print:border-0 print:shadow-none">
      <div className={cn("flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4 sm:px-10", tone)}>
        <p role="status" className="flex items-center gap-2.5 text-sm font-semibold">
          <status.icon aria-hidden="true" className="size-5" />
          {status.label} <span className="font-normal">{status.note}</span>
        </p>
        <div className="flex flex-wrap gap-2 print:hidden">
          {onDownload ? (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download aria-hidden="true" />
              Download
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer aria-hidden="true" />
            Print
          </Button>
        </div>
      </div>

      <div className="p-6 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <span aria-hidden="true" className="bg-foreground text-background flex size-11 items-center justify-center rounded-xl text-lg font-semibold">
              {invoice.from.name[0]}
            </span>
            <h2 id={`${id}-title`} className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
              Invoice <span className="tabular-nums">{invoice.number}</span>
            </h2>
          </div>
          <div className="text-end">
            <p className="text-muted-foreground text-sm">Amount {paid ? "paid" : "due"}</p>
            <p className="text-4xl font-semibold tracking-[-0.045em] tabular-nums sm:text-5xl">{money(total)}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          <dl>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">From</dt>
              <dd className="mt-2 text-sm leading-relaxed">
                <span className="block font-semibold">{invoice.from.name}</span>
                {invoice.from.lines.map((l) => (
                  <span key={l} className="text-muted-foreground block">
                    {l}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <dl>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Billed to</dt>
              <dd className="mt-2 text-sm leading-relaxed">
                <span className="block font-semibold">{invoice.to.name}</span>
                {invoice.to.lines.map((l) => (
                  <span key={l} className="text-muted-foreground block">
                    {l}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <dl className="grid content-start gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Issued</dt>
              <dd className="mt-1 font-medium">{date.format(toT(invoice.issued))}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{paid ? "Was due" : "Due"}</dt>
              <dd className="mt-1 font-medium">{date.format(toT(invoice.due))}</dd>
            </div>
          </dl>
        </div>

        <div role="region" tabIndex={0} aria-label="Invoice items" className="focus-visible:ring-ring/50 mt-10 overflow-x-auto outline-none focus-visible:ring-[3px]">
          <table className="w-full min-w-[34rem] text-sm">
            <caption className="sr-only">Items on invoice {invoice.number}</caption>
            <thead>
              <tr className="text-muted-foreground border-b text-xs font-medium tracking-wide uppercase">
                <th scope="col" className="py-3 pe-4 text-start font-medium">Description</th>
                <th scope="col" className="px-4 py-3 text-end font-medium">Qty</th>
                <th scope="col" className="px-4 py-3 text-end font-medium">Unit price</th>
                <th scope="col" className="py-3 ps-4 text-end font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoice.lines.map((l) => (
                <tr key={l.id}>
                  <td className="py-4 pe-4">
                    <p className="font-medium">{l.description}</p>
                    {l.detail ? <p className="text-muted-foreground mt-0.5 text-xs">{l.detail}</p> : null}
                  </td>
                  <td className="px-4 py-4 text-end tabular-nums">{l.quantity}</td>
                  <td className="px-4 py-4 text-end tabular-nums">{money(l.unitPrice)}</td>
                  <td className="py-4 ps-4 text-end font-medium tabular-nums">{money(l.quantity * l.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-6 ms-auto grid max-w-xs gap-2.5 text-sm">
          <div className="flex justify-between gap-6">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{money(subtotal)}</dd>
          </div>
          {discount ? (
            <div className="flex justify-between gap-6">
              <dt className="text-muted-foreground">Discount ({invoice.discountPercent}%)</dt>
              <dd className="tabular-nums">−{money(discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-6">
            <dt className="text-muted-foreground">Tax{invoice.taxPercent ? ` (${invoice.taxPercent}%)` : ""}</dt>
            <dd className="tabular-nums">{money(tax)}</dd>
          </div>
          <div className="flex justify-between gap-6 border-t pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{money(total)}</dd>
          </div>
        </dl>

        {!paid && invoice.paymentDetails?.length ? (
          <div className="bg-muted/50 mt-10 rounded-2xl border p-5">
            <h3 className="text-sm font-semibold">Pay by bank transfer</h3>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[6rem_minmax(0,1fr)]">
              {invoice.paymentDetails.map((d) => (
                <React.Fragment key={d.label}>
                  <dt className="text-muted-foreground">{d.label}</dt>
                  <dd className="font-medium tabular-nums" dir="ltr">
                    {d.value}
                  </dd>
                </React.Fragment>
              ))}
            </dl>
          </div>
        ) : null}

        {invoice.note ? <p className="text-muted-foreground mt-8 max-w-xl text-sm text-pretty">{invoice.note}</p> : null}

        {!paid && onPay ? (
          <div className="mt-8 border-t pt-6 print:hidden">
            <Button size="lg" onClick={pay} disabled={paying} aria-busy={paying}>
              {paying ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <CreditCard aria-hidden="true" />}
              {paying ? "Paying" : `Pay ${money(total)} now`}
            </Button>
            {payError ? (
              <p role="alert" className="text-destructive mt-3 flex items-start gap-2 text-sm">
                <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {payError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )

  return (
    <section data-slot="invoice-1" data-state={state} aria-label={`Invoice ${invoice.number}`} className={cn("mx-auto w-full max-w-3xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the invoice" loading={<Skel />} error={{ title: errorState?.title ?? "The invoice could not be loaded", description: errorState?.description ?? "Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Invoice1, type Invoice1Props, type Invoice1Data, type Invoice1Line }
