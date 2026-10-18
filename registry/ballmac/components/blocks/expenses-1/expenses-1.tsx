// Ballmac UI: Expenses 1. https://ui.ballmac.com/blocks/expenses-1
"use client"

import * as React from "react"
import { CircleAlert, CircleCheck, Loader2, Paperclip, Plus, Receipt, Send, Trash2, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Input } from "@/components/ballmac/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ballmac/select"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Expenses1Category = { id: string; label: string; /** Most one expense in this category may be before it needs a look, in the report's currency. */ limit?: number }

type Expenses1Line = { id: string; date: string; merchant: string; category: string; amount: number; /** Name of the attached receipt file. */ receipt?: string; note?: string }

type Expenses1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    /** "October trip to Lisbon". */
    report?: string
    lines?: Expenses1Line[]
    categories?: Expenses1Category[]
    currency?: string
    locale?: string
    /** Amounts above this need a receipt. */
    receiptOver?: number
    /** Called when the report is submitted. Return a promise; reject to show the reason and keep the report open. */
    onSubmit?: (lines: Expenses1Line[], total: number) => void | Promise<void>
    onChange?: (lines: Expenses1Line[]) => void
  }

const cats: Expenses1Category[] = [
  { id: "travel", label: "Travel" },
  { id: "meals", label: "Meals", limit: 75 },
  { id: "lodging", label: "Lodging", limit: 220 },
  { id: "software", label: "Software" },
  { id: "other", label: "Other" },
]
const sample: Expenses1Line[] = [
  { id: "e1", date: "2026-10-12", merchant: "TAP Air Portugal", category: "travel", amount: 412.8, receipt: "tap-ticket.pdf" },
  { id: "e2", date: "2026-10-12", merchant: "Airport taxi", category: "travel", amount: 38, receipt: "taxi.jpg" },
  { id: "e3", date: "2026-10-13", merchant: "Hotel Avenida", category: "lodging", amount: 486, receipt: "hotel-3-nights.pdf", note: "Three nights, 162 each" },
  { id: "e4", date: "2026-10-13", merchant: "Time Out Market", category: "meals", amount: 92.4, receipt: "dinner.jpg", note: "Dinner with the client team of four" },
  { id: "e5", date: "2026-10-14", merchant: "Café A Brasileira", category: "meals", amount: 14.5 },
  { id: "e6", date: "2026-10-14", merchant: "Conference wifi pass", category: "software", amount: 49 },
  { id: "e7", date: "2026-10-15", merchant: "Metro day pass", category: "travel", amount: 9.6 },
]

const barTone = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-5">
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  )
}

/**
 * An expense report you can finish: lines with merchant, date, category, amount and receipt, a total broken down by category, and rules that
 * are checked as you go: an amount over the receipt threshold needs a receipt, and a category with a limit flags what goes over it. Add a line
 * with the form, attach a receipt to any line, and Submit lists exactly what still needs fixing before it will send.
 */
function Expenses1({
  title = "Expense report",
  report = "October trip to Lisbon",
  lines: linesProp = sample,
  categories = cats,
  currency = "EUR",
  locale = "en-GB",
  receiptOver = 25,
  onSubmit,
  onChange,
  state = "ready",
  onRetry,
  emptyState,
  errorState,
  className,
  ...props
}: Expenses1Props) {
  const id = React.useId()
  const [lines, setLines] = React.useState<Expenses1Line[]>(linesProp)
  React.useEffect(() => setLines(linesProp), [linesProp])
  const list = state === "empty" ? [] : lines
  const [form, setForm] = React.useState({ merchant: "", amount: "", date: "2026-10-16", category: categories[0]!.id })
  const [formError, setFormError] = React.useState<string>()
  const [submitted, setSubmitted] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [sendError, setSendError] = React.useState<string>()
  const [tried, setTried] = React.useState(false)
  const money = (n: number) => new Intl.NumberFormat(locale, { style: "currency", currency }).format(n)
  const dateFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }), [locale])
  const catOf = (cid: string) => categories.find((c) => c.id === cid)
  const total = list.reduce((s, l) => s + l.amount, 0)

  const issues = (l: Expenses1Line) => {
    const out: string[] = []
    if (l.amount > receiptOver && !l.receipt) out.push(`Needs a receipt: it is over ${money(receiptOver)}`)
    const c = catOf(l.category)
    if (c?.limit && l.amount > c.limit) out.push(`Over the ${money(c.limit)} limit for ${c.label}`)
    return out
  }
  const missing = list.filter((l) => l.amount > receiptOver && !l.receipt)
  const byCat = categories.map((c, i) => ({ c, sum: list.filter((l) => l.category === c.id).reduce((s, l) => s + l.amount, 0), tone: barTone[i % barTone.length]! })).filter((x) => x.sum > 0)

  const set = (next: Expenses1Line[]) => {
    setLines(next)
    onChange?.(next)
  }
  function add(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount.replace(",", "."))
    if (!form.merchant.trim()) return setFormError("Say who you paid.")
    if (!Number.isFinite(amount) || amount <= 0) return setFormError("Enter the amount as a number above zero.")
    setFormError(undefined)
    set([...list, { id: `e${list.length + 1}${form.merchant.length}${Math.round(amount * 100)}`, date: form.date, merchant: form.merchant.trim(), category: form.category, amount }])
    setForm({ ...form, merchant: "", amount: "" })
  }
  async function send() {
    setTried(true)
    if (missing.length) return
    setSendError(undefined)
    setSending(true)
    try {
      await onSubmit?.(list, total)
      setSubmitted(true)
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "The report could not be sent. Nothing was lost, so try again.")
    } finally {
      setSending(false)
    }
  }

  const content = !list.length && !submitted ? (
    <div className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <Receipt className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{emptyState?.title ?? "No expenses on this report"}</h2>
      <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm text-pretty">{emptyState?.description ?? "Add what you paid for, with a receipt, and the total is worked out for you."}</p>
      {emptyState?.action}
    </div>
  ) : submitted ? (
    <div role="status" className="bg-card rounded-2xl border px-6 py-16 text-center">
      <span aria-hidden="true" className="bg-chart-2/15 mx-auto flex size-14 items-center justify-center rounded-full">
        <CircleCheck className="size-7" />
      </span>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">Report sent for approval</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-pretty">
        {list.length} {list.length === 1 ? "expense" : "expenses"} totalling {money(total)} are with your manager. You will be told when it is approved.
      </p>
    </div>
  ) : (
    <div className="grid gap-6">
      <div className="bg-card rounded-2xl border p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">{report}</p>
            <p className="text-4xl font-semibold tracking-[-0.045em] tabular-nums">{money(total)}</p>
          </div>
          <p className="text-muted-foreground text-sm tabular-nums">
            {list.length} {list.length === 1 ? "expense" : "expenses"}
          </p>
        </div>
        <div role="img" aria-label={`Total by category: ${byCat.map((x) => `${x.c.label} ${money(x.sum)}`).join(", ")}`} className="bg-muted mt-5 flex h-3 overflow-hidden rounded-full">
          {byCat.map((x) => (
            <span key={x.c.id} className={cn("h-full first:rounded-s-full last:rounded-e-full", x.tone)} style={{ width: `${(x.sum / total) * 100}%` }} />
          ))}
        </div>
        <ul aria-hidden="true" className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          {byCat.map((x) => (
            <li key={x.c.id} className="flex items-center gap-2">
              <span className={cn("size-2.5 rounded-full", x.tone)} />
              {x.c.label} <span className="text-muted-foreground tabular-nums">{money(x.sum)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-card rounded-2xl border">
        <h2 className="border-b px-5 py-3.5 font-semibold tracking-tight">Expenses</h2>
        <ul className="divide-y">
          {list.map((l) => {
            const probs = issues(l)
            return (
              <li key={l.id} className="grid gap-x-4 gap-y-2 px-5 py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto]">
                <p className="text-muted-foreground text-sm tabular-nums">{dateFmt.format(Date.parse(`${l.date}T00:00:00Z`))}</p>
                <div className="min-w-0">
                  <p className="font-medium">{l.merchant}</p>
                  <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 text-sm">
                    <span className="bg-muted rounded-full px-2.5 py-0.5 text-xs font-medium">{catOf(l.category)?.label ?? l.category}</span>
                    {l.receipt ? (
                      <span className="flex items-center gap-1 text-xs">
                        <Paperclip aria-hidden="true" className="size-3" />
                        {l.receipt}
                      </span>
                    ) : (
                      <label className="focus-within:ring-ring/50 hover:bg-accent flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium focus-within:ring-[3px]">
                        <Paperclip aria-hidden="true" className="size-3" />
                        Attach receipt
                        <span className="sr-only"> for {l.merchant}</span>
                        <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) set(list.map((x) => (x.id === l.id ? { ...x, receipt: f.name } : x))) }} />
                      </label>
                    )}
                  </p>
                  {l.note ? <p className="text-muted-foreground mt-1 text-xs text-pretty">{l.note}</p> : null}
                  {probs.map((p) => (
                    <p key={p} className={cn("mt-1.5 flex items-start gap-1.5 text-sm", p.startsWith("Needs") && tried ? "text-destructive" : "")}>
                      {p.startsWith("Needs") ? <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />}
                      {p}
                    </p>
                  ))}
                </div>
                <div className="flex items-start justify-between gap-2 sm:justify-end">
                  <p className="font-semibold tabular-nums">{money(l.amount)}</p>
                  <Button variant="ghost" size="icon" aria-label={`Remove ${l.merchant}, ${money(l.amount)}`} onClick={() => set(list.filter((x) => x.id !== l.id))}>
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>

        <form onSubmit={add} noValidate className="bg-muted/30 grid gap-3 border-t p-4 sm:grid-cols-[minmax(0,1.4fr)_7rem_9rem_9rem_auto] sm:items-end sm:p-5">
          <div>
            <label htmlFor={`${id}-m`} className="text-muted-foreground mb-1.5 block text-xs font-medium">Paid to</label>
            <Input id={`${id}-m`} value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} placeholder="Merchant" />
          </div>
          <div>
            <label htmlFor={`${id}-a`} className="text-muted-foreground mb-1.5 block text-xs font-medium">Amount</label>
            <Input id={`${id}-a`} inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="text-end tabular-nums" />
          </div>
          <div>
            <label htmlFor={`${id}-d`} className="text-muted-foreground mb-1.5 block text-xs font-medium">Date</label>
            <Input id={`${id}-d`} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <p id={`${id}-c`} className="text-muted-foreground mb-1.5 text-xs font-medium">Category</p>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger aria-labelledby={`${id}-c`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" variant="outline">
            <Plus aria-hidden="true" />
            Add
          </Button>
          {formError ? (
            <p role="alert" className="text-destructive text-sm sm:col-span-5">
              {formError}
            </p>
          ) : null}
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div aria-live="polite" className="min-w-0 text-sm">
          {tried && missing.length ? (
            <p role="alert" className="text-destructive flex items-start gap-2 text-pretty">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {missing.length} {missing.length === 1 ? "expense needs" : "expenses need"} a receipt before you can send: {missing.map((m) => m.merchant).join(", ")}.
            </p>
          ) : (
            <p className="text-muted-foreground">Receipts are needed for anything over {money(receiptOver)}.</p>
          )}
          {sendError ? <p role="alert" className="text-destructive mt-1">{sendError}</p> : null}
        </div>
        <Button size="lg" onClick={() => void send()} disabled={sending || !list.length}>
          {sending ? <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Send aria-hidden="true" className="rtl:-scale-x-100" />}
          {sending ? "Sending" : `Submit ${money(total)}`}
        </Button>
      </div>
    </div>
  )

  return (
    <section data-slot="expenses-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <h1 id={`${id}-title`} className="mb-6 text-3xl font-semibold tracking-[-0.035em] text-balance">
        {title}
      </h1>
      <StateView state={state === "loading" || state === "error" ? state : "ready"} onRetry={onRetry} label="Loading the report" loading={<Skel />} error={{ title: errorState?.title ?? "The report could not be loaded", description: errorState?.description ?? "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {content}
      </StateView>
    </section>
  )
}

export { Expenses1, type Expenses1Props, type Expenses1Line, type Expenses1Category }
