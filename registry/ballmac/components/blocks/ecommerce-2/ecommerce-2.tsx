// Ballmac UI: Ecommerce 2. https://ui.ballmac.com/blocks/ecommerce-2
"use client"

import * as React from "react"
import { Check, ChevronDown, Heart, Minus, Plus, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react"

import { Button } from "@/components/ballmac/button"
import { ProductArt, type ProductArtKind, type ProductArtTone } from "@/components/ballmac/product-art"
import { RatingDistribution, type RatingCounts } from "@/components/ballmac/rating-distribution"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Ecommerce2Option = { id: string; label: string; available?: boolean }
type Ecommerce2Product = {
  name: string
  price: number
  compareAt?: number
  summary: string
  kind: ProductArtKind
  colors: { id: string; label: string; tone: ProductArtTone }[]
  /** A second choice such as size. */
  option?: { label: string; values: Ecommerce2Option[] }
  /** Fine print in openable sections. */
  details: { title: string; body: string }[]
  highlights: string[]
  counts: RatingCounts
  reviews: { id: string; author: string; rating: 1 | 2 | 3 | 4 | 5; title: string; body: string; date: string }[]
}

type Ecommerce2Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    product?: Ecommerce2Product
    currency?: string
    /** Called with the choices. Reject and the reason is shown under the button. */
    onAddToBag?: (item: { color: string; option?: string; quantity: number }) => void | Promise<void>
  }

const sample: Ecommerce2Product = {
  name: "Aria portable speaker",
  price: 129,
  compareAt: 159,
  summary: "Room-filling sound in something you can carry with one finger. Twenty-four hours of battery, a loop for hanging it anywhere, and a body that shrugs off rain.",
  kind: "speaker",
  colors: [{ id: "sand", label: "Sand", tone: 3 }, { id: "sky", label: "Sky", tone: 1 }, { id: "moss", label: "Moss", tone: 2 }, { id: "clay", label: "Clay", tone: 4 }],
  option: { label: "Bundle", values: [{ id: "solo", label: "Speaker" }, { id: "case", label: "With travel case" }, { id: "pair", label: "Pair", available: false }] },
  highlights: ["24 hours of playback", "Waterproof to 1 meter", "Pairs two speakers for stereo", "Recycled aluminum body"],
  details: [
    { title: "What is in the box", body: "The speaker, a USB-C charging cable, a hanging loop and a printed quick-start card. No charger is included, to cut waste; any USB-C charger works." },
    { title: "Shipping", body: "Free over $75. Orders placed before 2 pm ship the same day and arrive in 2 to 4 working days. We ship to 38 countries and show duties at checkout." },
    { title: "Returns and warranty", body: "Return it within 30 days for a full refund, even if it has been used. Every speaker has a two-year warranty that covers the battery." },
  ],
  counts: { 5: 984, 4: 212, 3: 52, 2: 22, 1: 14 },
  reviews: [
    { id: "1", author: "Maya T.", rating: 5, title: "Louder than it looks", body: "Took it to the beach and it filled the whole cove. Still had half a battery after the weekend.", date: "Oct 19" },
    { id: "2", author: "Jonas B.", rating: 4, title: "Great, wish it had a strap", body: "The sound is the best I have heard at this size. The loop is fine, but a longer strap would be nicer.", date: "Oct 11" },
  ],
}

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-10 lg:grid-cols-2">
      <div className="grid gap-3"><Skeleton className="aspect-square rounded-2xl" /><div className="grid grid-cols-4 gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}</div></div>
      <div className="grid content-start gap-4"><Skeleton className="h-9 w-3/4" /><Skeleton className="h-5 w-1/3" /><Skeleton className="h-24" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
    </div>
  )
}

/**
 * A product page that closes the sale: a gallery you can step through with the arrow keys, the price and what people think of it, choices that name what is
 * selected, a quantity you can type or step, an add-to-bag button that tells you what happened, and the fine print one tap away.
 */
function Ecommerce2({ product = sample, currency = "USD", onAddToBag, state = "ready", onRetry, emptyState, errorState, className, ...props }: Ecommerce2Props) {
  const id = React.useId()
  const money = React.useMemo(() => { const f = new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }); return (n: number) => f.format(n) }, [currency])
  const [color, setColor] = React.useState(product.colors[0]?.id)
  const [opt, setOpt] = React.useState(product.option?.values.find((v) => v.available !== false)?.id)
  const [qty, setQty] = React.useState(1)
  const [view, setView] = React.useState(0)
  const [saved, setSaved] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const thumbs = React.useRef<(HTMLButtonElement | null)[]>([])
  const total = Object.values(product.counts).reduce((a, b) => a + b, 0)
  const avg = total ? ([1, 2, 3, 4, 5] as const).reduce((s, k) => s + k * product.counts[k], 0) / total : 0
  const current = product.colors.find((c) => c.id === color) ?? product.colors[0]
  // Four views of the same product: the picture in each color, so the gallery works without photos.
  const views = [current, ...product.colors.filter((c) => c.id !== current?.id)].slice(0, 4)

  async function add() {
    setBusy(true)
    setError(null)
    setDone(false)
    try {
      await (onAddToBag ? onAddToBag({ color: color ?? "", option: opt, quantity: qty }) : new Promise((r) => setTimeout(r, 700)))
      setDone(true)
      setTimeout(() => setDone(false), 2400)
    } catch (e) {
      setError(e instanceof Error ? e.message : "It could not be added. Nothing was changed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section data-slot="ecommerce-2" data-state={state} aria-label={product.name} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <StateView state={state} onRetry={onRetry} label="Loading the product" loading={<Skel />} empty={{ title: "This product is no longer available", description: "Have a look at what else we have.", ...emptyState }} error={{ title: "The product could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          <div className="grid gap-3 lg:sticky lg:top-6">
            <ProductArt kind={product.kind} tone={views[view]?.tone ?? 1} label={`${product.name}, ${views[view]?.label ?? ""}`} className="rounded-2xl" />
            <div role="radiogroup" aria-label="Pictures" className="grid grid-cols-4 gap-3" onKeyDown={(e) => {
              const n = e.key === "ArrowRight" ? (view + 1) % views.length : e.key === "ArrowLeft" ? (view + views.length - 1) % views.length : -1
              if (n < 0) return
              e.preventDefault()
              setView(n)
              thumbs.current[n]?.focus()
            }}>
              {views.map((v, i) => (
                <button key={v.id} ref={(el) => { thumbs.current[i] = el }} type="button" role="radio" aria-checked={view === i} aria-label={`Picture ${i + 1} of ${views.length}: ${v.label}`} tabIndex={view === i ? 0 : -1} onClick={() => setView(i)} className={cn("overflow-hidden rounded-xl outline-none ring-offset-2 ring-offset-background focus-visible:ring-[3px] focus-visible:ring-ring", view === i ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100")}>
                  <ProductArt kind={product.kind} tone={v.tone} className="rounded-none" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-3">
              <h1 className="text-3xl font-semibold tracking-[-0.035em] text-balance">{product.name}</h1>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span aria-hidden="true" className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={cn("size-4", n <= Math.round(avg) ? "fill-foreground text-foreground" : "text-border")} />)}</span>
                <a href={`#${id}-reviews`} className="underline-offset-4 hover:underline">{avg.toFixed(1)} out of 5, {total.toLocaleString("en-US")} reviews</a>
              </p>
              <p className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold tabular-nums">{money(product.price)}</span>
                {product.compareAt && (
                  <>
                    <span className="sr-only">Was</span>
                    <span className="text-muted-foreground line-through tabular-nums">{money(product.compareAt)}</span>
                    <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background">Save {money(product.compareAt - product.price)}</span>
                  </>
                )}
              </p>
              <p className="leading-relaxed text-muted-foreground text-pretty">{product.summary}</p>
            </div>

            <fieldset className="grid gap-2.5">
              <legend className="text-sm font-semibold">Color <span className="ms-1 font-normal text-muted-foreground">{current?.label}</span></legend>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((c) => (
                  <label key={c.id} className="relative cursor-pointer">
                    <input type="radio" name={`${id}-color`} checked={color === c.id} onChange={() => { setColor(c.id); setView(0) }} className="peer sr-only" />
                    <span className="sr-only">{c.label}</span>
                    <span aria-hidden="true" className="block size-9 rounded-full border-2 border-background ring-1 ring-border peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring" style={{ background: `color-mix(in oklch, var(--chart-${c.tone}) 70%, var(--card))` }} />
                  </label>
                ))}
              </div>
            </fieldset>

            {product.option && (
              <fieldset className="grid gap-2.5">
                <legend className="text-sm font-semibold">{product.option.label}</legend>
                <div className="flex flex-wrap gap-2">
                  {product.option.values.map((v) => (
                    <label key={v.id} className={cn("relative", v.available === false ? "cursor-not-allowed" : "cursor-pointer")}>
                      <input type="radio" name={`${id}-opt`} disabled={v.available === false} checked={opt === v.id} onChange={() => setOpt(v.id)} className="peer sr-only" />
                      <span className="flex h-10 items-center rounded-lg border px-4 text-sm font-medium transition-colors peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/60 peer-disabled:text-muted-foreground peer-disabled:line-through peer-enabled:hover:border-foreground/40 motion-reduce:transition-none">
                        {v.label}
                        {v.available === false && <span className="sr-only"> (sold out)</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <div role="group" aria-label="Quantity" className="flex h-12 items-center rounded-lg border">
                <button type="button" aria-label="One fewer" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)} className="flex size-12 items-center justify-center rounded-s-lg outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50 disabled:opacity-40"><Minus aria-hidden="true" className="size-4" /></button>
                <output aria-live="polite" className="w-8 text-center font-medium tabular-nums">{qty}</output>
                <button type="button" aria-label="One more" disabled={qty >= 10} onClick={() => setQty((q) => q + 1)} className="flex size-12 items-center justify-center rounded-e-lg outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50 disabled:opacity-40"><Plus aria-hidden="true" className="size-4" /></button>
              </div>
              <Button size="lg" loading={busy} onClick={() => void add()} className="h-12 min-w-44 flex-1 text-base">
                {done ? <><Check aria-hidden="true" className="size-4" /> Added to your bag</> : `Add to bag, ${money(product.price * qty)}`}
              </Button>
              <button type="button" aria-pressed={saved} aria-label="Save for later" onClick={() => setSaved((v) => !v)} className="flex size-12 items-center justify-center rounded-lg border outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <Heart aria-hidden="true" className={cn("size-5", saved && "fill-foreground")} />
              </button>
            </div>
            <p aria-live="polite" role={error ? "alert" : undefined} className={cn("-mt-3 min-h-5 text-sm", error ? "font-medium text-destructive" : "text-muted-foreground")}>{error ?? (done ? "It is in your bag. Keep shopping or check out when you are ready." : "")}</p>

            <ul className="grid gap-3 rounded-xl border bg-card p-4 text-sm sm:grid-cols-3">
              <li className="flex gap-2.5"><Truck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />Free shipping over $75, arrives in 2 to 4 days</li>
              <li className="flex gap-2.5"><RotateCcw aria-hidden="true" className="mt-0.5 size-4 shrink-0" />30-day returns, even if used</li>
              <li className="flex gap-2.5"><ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />Two-year warranty</li>
            </ul>

            <ul className="grid gap-2 text-sm">
              {product.highlights.map((h) => <li key={h} className="flex gap-2.5"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{h}</li>)}
            </ul>

            <div className="divide-y border-y">
              {product.details.map((d) => (
                <details key={d.title} className="group py-1">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                    {d.title}
                    <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                  </summary>
                  <p className="pb-4 text-sm leading-relaxed text-muted-foreground text-pretty">{d.body}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div id={`${id}-reviews`} className="mt-16 grid gap-8 border-t pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14">
          <div>
            <h2 className="mb-5 text-xl font-semibold tracking-[-0.02em]">What people say</h2>
            <RatingDistribution counts={product.counts} />
          </div>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-4">
            {product.reviews.map((r) => (
              <li key={r.id} className="grid gap-1.5 rounded-xl border bg-card p-5">
                <p className="flex items-center justify-between gap-2 text-sm"><span className="font-medium">{r.author}</span><span className="text-xs text-muted-foreground">{r.date}</span></p>
                <p className="flex items-center gap-2 text-sm font-semibold"><span aria-hidden="true" className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={cn("size-3.5", n <= r.rating ? "fill-foreground text-foreground" : "text-border")} />)}</span><span className="sr-only">{r.rating} out of 5 stars.</span>{r.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </StateView>
    </section>
  )
}

export { Ecommerce2, type Ecommerce2Option, type Ecommerce2Product, type Ecommerce2Props }
