// Ballmac UI: Billing 1. https://ui.ballmac.com/blocks/billing-1
"use client"

import * as React from "react"
import { AlertTriangle, CreditCard, Download } from "lucide-react"

import { Badge } from "@/components/ballmac/badge"
import { Button, buttonVariants } from "@/components/ballmac/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ballmac/dialog"
import { Field, FieldError, FieldGroup, FieldLabel, useFieldControl } from "@/components/ballmac/field"
import { Input } from "@/components/ballmac/input"
import { cn } from "@/lib/utils"

type Billing1Usage = {
  label: string
  used: number
  /** The plan limit. Leave out for unlimited. */
  limit?: number
  /** Unit shown after the numbers, e.g. "GB". */
  unit?: string
}

type Billing1Invoice = {
  id: string
  /** ISO date (YYYY-MM-DD), shown in UTC. */
  date: string
  amount: number
  status: "paid" | "open" | "failed"
  href?: string
}

type Billing1Props = Omit<React.ComponentProps<"section">, "title"> & {
  /** Page heading. */
  title?: string
  /** One line under the heading. */
  description?: string
  /** The current plan. */
  plan?: { name: string; price: number; per: string; seats: number; seatLimit: number; renews: string }
  /** Usage against plan limits. A meter turns amber from 80%. */
  usage?: Billing1Usage[]
  /** The card on file. */
  card?: { brand: string; last4: string; expires: string; holder: string }
  /** Billing contact. */
  contact?: { email: string; address: string }
  /** Past invoices, newest first. */
  invoices?: Billing1Invoice[]
  /** ISO currency code. */
  currency?: string
  /** Locale for numbers and dates. Fixed by default so server and browser match. */
  locale?: string
  /** Called by "Change plan". */
  onChangePlan?: () => void
  /** Called with the new card details. Throw to show an error. Never send these anywhere except your payment provider. */
  onUpdateCard?: (card: { number: string; expiry: string; cvc: string }) => void | Promise<void>
}

const defaultUsage: Billing1Usage[] = [
  { label: "Seats", used: 7, limit: 10 },
  { label: "Storage", used: 640, limit: 1000, unit: "GB" },
  { label: "API requests this month", used: 82400, limit: 100000 },
  { label: "Projects", used: 18 },
]

const defaultInvoices: Billing1Invoice[] = [
  { id: "INV-1042", date: "2026-09-28", amount: 224, status: "paid" },
  { id: "INV-1031", date: "2026-08-28", amount: 224, status: "paid" },
  { id: "INV-1019", date: "2026-07-28", amount: 192, status: "paid" },
  { id: "INV-1007", date: "2026-06-28", amount: 192, status: "paid" },
  { id: "INV-0995", date: "2026-05-28", amount: 160, status: "failed" },
]

const tone = { paid: "success", open: "warning", failed: "error" } as const
const label = { paid: "Paid", open: "Open", failed: "Failed" }

function FieldInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...useFieldControl()} {...props} />
}

function Billing1({
  title = "Billing",
  description = "Your plan, usage, payment method and invoices.",
  plan = { name: "Pro", price: 32, per: "seat / month", seats: 7, seatLimit: 10, renews: "2026-10-28" },
  usage = defaultUsage,
  card = { brand: "Visa", last4: "4242", expires: "08/28", holder: "Jordan Lee" },
  contact = { email: "billing@acme.com", address: "Rua das Flores 12, 1200-195 Lisbon, Portugal" },
  invoices = defaultInvoices,
  currency = "USD",
  locale = "en-US",
  onChangePlan,
  onUpdateCard,
  className,
  ...props
}: Billing1Props) {
  const money = React.useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }), [locale, currency])
  const int = React.useMemo(() => new Intl.NumberFormat(locale), [locale])
  const date = React.useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }), [locale])
  const fmt = (iso: string) => date.format(new Date(`${iso}T00:00:00Z`))

  const [open, setOpen] = React.useState(false)
  const [num, setNum] = React.useState("")
  const [exp, setExp] = React.useState("")
  const [cvc, setCvc] = React.useState("")
  const [tried, setTried] = React.useState(false)
  const [state, setState] = React.useState<"idle" | "saving" | "error">("idle")
  const [cardNow, setCardNow] = React.useState(card)
  const [saved, setSaved] = React.useState(false)

  const digits = num.replace(/\s/g, "")
  const errors = {
    num: digits.length >= 13 ? undefined : "Enter the full card number.",
    exp: /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp) ? undefined : "Use MM/YY.",
    cvc: cvc.length >= 3 ? undefined : "Enter the 3 or 4 digit code.",
  }
  const show = (k: keyof typeof errors) => (tried ? errors[k] : undefined)

  async function saveCard(e: React.FormEvent) {
    e.preventDefault()
    setTried(true)
    if (Object.values(errors).some(Boolean)) return
    setState("saving")
    try {
      if (onUpdateCard) await onUpdateCard({ number: digits, expiry: exp, cvc })
      else await new Promise((r) => setTimeout(r, 800))
      setCardNow({ ...cardNow, last4: digits.slice(-4), expires: exp })
      setOpen(false)
      setSaved(true)
      setNum("")
      setExp("")
      setCvc("")
      setTried(false)
      setState("idle")
    } catch {
      setState("error")
    }
  }

  const monthly = plan.price * plan.seats

  return (
    <section data-slot="billing-1" className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-6", className)} {...props}>
      <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      <p role="status" className="sr-only">{saved ? "Payment method updated." : ""}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="bg-card rounded-2xl border p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Current plan</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-[-0.03em]">{plan.name} <Badge status="success">Active</Badge></p>
              <p className="text-muted-foreground mt-1 text-sm">{money.format(plan.price)} per {plan.per} · {plan.seats} seats · renews {fmt(plan.renews)}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold tracking-[-0.04em] tabular-nums">{money.format(monthly)}</p>
              <p className="text-muted-foreground text-sm">per month</p>
            </div>
          </div>

          <ul className="mt-6 space-y-5 border-t pt-6">
            {usage.map((u) => {
              const pct = u.limit ? Math.min(100, (u.used / u.limit) * 100) : 0
              const warn = u.limit ? pct >= 80 : false
              return (
                <li key={u.label}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium">{u.label}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {int.format(u.used)}{u.unit ? ` ${u.unit}` : ""}{u.limit ? ` of ${int.format(u.limit)}${u.unit ? ` ${u.unit}` : ""}` : " · unlimited"}
                    </span>
                  </div>
                  {u.limit ? (
                    <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full" role="img" aria-label={`${u.label}: ${Math.round(pct)} percent of the limit used`}>
                      <div className={cn("h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", warn ? "bg-chart-3" : "bg-chart-1")} style={{ width: `${pct}%` }} />
                    </div>
                  ) : null}
                  {warn && <p className="mt-1.5 flex items-center gap-1.5 text-xs"><AlertTriangle className="text-chart-3 size-3.5" aria-hidden="true" />Approaching your limit. Upgrade to avoid interruptions.</p>}
                </li>
              )
            })}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2 border-t pt-6">
            <Button shape="pill" onClick={onChangePlan}>Change plan</Button>
            <Button variant="ghost">Cancel subscription</Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-2xl border p-5">
            <p className="text-sm font-medium">Payment method</p>
            <div className="mt-4 flex items-center gap-3">
              <span aria-hidden="true" className="bg-muted flex h-9 w-12 items-center justify-center rounded-md border"><CreditCard className="size-5" /></span>
              <div className="text-sm leading-tight">
                <p className="font-medium">{cardNow.brand} •••• {cardNow.last4}</p>
                <p className="text-muted-foreground text-xs">Expires {cardNow.expires} · {cardNow.holder}</p>
              </div>
            </div>
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setTried(false); setState("idle") } }}>
              <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4 w-full" })}>Update card</DialogTrigger>
              <DialogContent>
                <form noValidate onSubmit={saveCard}>
                  <DialogHeader>
                    <DialogTitle>Update payment method</DialogTitle>
                    <DialogDescription>Your next invoice will be charged to this card.</DialogDescription>
                  </DialogHeader>
                  <FieldGroup className="my-5">
                    {state === "error" && <p role="alert" className="border-destructive/40 text-destructive rounded-lg border px-3 py-2.5 text-sm">We couldn’t verify that card. Check the details and try again.</p>}
                    <Field invalid={!!show("num")}>
                      <FieldLabel>Card number</FieldLabel>
                      <FieldInput inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim())} />
                      <FieldError errors={[show("num")]} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field invalid={!!show("exp")}>
                        <FieldLabel>Expiry</FieldLabel>
                        <FieldInput inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={exp} onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); setExp(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d) }} />
                        <FieldError errors={[show("exp")]} />
                      </Field>
                      <Field invalid={!!show("cvc")}>
                        <FieldLabel>Security code</FieldLabel>
                        <FieldInput inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} />
                        <FieldError errors={[show("cvc")]} />
                      </Field>
                    </div>
                  </FieldGroup>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" loading={state === "saving"}>Save card</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card rounded-2xl border p-5">
            <p className="text-sm font-medium">Billing contact</p>
            <p className="mt-3 text-sm break-all">{contact.email}</p>
            <p className="text-muted-foreground mt-1 text-sm">{contact.address}</p>
            <Button variant="outline" size="sm" className="mt-4 w-full">Edit details</Button>
          </div>
        </div>
      </div>

      <div className="bg-card mt-4 overflow-hidden rounded-2xl border">
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-sm font-medium">Invoices</p>
          <a href="#invoices" className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-sm text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-[3px]">View all</a>
        </div>
        <ul className="divide-y border-t">
          {invoices.map((inv) => (
            <li key={inv.id} className="flex items-center gap-3 px-5 py-3.5 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs">{inv.id}</p>
                <p className="text-muted-foreground text-xs">{fmt(inv.date)}</p>
              </div>
              <Badge status={tone[inv.status]}>{label[inv.status]}</Badge>
              <span className="w-20 text-right font-medium tabular-nums">{money.format(inv.amount)}</span>
              <a href={inv.href ?? "#"} aria-label={`Download invoice ${inv.id}`} className="hover:bg-accent focus-visible:ring-ring/50 flex size-9 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px]"><Download className="size-4" aria-hidden="true" /></a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export { Billing1, type Billing1Props, type Billing1Usage, type Billing1Invoice }
