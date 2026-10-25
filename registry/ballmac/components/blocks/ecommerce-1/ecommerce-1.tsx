// Ballmac UI: Ecommerce 1. https://ui.ballmac.com/blocks/ecommerce-1
"use client"

import * as React from "react"
import { Check, Heart, Loader2, ShoppingBag, SlidersHorizontal, Star, X } from "lucide-react"

import { Checkbox } from "@/components/ballmac/checkbox"
import { ProductArt, type ProductArtKind, type ProductArtTone } from "@/components/ballmac/product-art"
import { Skeleton } from "@/components/ballmac/skeleton"
import { frameProps, StateView, type StateProps } from "@/components/ballmac/state-view"
import { cn } from "@/lib/utils"

type Ecommerce1Product = {
  id: string
  name: string
  /** Price in whole currency units. */
  price: number
  /** The price before a discount. Shows the old price and a Sale tag. */
  compareAt?: number
  rating: number
  reviews: number
  category: string
  colors: { id: string; label: string; tone: ProductArtTone }[]
  kind: ProductArtKind
  /** A short tag on the picture, for example "New". */
  badge?: string
}

type Ecommerce1Props = Omit<React.ComponentProps<"section">, "title"> &
  StateProps & {
    title?: string
    description?: string
    products?: Ecommerce1Product[]
    /** ISO 4217 currency code. */
    currency?: string
    /** Called to add a product (with the color shown). Reject and the card says why. */
    onAddToCart?: (id: string, colorId: string) => void | Promise<void>
    /** Called when the heart is toggled. Reject and it goes back. */
    onToggleSaved?: (id: string, saved: boolean) => void | Promise<void>
  }

const sample: Ecommerce1Product[] = [
  { id: "aria", name: "Aria portable speaker", price: 129, compareAt: 159, rating: 4.7, reviews: 1284, category: "Audio", kind: "speaker", badge: "Sale", colors: [{ id: "sand", label: "Sand", tone: 3 }, { id: "sky", label: "Sky", tone: 1 }, { id: "moss", label: "Moss", tone: 2 }] },
  { id: "halo", name: "Halo over-ear headphones", price: 219, rating: 4.8, reviews: 892, category: "Audio", kind: "headphones", badge: "New", colors: [{ id: "ink", label: "Ink", tone: 5 }, { id: "sky", label: "Sky", tone: 1 }] },
  { id: "ember", name: "Ember ceramic mug", price: 28, rating: 4.5, reviews: 412, category: "Kitchen", kind: "mug", colors: [{ id: "clay", label: "Clay", tone: 4 }, { id: "sand", label: "Sand", tone: 3 }, { id: "moss", label: "Moss", tone: 2 }] },
  { id: "drift", name: "Drift insulated bottle", price: 38, compareAt: 45, rating: 4.6, reviews: 2210, category: "Kitchen", kind: "bottle", badge: "Sale", colors: [{ id: "sky", label: "Sky", tone: 1 }, { id: "ink", label: "Ink", tone: 5 }] },
  { id: "field", name: "Field everyday tote", price: 84, rating: 4.4, reviews: 318, category: "Bags", kind: "bag", colors: [{ id: "clay", label: "Clay", tone: 4 }, { id: "moss", label: "Moss", tone: 2 }, { id: "ink", label: "Ink", tone: 5 }] },
  { id: "glow", name: "Glow desk lamp", price: 96, rating: 4.9, reviews: 176, category: "Home", kind: "lamp", badge: "New", colors: [{ id: "sand", label: "Sand", tone: 3 }, { id: "ink", label: "Ink", tone: 5 }] },
  { id: "trail", name: "Trail weekender bag", price: 148, rating: 4.7, reviews: 540, category: "Bags", kind: "bag", colors: [{ id: "moss", label: "Moss", tone: 2 }, { id: "clay", label: "Clay", tone: 4 }] },
  { id: "pulse", name: "Pulse mini speaker", price: 59, compareAt: 79, rating: 4.3, reviews: 903, category: "Audio", kind: "speaker", badge: "Sale", colors: [{ id: "clay", label: "Clay", tone: 4 }, { id: "sky", label: "Sky", tone: 1 }] },
]

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
  { id: "rating", label: "Best rated" },
] as const

function Skel() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <div className="hidden gap-3 lg:grid">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5">{Array.from({ length: 6 }, (_, i) => <div key={i} className="grid gap-2"><Skeleton className="aspect-square rounded-xl" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/3" /></div>)}</div>
    </div>
  )
}

function Stars({ value }: { value: number }) {
  return (
    <span aria-hidden="true" className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className="relative size-3.5">
          <Star className="absolute inset-0 size-3.5 text-border" />
          <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: `${Math.min(1, Math.max(0, value - (n - 1))) * 100}%` }}>
            <Star className="size-3.5 fill-foreground text-foreground" />
          </span>
        </span>
      ))}
    </span>
  )
}

function Card({ p, money, onAddToCart, onToggleSaved }: { p: Ecommerce1Product; money: (n: number) => string; onAddToCart?: Ecommerce1Props["onAddToCart"]; onToggleSaved?: Ecommerce1Props["onToggleSaved"] }) {
  const [color, setColor] = React.useState(p.colors[0]?.id)
  const [saved, setSaved] = React.useState(false)
  const [phase, setPhase] = React.useState<"idle" | "adding" | "added">("idle")
  const [error, setError] = React.useState<string | null>(null)
  const tone = p.colors.find((c) => c.id === color)?.tone ?? 1

  async function add() {
    setPhase("adding")
    setError(null)
    try {
      await (onAddToCart ? onAddToCart(p.id, color ?? "") : new Promise((r) => setTimeout(r, 600)))
      setPhase("added")
      setTimeout(() => setPhase("idle"), 1800)
    } catch (e) {
      setPhase("idle")
      setError(e instanceof Error ? e.message : "It could not be added. Nothing was changed.")
    }
  }
  async function toggleSaved() {
    const next = !saved
    setSaved(next)
    try {
      await onToggleSaved?.(p.id, next)
    } catch {
      setSaved(!next)
    }
  }

  return (
    <li className="group/card grid min-w-0 content-start gap-3">
      <div className="relative">
        <ProductArt kind={p.kind} tone={tone} className="transition-transform duration-500 group-hover/card:scale-[1.02] motion-reduce:transition-none" />
        {p.badge && <span className="absolute start-3 top-3 rounded-full bg-foreground px-2.5 py-0.5 text-[11px] font-medium text-background">{p.badge}</span>}
        <button type="button" aria-pressed={saved} aria-label={`Save ${p.name}`} onClick={() => void toggleSaved()} className="absolute end-3 top-3 flex size-9 items-center justify-center rounded-full bg-card/90 shadow-sm outline-none backdrop-blur hover:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <Heart aria-hidden="true" className={cn("size-4", saved && "fill-foreground")} />
        </button>
        <button type="button" disabled={phase === "adding"} onClick={() => void add()} aria-label={`Add ${p.name} to the bag`} className="absolute inset-x-3 bottom-3 flex h-10 items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background shadow-sm outline-none transition-[opacity,transform] focus-visible:ring-[3px] focus-visible:ring-ring/60 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/card:translate-y-0 [@media(hover:hover)]:group-focus-within/card:opacity-100 [@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100 motion-reduce:transition-none disabled:opacity-80">
          {phase === "adding" ? <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : phase === "added" ? <Check aria-hidden="true" className="size-4" /> : <ShoppingBag aria-hidden="true" className="size-4" />}
          {phase === "added" ? "Added" : phase === "adding" ? "Adding" : "Add to bag"}
        </button>
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-medium leading-snug text-balance">{p.name}</h3>
          <p className="shrink-0 text-sm tabular-nums">
            <span className="font-semibold">{money(p.price)}</span>
            {p.compareAt && (
              <>
                <span className="sr-only"> was </span>
                <span className="ms-1.5 text-xs text-muted-foreground line-through">{money(p.compareAt)}</span>
              </>
            )}
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Stars value={p.rating} />
          <span className="sr-only">{p.rating} out of 5 stars, </span>
          <span className="tabular-nums">{p.rating.toFixed(1)} ({p.reviews.toLocaleString("en-US")})</span>
        </p>
        <div role="radiogroup" aria-label={`Color for ${p.name}`} className="flex gap-1.5">
          {p.colors.map((c) => (
            <label key={c.id} className="relative cursor-pointer" title={c.label}>
              <input type="radio" name={`${p.id}-color`} checked={color === c.id} onChange={() => setColor(c.id)} className="peer sr-only" />
              <span className="sr-only">{c.label}</span>
              <span aria-hidden="true" className="block size-5 rounded-full border-2 border-card ring-1 ring-border peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/60" style={{ background: `color-mix(in oklch, var(--chart-${c.tone}) 70%, var(--card))` }} />
            </label>
          ))}
        </div>
        {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
      </div>
    </li>
  )
}

/**
 * A product listing that sells: a grid of cards with price, sale, rating and color choices, filters you can see and clear, sorting, and a bag button that
 * says what it did. Filters and sort live on the page, results are counted aloud, and the heart and the bag report failures instead of failing quietly.
 */
function Ecommerce1({ title = "Everyday essentials", description = "Made to last, and easy to live with.", products = sample, currency = "USD", onAddToCart, onToggleSaved, state = "ready", onRetry, emptyState, errorState, className, ...props }: Ecommerce1Props) {
  const id = React.useId()
  const money = React.useMemo(() => { const f = new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }); return (n: number) => f.format(n) }, [currency])
  const [cats, setCats] = React.useState<string[]>([])
  const [sale, setSale] = React.useState(false)
  const [band, setBand] = React.useState<"all" | "u50" | "u100" | "o100">("all")
  const [sort, setSort] = React.useState<(typeof SORTS)[number]["id"]>("featured")
  const [open, setOpen] = React.useState(false)
  const view = state === "ready" && products.length === 0 ? "empty" : state
  const categories = [...new Set(products.map((p) => p.category))]

  const shown = products
    .filter((p) => (cats.length === 0 || cats.includes(p.category)) && (!sale || !!p.compareAt) && (band === "all" || (band === "u50" ? p.price < 50 : band === "u100" ? p.price >= 50 && p.price <= 100 : p.price > 100)))
    .sort((a, b) => (sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : sort === "rating" ? b.rating - a.rating : 0))
  const chips = [...cats.map((c) => ({ key: `c-${c}`, label: c, clear: () => setCats((l) => l.filter((x) => x !== c)) })), ...(sale ? [{ key: "sale", label: "On sale", clear: () => setSale(false) }] : []), ...(band !== "all" ? [{ key: "band", label: { u50: "Under $50", u100: "$50 to $100", o100: "Over $100" }[band], clear: () => setBand("all") }] : [])]
  const clearAll = () => { setCats([]); setSale(false); setBand("all") }

  const filters = (
    <div className="grid content-start gap-6">
      <fieldset className="grid gap-2.5">
        <legend className="mb-1 text-sm font-semibold">Category</legend>
        {categories.map((c) => (
          <label key={c} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox checked={cats.includes(c)} onCheckedChange={(v) => setCats((l) => (v ? [...l, c] : l.filter((x) => x !== c)))} />
            {c}
            <span className="ms-auto text-xs tabular-nums text-muted-foreground">{products.filter((p) => p.category === c).length}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className="grid gap-2.5">
        <legend className="mb-1 text-sm font-semibold">Price</legend>
        {([["all", "Any price"], ["u50", "Under $50"], ["u100", "$50 to $100"], ["o100", "Over $100"]] as const).map(([v, l]) => (
          <label key={v} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input type="radio" name={`${id}-band`} checked={band === v} onChange={() => setBand(v)} className="size-4 accent-foreground" />
            {l}
          </label>
        ))}
      </fieldset>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
        <Checkbox checked={sale} onCheckedChange={(v) => setSale(v === true)} />
        On sale
      </label>
    </div>
  )

  return (
    <section data-slot="ecommerce-1" data-state={state} aria-labelledby={`${id}-title`} className={cn("mx-auto w-full max-w-6xl px-4 py-10 sm:px-6", className)} {...frameProps(props)}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id={`${id}-title`} className="text-3xl font-semibold tracking-[-0.035em] text-balance">{title}</h1>
          <p className="mt-1.5 text-muted-foreground text-pretty">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-expanded={open} aria-controls={`${id}-filters`} onClick={() => setOpen((v) => !v)} className="inline-flex h-10 items-center gap-2 rounded-lg border bg-card px-3.5 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 lg:hidden">
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            Filters{chips.length > 0 && <span className="rounded-full bg-foreground px-1.5 text-[11px] text-background">{chips.length}</span>}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="sr-only sm:not-sr-only text-muted-foreground">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 rounded-lg border bg-card px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </header>
      <StateView state={view} onRetry={onRetry} label="Loading products" loading={<Skel />} empty={{ title: "Nothing here yet", description: "New products will appear here soon.", ...emptyState }} error={{ title: "The products could not be loaded", description: "Nothing was changed. Check your connection and try again.", ...errorState }}>
        <div className="grid items-start gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <div id={`${id}-filters`} className={cn("rounded-xl border bg-card p-5 lg:sticky lg:top-6 lg:border-0 lg:bg-transparent lg:p-0", !open && "max-lg:hidden")}>{filters}</div>
          <div className="min-w-0">
            <div className="mb-5 flex min-h-8 flex-wrap items-center gap-2">
              <p aria-live="polite" className="me-2 text-sm text-muted-foreground">{shown.length} {shown.length === 1 ? "product" : "products"}</p>
              {chips.map((c) => (
                <button key={c.key} type="button" onClick={c.clear} className="inline-flex h-8 items-center gap-1.5 rounded-full border bg-card px-3 text-xs font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  {c.label}
                  <X aria-hidden="true" className="size-3" />
                  <span className="sr-only">Remove this filter</span>
                </button>
              ))}
              {chips.length > 1 && <button type="button" onClick={clearAll} className="h-8 rounded-md px-2 text-xs font-medium text-muted-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50">Clear all</button>}
            </div>
            {shown.length > 0 ? (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:gap-x-5">
                {shown.map((p) => <Card key={p.id} p={p} money={money} onAddToCart={onAddToCart} onToggleSaved={onToggleSaved} />)}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed px-6 py-16 text-center">
                <p className="font-medium">Nothing matches those filters</p>
                <p className="mt-1 text-sm text-muted-foreground">Try removing one, or start again.</p>
                <button type="button" onClick={clearAll} className="mt-4 h-9 rounded-lg border bg-card px-4 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50">Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      </StateView>
    </section>
  )
}

export { Ecommerce1, type Ecommerce1Product, type Ecommerce1Props }
