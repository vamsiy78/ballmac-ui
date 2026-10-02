// Ballmac UI: Atlas order detail page. https://ui.ballmac.com/templates/template-atlas
"use client"

import * as React from "react"
import { Check, ChevronRight, CreditCard, Mail, MapPin, MoreHorizontal, Printer, RotateCcw, Truck } from "lucide-react"

import { Checkbox } from "@/components/ballmac/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ballmac/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ballmac/dropdown-menu"
import { formatDate, formatTime, getCustomer, getProduct, initials, moneyExact, orderShipping, orderTotal, orders } from "@/components/ballmac/templates/atlas/atlas-data"
import { AtlasShell, FulfilmentBadge, PaymentBadge, ProductTile, atlasButton, type AtlasHrefs } from "@/components/ballmac/templates/atlas/atlas-theme"
import { cn } from "@/lib/utils"

type Event = { id: string; title: string; detail?: string; at: string }

type AtlasOrderProps = React.ComponentProps<"div"> & {
  /** Which sample order to show. */
  orderId?: string
  hrefs?: Partial<AtlasHrefs>
}

/** The Atlas order page: items and totals, a live timeline, fulfilment and a refund flow with validation, plus customer and notes. */
function AtlasOrder({ orderId = "ORD-10479", hrefs, ...props }: AtlasOrderProps) {
  const base = orders.find((o) => o.id === orderId) ?? orders[1]
  const customer = getCustomer(base.customerId)
  const [fulfillment, setFulfillment] = React.useState(base.fulfillment)
  const [payment, setPayment] = React.useState(base.payment)
  const [refunded, setRefunded] = React.useState(0)
  const [events, setEvents] = React.useState<Event[]>([
    { id: "e3", title: "Payment captured", detail: `${moneyExact.format(orderTotal(base) + orderShipping(base))} on Visa ending 4242`, at: base.date },
    { id: "e2", title: "Order confirmation sent", detail: `Emailed to ${customer.email}`, at: base.date },
    { id: "e1", title: "Order placed", detail: `via ${base.channel}`, at: base.date },
  ])
  const [note, setNote] = React.useState("Gift wrap please. Leave with the neighbour if nobody is home.")
  const [savedNote, setSavedNote] = React.useState(note)
  const [refundOpen, setRefundOpen] = React.useState(false)
  const [picked, setPicked] = React.useState<Record<string, boolean>>({})
  const [reason, setReason] = React.useState("")
  const [error, setError] = React.useState("")
  const [announce, setAnnounce] = React.useState("")

  const subtotal = orderTotal(base)
  const shipping = orderShipping(base)
  const total = subtotal + shipping
  const refundAmount = base.items.reduce((n, l) => n + (picked[l.productId] ? getProduct(l.productId).price * l.qty : 0), 0)
  const stamp = "2026-09-29T14:20:00Z"

  function addEvent(title: string, detail?: string) {
    setEvents((all) => [{ id: `e${all.length + 1}-${title}`, title, detail, at: stamp }, ...all])
  }
  function ship() {
    setFulfillment("shipped")
    addEvent("Marked as shipped", "Tracking sent to the customer")
    setAnnounce(`${base.id} marked as shipped`)
  }
  function refund() {
    if (refundAmount === 0) return setError("Choose at least one item to refund.")
    if (!reason) return setError("Pick a reason so your team can follow up.")
    setRefunded(refundAmount)
    if (refundAmount === subtotal) setPayment("refunded")
    addEvent(`Refunded ${moneyExact.format(refundAmount)}`, `Reason: ${reason}`)
    setAnnounce(`Refunded ${moneyExact.format(refundAmount)}`)
    setRefundOpen(false)
    setPicked({})
    setReason("")
    setError("")
  }

  return (
    <AtlasShell page="orders" title="Orders" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center gap-1 text-sm">
          <a href={hrefs?.orders ?? "/atlas/orders"} className="hover:text-foreground focus-visible:ring-ring/50 rounded outline-none focus-visible:ring-[3px]">Orders</a>
          <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
          <span className="text-foreground font-medium" aria-current="page">{base.id}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-extrabold tracking-[-0.03em]" style={{ fontFamily: "var(--atlas-mono)" }}>{base.id}</h2>
              <PaymentBadge value={payment} />
              <FulfilmentBadge value={fulfillment} />
            </div>
            <p className="text-muted-foreground mt-1.5 text-sm">{formatDate(base.date)} at {formatTime(base.date)} · {base.channel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={atlasButton.outline} onClick={() => setRefundOpen(true)} disabled={payment === "refunded"}><RotateCcw aria-hidden="true" /> Refund</button>
            {fulfillment === "unfulfilled" && payment !== "pending" ? (
              <button type="button" className={atlasButton.primary} onClick={ship}><Truck aria-hidden="true" /> Mark as shipped</button>
            ) : (
              <button type="button" className={atlasButton.outline}><Printer aria-hidden="true" /> Print packing slip</button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(atlasButton.outline, "px-2.5")} aria-label="More actions"><MoreHorizontal aria-hidden="true" /></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicate order</DropdownMenuItem>
                <DropdownMenuItem>Download invoice</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive>Cancel order</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p role="status" className="sr-only">{announce}</p>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-4">
            <section aria-labelledby="ao-items" className="bg-card rounded-xl border">
              <h3 id="ao-items" className="px-5 pt-4 text-sm font-bold">Items</h3>
              <ul className="divide-y px-5">
                {base.items.map((l) => {
                  const p = getProduct(l.productId)
                  return (
                    <li key={l.productId} className="flex items-center gap-4 py-4">
                      <ProductTile hue={p.hue} className="size-14 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{p.name}</p>
                        <p className="text-muted-foreground text-sm">{p.category} · {moneyExact.format(p.price)} each</p>
                      </div>
                      <p className="text-muted-foreground text-sm tabular-nums">× {l.qty}</p>
                      <p className="w-20 text-end font-semibold tabular-nums">{moneyExact.format(p.price * l.qty)}</p>
                    </li>
                  )
                })}
              </ul>
              <dl className="bg-surface space-y-2 rounded-b-xl border-t px-5 py-4 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{moneyExact.format(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="tabular-nums">{shipping === 0 ? "Free" : moneyExact.format(shipping)}</dd></div>
                {refunded > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Refunded</dt><dd className="text-destructive tabular-nums">−{moneyExact.format(refunded)}</dd></div>}
                <div className="flex justify-between border-t pt-3 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{moneyExact.format(total - refunded)}</dd></div>
              </dl>
            </section>

            <section aria-labelledby="ao-timeline" className="bg-card rounded-xl border p-5">
              <h3 id="ao-timeline" className="text-sm font-bold">Timeline</h3>
              <ol className="mt-4">
                {events.map((e, i) => (
                  <li key={e.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                    {i < events.length - 1 && <span className="bg-border absolute top-5 bottom-0 start-[7px] w-px" aria-hidden="true" />}
                    <span className={cn("relative mt-1 size-3.5 shrink-0 rounded-full border-2", i === 0 ? "border-chart-1 bg-chart-1" : "bg-card border-muted-foreground/50")} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{e.title}</p>
                      {e.detail && <p className="text-muted-foreground text-sm text-pretty">{e.detail}</p>}
                    </div>
                    <p className="text-muted-foreground shrink-0 text-xs tabular-nums">{formatDate(e.at)}, {formatTime(e.at)}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="space-y-4">
            <section aria-labelledby="ao-customer" className="bg-card rounded-xl border p-5">
              <h3 id="ao-customer" className="text-sm font-bold">Customer</h3>
              <div className="mt-4 flex items-center gap-3">
                <span className="bg-chart-1/20 flex size-11 items-center justify-center rounded-full text-sm font-bold" aria-hidden="true">{initials(customer.name)}</span>
                <div className="min-w-0"><p className="truncate font-semibold">{customer.name}</p><p className="text-muted-foreground text-sm">{customer.segment === "VIP" ? "VIP customer" : "Customer since 2025"}</p></div>
              </div>
              <a href={`mailto:${customer.email}`} className="text-chart-1 mt-4 flex items-center gap-2 text-sm underline-offset-4 hover:underline"><Mail className="size-4" aria-hidden="true" />{customer.email}</a>
              <p className="text-muted-foreground mt-3 flex items-start gap-2 text-sm"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{customer.city}<br />Shipping and billing address match</p>
              <p className="text-muted-foreground mt-3 flex items-center gap-2 text-sm"><CreditCard className="size-4" aria-hidden="true" />Visa ending 4242</p>
            </section>
            <section aria-labelledby="ao-notes" className="bg-card rounded-xl border p-5">
              <h3 id="ao-notes" className="text-sm font-bold">Notes</h3>
              <label htmlFor="ao-note" className="sr-only">Order notes</label>
              <textarea id="ao-note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} className="bg-background focus-visible:ring-ring/50 mt-3 w-full resize-none rounded-lg border p-3 text-sm outline-none focus-visible:ring-[3px]" />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs" role="status">{note === savedNote ? <><Check className="size-3.5" aria-hidden="true" />Saved</> : "Unsaved changes"}</p>
                <button type="button" disabled={note === savedNote} onClick={() => { setSavedNote(note); addEvent("Note updated") }} className={atlasButton.outline}>Save note</button>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <Dialog open={refundOpen} onOpenChange={(o) => { setRefundOpen(o); if (!o) setError("") }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refund {base.id}</DialogTitle>
            <DialogDescription>Choose what to send back to the customer. The money returns to their Visa in 5 to 10 days.</DialogDescription>
          </DialogHeader>
          <fieldset className="space-y-2">
            <legend className="sr-only">Items to refund</legend>
            {base.items.map((l) => {
              const p = getProduct(l.productId)
              return (
                <label key={l.productId} className="hover:bg-accent/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
                  <Checkbox checked={!!picked[l.productId]} onCheckedChange={(v) => setPicked((s) => ({ ...s, [l.productId]: v === true }))} />
                  <span className="min-w-0 flex-1 truncate font-medium">{p.name} <span className="text-muted-foreground font-normal">× {l.qty}</span></span>
                  <span className="tabular-nums">{moneyExact.format(p.price * l.qty)}</span>
                </label>
              )
            })}
          </fieldset>
          <div>
            <label htmlFor="ao-reason" className="text-sm font-medium">Reason</label>
            <select id="ao-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="bg-background focus-visible:ring-ring/50 mt-1.5 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-[3px]">
              <option value="">Choose a reason</option>
              <option>Damaged in transit</option>
              <option>Changed their mind</option>
              <option>Wrong item sent</option>
            </select>
          </div>
          {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
          <DialogFooter>
            <button type="button" className={atlasButton.outline} onClick={() => setRefundOpen(false)}>Cancel</button>
            <button type="button" className={atlasButton.primary} onClick={refund}>Refund {refundAmount > 0 ? moneyExact.format(refundAmount) : ""}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AtlasShell>
  )
}

export { AtlasOrder, type AtlasOrderProps }
