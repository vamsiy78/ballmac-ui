// Ballmac UI: Ecommerce 3. https://ui.ballmac.com/blocks/ecommerce-3
"use client"

import * as React from "react"
import { ArrowRight, Check, Lock, Minus, Plus, Tag, Trash2, Truck, Undo2, X } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { ProductArt, type ProductArtKind, type ProductArtTone } from "@/components/ballmac/product-art"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Ecommerce3Line = { id: string; name: string; variant: string; price: number; quantity: number; kind: ProductArtKind; tone: ProductArtTone; /** The most that can be bought. */ max?: number }
type Ecommerce3Promo = { code: string; label: string; /** Amount off, in whole currency units. */ amount: number }

type Ecommerce3Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    lines?: Ecommerce3Line[]
    currency?: string
    /** Spend this much and shipping is free. */
    freeShippingFrom?: number
    /** What shipping costs below that. */
    shippingCost?: number
    /** Called with the new quantity. Reject and it goes back with the reason. */
    onChangeQuantity?: (id: string, quantity: number) => void | Promise<void>
    /** Called after the undo window. Reject and the line comes back with the reason. */
    onRemove?: (id: string) => void | Promise<void>
    /** Called with a code. Resolve with the discount; reject with a message such as "That code has expired." */
    onApplyPromo?: (code: string) => Promise<Ecommerce3Promo>
    onCheckout?: () => void | Promise<void>
    /** How long Undo is offered after a remove, in milliseconds. */
    undoMs?: number
  }

const sample: Ecommerce3Line[] = [
  { id: "1", name: "Aria portable speaker", variant: "Sand · With travel case", price: 129, quantity: 1, kind: "speaker", tone: 3, max: 5 },
  { id: "2", name: "Ember ceramic mug", variant: "Clay", price: 28, quantity: 2, kind: "mug", tone: 4, max: 8 },
  { id: "3", name: "Glow desk lamp", variant: "Ink", price: 96, quantity: 1, kind: "lamp", tone: 5, max: 2 },
]

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )
}

/**
 * A shopping bag that is hard to get wrong: quantities change at once and go back with the reason if they cannot be saved, removing a line leaves an Undo for a few
 * seconds, a promo code says why it failed, and a bar shows how far you are from free shipping. Every amount is text.
 */
function Ecommerce3({ title = "Your bag", lines: initial = sample, currency = "USD", freeShippingFrom = 150, shippingCost = 8, onChangeQuantity, onRemove, onApplyPromo, onCheckout, undoMs = 5000, state = "ready", onRetry, emptyState, errorState, className, ...props }: Ecommerce3Props) {
  const id = React.useId()
  const money = React.useMemo(() => { const f = new Intl.NumberFormat("en-US", { style: "currency", currency }); return (n: number) => f.format(n) }, [currency])
  const [lines, setLines] = React.useState(initial)
  const [leaving, setLeaving] = React.useState<string[]>([])
  const [promo, setPromo] = React.useState<Ecommerce3Promo | null>(null)
  const [code, setCode] = React.useState("")
  const [promoBusy, setPromoBusy] = React.useState(false)
  const [promoError, setPromoError] = React.useState<string | null>(null)
  const [paying, setPaying] = React.useState(false)
  const [status, setStatus] = React.useState<{ text: string; error?: boolean } | null>(null)
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const latest = React.useRef({ onRemove })
  latest.current = { onRemove }
  React.useEffect(() => {
    const pending = timers.current
    return () => {
      for (const [k, t] of pending) {
        clearTimeout(t)
        void latest.current.onRemove?.(k)
      }
      pending.clear()
    }
  }, [])

  const live = lines.filter((l) => !leaving.includes(l.id))
  const subtotal = live.reduce((s, l) => s + l.price * l.quantity, 0)
  const discount = promo ? Math.min(promo.amount, subtotal) : 0
  const after = subtotal - discount
  const free = after >= freeShippingFrom
  const shipping = live.length === 0 ? 0 : free ? 0 : shippingCost
  const total = after + shipping
  const toGo = Math.max(0, freeShippingFrom - after)
  const count = live.reduce((n, l) => n + l.quantity, 0)
  const fail = (e: unknown) => setStatus({ text: e instanceof Error ? e.message : "That did not work. Nothing was changed.", error: true })

  async function setQty(l: Ecommerce3Line, q: number) {
    setLines((a) => a.map((x) => (x.id === l.id ? { ...x, quantity: q } : x)))
    try {
      await onChangeQuantity?.(l.id, q)
      setStatus({ text: `${l.name}: quantity ${q}` })
    } catch (e) {
      setLines((a) => a.map((x) => (x.id === l.id ? { ...x, quantity: l.quantity } : x)))
      fail(e)
    }
  }
  function remove(l: Ecommerce3Line) {
    setLeaving((a) => [...a, l.id])
    setStatus({ text: `${l.name} removed. You can still undo.` })
    timers.current.set(l.id, setTimeout(async () => {
      timers.current.delete(l.id)
      try {
        await onRemove?.(l.id)
        setLines((a) => a.filter((x) => x.id !== l.id))
      } catch (e) {
        fail(e)
      }
      setLeaving((a) => a.filter((x) => x !== l.id))
    }, undoMs))
  }
  function undo(l: Ecommerce3Line) {
    const t = timers.current.get(l.id)
    if (t) clearTimeout(t)
    timers.current.delete(l.id)
    setLeaving((a) => a.filter((x) => x !== l.id))
    setStatus({ text: `${l.name} is back in your bag` })
  }
  async function apply(e: React.FormEvent) {
    e.preventDefault()
    const c = code.trim()
    if (!c) return
    setPromoBusy(true)
    setPromoError(null)
    try {
      const p = await (onApplyPromo ? onApplyPromo(c) : new Promise<Ecommerce3Promo>((res, rej) => setTimeout(() => (c.toUpperCase() === "WELCOME10" ? res({ code: "WELCOME10", label: "Welcome offer, 10 off", amount: 10 }) : rej(new Error("That code is not valid. Check the spelling and try again."))), 600)))
      setPromo(p)
      setCode("")
      setStatus({ text: `${p.label} applied` })
    } catch (err) {
      setPromoError(err instanceof Error ? err.message : "That code could not be applied.")
    } finally {
      setPromoBusy(false)
    }
  }
  async function checkout() {
    setPaying(true)
    try {
      await onCheckout?.()
    } catch (e) {
      fail(e)
    } finally {
      setPaying(false)
    }
  }

  const view = state === "ready" && lines.length === 0 ? "empty" : state

  return (
    <section data-slot="ecommerce-3" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-5xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 flex items-baseline justify-between gap-3">
        <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em]">{title}</h1>
        <p className="text-sm text-muted-foreground tabular-nums">{count} {count === 1 ? "item" : "items"}</p>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading your bag" loading={<Skel />} empty={{ title: "Your bag is empty", description: "When you add something, it will wait for you here.", ...emptyState }} error={{ title: "Your bag could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <div className="grid min-w-0 gap-6">
            <div className="grid gap-2.5 rounded-xl border bg-card p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Truck aria-hidden="true" className="size-4" />
                {live.length === 0 ? "Add something to start" : free ? "You have free shipping" : `Add ${money(toGo)} more for free shipping`}
              </p>
              <div role="meter" aria-label="Progress to free shipping" aria-valuemin={0} aria-valuemax={freeShippingFrom} aria-valuenow={Math.min(after, freeShippingFrom)} aria-valuetext={free ? "Free shipping unlocked" : `${money(toGo)} to go`} className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${Math.min(100, (after / freeShippingFrom) * 100)}%` }} />
              </div>
            </div>
            <ul className="grid grid-cols-[minmax(0,1fr)] divide-y rounded-xl border bg-card">
              {lines.map((l) =>
                leaving.includes(l.id) ? (
                  <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-4 text-sm text-muted-foreground sm:px-5">
                    <span className="min-w-0 truncate">{l.name} was removed</span>
                    <button type="button" onClick={() => undo(l)} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border bg-background px-3 font-medium text-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">
                      <Undo2 aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
                      Undo
                    </button>
                  </li>
                ) : (
                  <li key={l.id} className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-5 sm:p-5">
                    <ProductArt kind={l.kind} tone={l.tone} className="rounded-lg" />
                    <div className="grid min-w-0 content-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-snug">{l.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{l.variant}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">{money(l.price * l.quantity)}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div role="group" aria-label={`Quantity of ${l.name}`} className="flex h-9 items-center rounded-lg border">
                          <button type="button" aria-label={`One fewer ${l.name}`} disabled={l.quantity <= 1} onClick={() => void setQty(l, l.quantity - 1)} className="flex size-9 items-center justify-center rounded-s-lg outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50 disabled:opacity-40"><Minus aria-hidden="true" className="size-3.5" /></button>
                          <span className="w-7 text-center text-sm font-medium tabular-nums">{l.quantity}</span>
                          <button type="button" aria-label={`One more ${l.name}`} disabled={l.max !== undefined && l.quantity >= l.max} onClick={() => void setQty(l, l.quantity + 1)} className="flex size-9 items-center justify-center rounded-e-lg outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50 disabled:opacity-40"><Plus aria-hidden="true" className="size-3.5" /></button>
                        </div>
                        <button type="button" onClick={() => remove(l)} aria-label={`Remove ${l.name}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
                          <Trash2 aria-hidden="true" className="size-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>

          <aside aria-labelledby={`${id}-sum`} className="grid gap-5 rounded-xl border bg-card p-5 sm:p-6 lg:sticky lg:top-6">
            <h2 id={`${id}-sum`} className="text-base font-semibold">Order summary</h2>
            {promo ? (
              <p className="flex items-center justify-between gap-2 rounded-lg border border-dashed px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2"><Check aria-hidden="true" className="size-4 shrink-0" /><span className="truncate">{promo.label}</span></span>
                <button type="button" onClick={() => setPromo(null)} aria-label={`Remove the code ${promo.code}`} className="flex size-7 shrink-0 items-center justify-center rounded-md outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"><X aria-hidden="true" className="size-3.5" /></button>
              </p>
            ) : (
              <form onSubmit={(e) => void apply(e)} className="grid gap-1.5">
                <label htmlFor={`${id}-code`} className="text-sm font-medium">Promo code</label>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Tag aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input id={`${id}-code`} value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" aria-invalid={!!promoError} aria-describedby={promoError ? `${id}-code-err` : undefined} placeholder="Try WELCOME10" className="h-10 w-full rounded-lg border bg-background ps-9 pe-3 text-sm uppercase outline-none placeholder:normal-case focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive" />
                  </div>
                  <Button type="submit" variant="outline" loading={promoBusy} disabled={!code.trim()} className="h-10">Apply</Button>
                </div>
                {promoError && <p id={`${id}-code-err`} role="alert" className="text-xs font-medium text-destructive">{promoError}</p>}
              </form>
            )}
            <dl className="grid gap-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd className="tabular-nums">−{money(discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="tabular-nums">{live.length === 0 ? "–" : free ? "Free" : money(shipping)}</dd></div>
              <div className="flex justify-between border-t pt-3 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{money(total)}</dd></div>
            </dl>
            <Button size="lg" loading={paying} disabled={live.length === 0} onClick={() => void checkout()} className="h-12 w-full text-base">
              Check out <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><Lock aria-hidden="true" className="size-3" />Taxes are added at checkout. 30-day returns.</p>
          </aside>
        </div>
        <p aria-live="polite" role={status?.error ? "alert" : undefined} className={cn("mt-4 min-h-5 text-sm", status?.error ? "font-medium text-destructive" : "text-muted-foreground")}>{status?.text}</p>
      </StateView>
    </section>
  )
}

export { Ecommerce3, type Ecommerce3Line, type Ecommerce3Promo, type Ecommerce3Props }
