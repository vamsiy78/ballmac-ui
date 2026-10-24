// Ballmac UI: Work order 1. https://ui.ballmac.com/blocks/workorder-1
"use client"

import * as React from "react"
import { Check, ChevronRight, Loader2, MessageSquare, Plus } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Workorder1Status = "received" | "diagnosing" | "waiting-parts" | "repairing" | "ready"

type Workorder1Line = {
  id: string
  kind: "part" | "labour"
  description: string
  qty: number
  /** Price of one, as a number. For labour, one hour. */
  unit: number
}

type Workorder1Data = {
  /** For example "WO-1042". */
  id: string
  customer: string
  /** What is being repaired, for example "Oven, Bosch HBG". */
  item: string
  /** What the customer says is wrong. */
  issue: string
  status: Workorder1Status
  lines: Workorder1Line[]
  /** What happened and when, newest first. */
  history: { id: string; time: string; text: string }[]
}

type Workorder1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    order?: Workorder1Data | null
    /** ISO currency code. */
    currency?: string
    /** Tax as a share of the subtotal, for example 0.2 for twenty percent. */
    taxRate?: number
    /** Messages that can be sent to the customer in one click. */
    messages?: { id: string; label: string; text: string }[]
    /** Called when the order moves to the next step. */
    onAdvance?: (next: Workorder1Status) => void | Promise<void>
    /** Called when a part or labour line is added. */
    onAddLine?: (line: Omit<Workorder1Line, "id">) => void | Promise<void>
    /** Called when a message is sent. */
    onMessage?: (message: { id: string; text: string }) => void | Promise<void>
  }

const STEPS: { id: Workorder1Status; label: string }[] = [
  { id: "received", label: "Received" },
  { id: "diagnosing", label: "Diagnosing" },
  { id: "waiting-parts", label: "Waiting for parts" },
  { id: "repairing", label: "Repairing" },
  { id: "ready", label: "Ready to collect" },
]

const sample: Workorder1Data = {
  id: "WO-1042",
  customer: "Ines Carvalho",
  item: "Oven, Bosch HBG",
  issue: "Does not heat up. The fan runs and the light works.",
  status: "diagnosing",
  lines: [
    { id: "l1", kind: "labour", description: "Diagnosis", qty: 0.5, unit: 60 },
    { id: "l2", kind: "part", description: "Heating element, 2,300 W", qty: 1, unit: 48.5 },
  ],
  history: [
    { id: "h3", time: "Today 10:12", text: "Heating element tested: open circuit. Part needed." },
    { id: "h2", time: "Today 09:40", text: "Started diagnosis." },
    { id: "h1", time: "Yesterday 16:05", text: "Received at the counter. Customer left a phone number." },
  ],
}
const messages = [
  { id: "m1", label: "Need a part", text: "We found the fault. A part is needed and we have ordered it." },
  { id: "m2", label: "Ready to collect", text: "Your repair is finished. You can collect it any day from 9 to 5." },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-56 rounded-xl" />
    </div>
  )
}

/**
 * A repair work order from the counter to collection: who and what, the five steps it moves through with one button to advance, the parts and labour with a
 * running total, a few messages the customer can be sent in one click, and what has happened so far.
 */
function Workorder1({ order: orderProp = sample, currency = "USD", taxRate = 0.2, messages: msgs = messages, onAdvance, onAddLine, onMessage, state = "ready", onRetry, emptyState, errorState, className, ...props }: Workorder1Props) {
  const id = React.useId()
  const [order, setOrder] = React.useState<Workorder1Data | null>(orderProp)
  React.useEffect(() => setOrder(orderProp), [orderProp])
  const [busy, setBusy] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<{ ok: boolean; text: string } | null>(null)
  const [draft, setDraft] = React.useState({ kind: "part" as "part" | "labour", description: "", qty: "1", unit: "" })
  const view = state === "ready" && !order ? "empty" : state
  const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n)
  const idx = order ? STEPS.findIndex((s) => s.id === order.status) : 0
  const subtotal = order?.lines.reduce((t, l) => t + l.qty * l.unit, 0) ?? 0
  const tax = subtotal * taxRate

  async function run(key: string, work: () => void | Promise<void>, done: () => void, ok: string) {
    setBusy(key)
    setNote(null)
    try {
      await work()
      done()
      setNote({ ok: true, text: ok })
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error ? e.message : "That did not go through, so nothing changed." })
    } finally {
      setBusy(null)
    }
  }
  function advance() {
    if (!order || idx >= STEPS.length - 1) return
    const next = STEPS[idx + 1]
    void run("advance", () => onAdvance?.(next.id), () => setOrder((o) => (o ? { ...o, status: next.id, history: [{ id: `h${o.history.length + 1}`, time: "Just now", text: `Moved to ${next.label.toLowerCase()}.` }, ...o.history] } : o)), `Moved to ${next.label.toLowerCase()}.`)
  }
  function addLine(e: React.FormEvent) {
    e.preventDefault()
    const qty = Number(draft.qty)
    const unit = Number(draft.unit)
    if (!draft.description.trim() || !(qty > 0) || !(unit >= 0) || draft.unit === "") return
    const line = { kind: draft.kind, description: draft.description.trim(), qty, unit }
    void run("line", () => onAddLine?.(line), () => { setOrder((o) => (o ? { ...o, lines: [...o.lines, { ...line, id: `l${o.lines.length + 1}` }] } : o)); setDraft({ kind: draft.kind, description: "", qty: "1", unit: "" }) }, `Added ${line.description}.`)
  }

  return (
    <section data-slot="workorder-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-4xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={view} onRetry={onRetry} label="Loading the work order" loading={<Skel />} empty={{ title: "No work order selected", description: "Pick a job from the list, or create one at the counter.", ...emptyState }} error={{ title: "The work order could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        {order && (
          <>
            <header className="mb-6">
              <p className="text-muted-foreground font-mono text-xs" dir="ltr">{order.id}</p>
              <h1 id={`${id}-title`} className="mt-1 text-3xl font-semibold tracking-[-0.035em] text-balance">{order.item}</h1>
              <p className="text-muted-foreground mt-1">{order.customer}</p>
              <p className="mt-3 max-w-2xl text-pretty"><span className="font-medium">Reported: </span>{order.issue}</p>
            </header>

            <ol aria-label="Progress" className="bg-card grid gap-1 rounded-xl border p-3 sm:grid-cols-5">
              {STEPS.map((s, i) => (
                <li key={s.id} aria-current={i === idx ? "step" : undefined} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm", i === idx && "bg-accent font-medium", i > idx && "text-muted-foreground")}>
                  <span aria-hidden="true" className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px]", i < idx && "bg-foreground text-background border-foreground", i === idx && "border-foreground")}>{i < idx ? <Check className="size-3" /> : i + 1}</span>
                  <span>{s.label}<span className="sr-only">{i < idx ? ", done" : i === idx ? ", current step" : ", not started"}</span></span>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p aria-live="polite" className={cn("text-sm", note && !note.ok && "text-destructive font-medium")} role={note && !note.ok ? "alert" : undefined}>{note?.text}</p>
              <Button disabled={idx >= STEPS.length - 1 || busy === "advance"} onClick={advance}>
                {busy === "advance" ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
                {idx >= STEPS.length - 1 ? "Ready to collect" : `Move to ${STEPS[idx + 1].label.toLowerCase()}`}
                {idx < STEPS.length - 1 && <ChevronRight aria-hidden="true" className="rtl:rotate-180" />}
              </Button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div className="min-w-0">
                <h2 className="mb-3 text-lg font-semibold tracking-tight">Parts and labour</h2>
                <div tabIndex={0} role="region" aria-label="Parts and labour, scrollable" className="focus-visible:ring-ring/50 overflow-x-auto rounded-xl border outline-none focus-visible:ring-[3px]">
                  <table className="w-full min-w-[26rem] border-collapse text-sm">
                    <caption className="sr-only">Parts and labour for {order.id}</caption>
                    <thead className="bg-muted/40 text-muted-foreground text-xs">
                      <tr>
                        <th scope="col" className="px-4 py-2.5 text-start font-medium">Item</th>
                        <th scope="col" className="px-3 py-2.5 text-end font-medium">Qty</th>
                        <th scope="col" className="px-3 py-2.5 text-end font-medium">Each</th>
                        <th scope="col" className="px-4 py-2.5 text-end font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.lines.map((l) => (
                        <tr key={l.id}>
                          <th scope="row" className="px-4 py-2.5 text-start font-normal">{l.description}<span className="text-muted-foreground block text-xs">{l.kind === "part" ? "Part" : "Labour, per hour"}</span></th>
                          <td className="px-3 py-2.5 text-end tabular-nums">{l.qty}</td>
                          <td className="text-muted-foreground px-3 py-2.5 text-end tabular-nums">{money(l.unit)}</td>
                          <td className="px-4 py-2.5 text-end font-medium tabular-nums">{money(l.qty * l.unit)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t text-sm">
                      <tr><th scope="row" colSpan={3} className="text-muted-foreground px-4 py-2 text-end font-normal">Subtotal</th><td className="px-4 py-2 text-end tabular-nums">{money(subtotal)}</td></tr>
                      <tr><th scope="row" colSpan={3} className="text-muted-foreground px-4 py-2 text-end font-normal">Tax ({+(taxRate * 100).toFixed(1)}%)</th><td className="px-4 py-2 text-end tabular-nums">{money(tax)}</td></tr>
                      <tr className="bg-muted/30 font-semibold"><th scope="row" colSpan={3} className="px-4 py-2.5 text-end">Total</th><td className="px-4 py-2.5 text-end tabular-nums">{money(subtotal + tax)}</td></tr>
                    </tfoot>
                  </table>
                </div>
                <form onSubmit={addLine} className="mt-3 grid min-w-0 gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)_4rem_5.5rem_auto]" aria-label="Add a line">
                  <select aria-label="Kind" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as "part" | "labour" })} className="bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-2 text-sm outline-none focus-visible:ring-[3px]"><option value="part">Part</option><option value="labour">Labour</option></select>
                  <input aria-label="Description" placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="bg-background focus-visible:ring-ring/50 h-9 min-w-0 rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]" />
                  <input aria-label="Quantity" inputMode="decimal" value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: e.target.value })} className="bg-background focus-visible:ring-ring/50 h-9 min-w-0 rounded-md border px-2 text-end text-sm outline-none focus-visible:ring-[3px]" />
                  <input aria-label="Price each" placeholder="Price" inputMode="decimal" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} className="bg-background focus-visible:ring-ring/50 h-9 min-w-0 rounded-md border px-2 text-end text-sm outline-none focus-visible:ring-[3px]" />
                  <Button type="submit" size="sm" variant="outline" disabled={busy === "line"}><Plus aria-hidden="true" /> Add</Button>
                </form>
              </div>

              <div className="grid min-w-0 content-start gap-6">
                <div>
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight"><MessageSquare aria-hidden="true" className="size-4" /> Message the customer</h2>
                  <div className="grid gap-2">
                    {msgs.map((m) => (
                      <Button key={m.id} variant="outline" className="h-auto justify-start py-2.5 text-start whitespace-normal" disabled={busy === m.id} onClick={() => void run(m.id, () => onMessage?.({ id: m.id, text: m.text }), () => setOrder((o) => (o ? { ...o, history: [{ id: `h${o.history.length + 1}`, time: "Just now", text: `Messaged the customer: ${m.label.toLowerCase()}.` }, ...o.history] } : o)), `Sent to ${order.customer}: ${m.label.toLowerCase()}.`)}>
                        <span><span className="block font-medium">{m.label}</span><span className="text-muted-foreground block text-xs font-normal">{m.text}</span></span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="mb-3 text-lg font-semibold tracking-tight">History</h2>
                  <ol aria-label="History, newest first" className="grid gap-3">
                    {order.history.map((h) => (
                      <li key={h.id} className="border-border border-s ps-4 text-sm"><time className="text-muted-foreground block text-xs">{h.time}</time>{h.text}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </>
        )}
      </StateView>
    </section>
  )
}

export { Workorder1, type Workorder1Data, type Workorder1Line, type Workorder1Props, type Workorder1Status }
