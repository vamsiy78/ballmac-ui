// Ballmac UI: Ecommerce 5. https://ui.ballmac.com/blocks/ecommerce-5
"use client"

import * as React from "react"
import { Box, Check, CircleCheck, Clipboard, ClipboardCheck, MapPin, PackageCheck, PackageOpen, RotateCcw, Truck } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { ProductArt, type ProductArtKind, type ProductArtTone } from "@/components/ballmac/product-art"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Ecommerce5Stage = "ordered" | "packed" | "shipped" | "out" | "delivered"
type Ecommerce5Order = {
  number: string
  placed: string
  total: string
  stage: Ecommerce5Stage
  /** What the carrier says about the arrival, in a sentence. */
  eta: string
  carrier: string
  tracking: string
  address: string[]
  items: { id: string; name: string; variant: string; quantity: number; kind: ProductArtKind; tone: ProductArtTone }[]
  /** Newest first. */
  events: { id: string; when: string; text: string; place?: string }[]
}

type Ecommerce5Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    order?: Ecommerce5Order
    /** Adds Start a return when the order is delivered. Reject and the reason is shown. */
    onStartReturn?: (orderNumber: string) => void | Promise<void>
    /** Adds Change delivery while the order has not shipped. Reject and the reason is shown. */
    onChangeDelivery?: (orderNumber: string) => void | Promise<void>
  }

const STAGES: { id: Ecommerce5Stage; label: string; Icon: typeof Box }[] = [
  { id: "ordered", label: "Ordered", Icon: Box },
  { id: "packed", label: "Packed", Icon: PackageOpen },
  { id: "shipped", label: "Shipped", Icon: Truck },
  { id: "out", label: "Out for delivery", Icon: MapPin },
  { id: "delivered", label: "Delivered", Icon: PackageCheck },
]

const sample: Ecommerce5Order = {
  number: "BM-48213",
  placed: "Oct 24",
  total: "$185.00",
  stage: "out",
  eta: "Arriving today between 10:00 and 14:00",
  carrier: "Parcel Express",
  tracking: "PX 7741 0098 2231",
  address: ["Sam Rivera", "12 Quay Street", "Bristol BS1 4DJ", "United Kingdom"],
  items: [
    { id: "1", name: "Aria portable speaker", variant: "Sand · With travel case", quantity: 1, kind: "speaker", tone: 3 },
    { id: "2", name: "Ember ceramic mug", variant: "Clay", quantity: 2, kind: "mug", tone: 4 },
  ],
  events: [
    { id: "e5", when: "Today, 07:42", text: "Out for delivery with the driver", place: "Bristol depot" },
    { id: "e4", when: "Today, 05:10", text: "Arrived at the local depot", place: "Bristol" },
    { id: "e3", when: "Yesterday, 21:30", text: "Left the sorting centre", place: "Birmingham" },
    { id: "e2", when: "Oct 25, 16:05", text: "Picked up by the carrier", place: "Our warehouse" },
    { id: "e1", when: "Oct 24, 09:18", text: "Order received and packed" },
  ],
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6">
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-72 rounded-xl" /><Skeleton className="h-72 rounded-xl" /></div>
    </div>
  )
}

/**
 * An order tracking page that answers the one question people have, where is it and when does it arrive: a sentence at the top, five stages with the current one
 * marked in words, the carrier's own log, the tracking number to copy, and the right next action for where the order is.
 */
function Ecommerce5({ order = sample, onStartReturn, onChangeDelivery, state = "ready", onRetry, emptyState, errorState, className, ...props }: Ecommerce5Props) {
  const id = React.useId()
  const [copied, setCopied] = React.useState(false)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<{ text: string; error?: boolean } | null>(null)
  const at = STAGES.findIndex((s) => s.id === order.stage)
  const delivered = order.stage === "delivered"

  async function copy() {
    try {
      await navigator.clipboard.writeText(order.tracking)
      setCopied(true)
      setStatus({ text: "Tracking number copied" })
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setStatus({ text: "It could not be copied. Select the number and copy it yourself.", error: true })
    }
  }
  async function run(key: string, fn: () => void | Promise<void>, ok: string) {
    setBusy(key)
    setStatus(null)
    try {
      await fn()
      setStatus({ text: ok })
    } catch (e) {
      setStatus({ text: e instanceof Error ? e.message : "That did not work. Nothing was changed.", error: true })
    } finally {
      setBusy(null)
    }
  }

  return (
    <section data-slot="ecommerce-5" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={state} onRetry={onRetry} label="Loading your order" loading={<Skel />} empty={{ title: "We could not find that order", description: "Check the order number in your confirmation email.", ...emptyState }} error={{ title: "Your order could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Order <span className="font-mono text-foreground">{order.number}</span> · placed {order.placed} · {order.total}</p>
            <h1 id={`${id}-title`} className="mt-1 text-3xl font-semibold tracking-[-0.035em] text-balance">{delivered ? "Your order has arrived" : order.eta}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {at < 2 && onChangeDelivery && <Button variant="outline" loading={busy === "change"} onClick={() => void run("change", () => onChangeDelivery(order.number), "We have asked to change the delivery.")}>Change delivery</Button>}
            {delivered && onStartReturn && <Button variant="outline" loading={busy === "return"} onClick={() => void run("return", () => onStartReturn(order.number), "Your return has started. Check your email for the label.")}><RotateCcw aria-hidden="true" className="size-4" />Start a return</Button>}
          </div>
        </header>

        <ol aria-label="Delivery progress" className="mb-8 grid grid-cols-5 gap-2 rounded-xl border bg-card p-4 sm:p-6">
          {STAGES.map((s, i) => {
            const past = i < at
            const now = i === at
            return (
              <li key={s.id} aria-current={now ? "step" : undefined} className="relative grid justify-items-center gap-2 text-center">
                {i > 0 && <span aria-hidden="true" className={cn("absolute end-1/2 top-4 h-0.5 w-full", i <= at ? "bg-foreground" : "bg-border")} />}
                <span aria-hidden="true" className={cn("relative z-10 flex size-8 items-center justify-center rounded-full border-2 bg-card transition-colors motion-reduce:transition-none", past || (now && delivered) ? "border-foreground bg-foreground text-background" : now ? "border-foreground" : "border-border text-muted-foreground")}>
                  {past || (now && delivered) ? <Check className="size-4" strokeWidth={3} /> : <s.Icon className="size-4" />}
                </span>
                <span className={cn("text-xs leading-tight text-balance sm:text-sm", now ? "font-semibold" : past ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                  <span className="sr-only">{now ? " (now)" : past ? " (done)" : " (not yet)"}</span>
                </span>
              </li>
            )
          })}
        </ol>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="rounded-xl border bg-card p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Where it has been</h2>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                {order.carrier}
                <span className="font-mono text-foreground">{order.tracking}</span>
                <button type="button" onClick={() => void copy()} aria-label="Copy the tracking number" className="flex size-8 items-center justify-center rounded-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  {copied ? <ClipboardCheck aria-hidden="true" className="size-4" /> : <Clipboard aria-hidden="true" className="size-4" />}
                </button>
              </p>
            </div>
            <ol className="relative grid gap-5 ps-6 before:absolute before:inset-y-1.5 before:start-[0.4rem] before:w-px before:bg-border">
              {order.events.map((e, i) => (
                <li key={e.id} className="relative">
                  <span aria-hidden="true" className={cn("absolute -start-6 top-1.5 size-3 rounded-full border-2 bg-card", i === 0 ? "border-foreground bg-foreground" : "border-border")} />
                  <p className={cn("text-sm", i === 0 ? "font-semibold" : "font-medium")}>{e.text}</p>
                  <p className="text-xs text-muted-foreground">{e.when}{e.place ? ` · ${e.place}` : ""}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-6">
            <div className="rounded-xl border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold">In this order</h2>
              <ul className="grid gap-4">
                {order.items.map((it) => (
                  <li key={it.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3">
                    <ProductArt kind={it.kind} tone={it.tone} className="rounded-lg" />
                    <p className="min-w-0 text-sm"><span className="block truncate font-medium">{it.name}</span><span className="block truncate text-xs text-muted-foreground">{it.variant} · Quantity {it.quantity}</span></p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-5 sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold"><MapPin aria-hidden="true" className="size-4" />Delivering to</h2>
              <address className="text-sm not-italic leading-relaxed text-muted-foreground">{order.address.map((l) => <span key={l} className="block">{l}</span>)}</address>
            </div>
          </div>
        </div>
        <p aria-live="polite" role={status?.error ? "alert" : undefined} className={cn("mt-4 flex min-h-5 items-center gap-2 text-sm", status?.error ? "font-medium text-destructive" : "text-muted-foreground")}>{status && !status.error && <CircleCheck aria-hidden="true" className="size-4" />}{status?.text}</p>
      </StateView>
    </section>
  )
}

export { Ecommerce5, type Ecommerce5Order, type Ecommerce5Props, type Ecommerce5Stage }
