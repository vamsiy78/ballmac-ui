// Ballmac UI: Goods home page. https://ui.ballmac.com/templates/template-goods
"use client"

import * as React from "react"
import { ArrowRight, Check, Flame, Recycle, RotateCcw, Truck } from "lucide-react"

import { cart } from "@/components/ballmac/templates/goods/goods-cart"
import { glazes, money, products, reviewList, type Product } from "@/components/ballmac/templates/goods/goods-data"
import { GoodsShell, Piece, Stars, goodsOnClay, goodsSerifClass, type GoodsHrefs } from "@/components/ballmac/templates/goods/goods-theme"
import { cn } from "@/lib/utils"

/** Link to one product: preview pages pass the id as ?p=, installed routes use /goods/shop/<id>. */
function productLink(base: string, id: string) {
  return base.includes("/preview/") ? `${base}?p=${id}` : base.replace(/[^/]+$/, id)
}

/** A product tile with the glaze dots and a quick add that confirms in place. */
function ProductCard({ product, href }: { product: Product; href: string }) {
  const [added, setAdded] = React.useState(false)
  React.useEffect(() => {
    if (!added) return
    const id = window.setTimeout(() => setAdded(false), 1800)
    return () => window.clearTimeout(id)
  }, [added])
  return (
    <li className="group relative">
      <a href={href} className="focus-visible:ring-ring/50 block rounded-3xl outline-none focus-visible:ring-[3px]">
        <div className="relative overflow-hidden rounded-3xl">
          <Piece shape={product.shape} glaze={product.glazes[0]} className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
          {product.tag && <span className={cn("bg-chart-3 absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold", goodsOnClay)}>{product.tag}</span>}
        </div>
        <span className="mt-4 flex items-start justify-between gap-3"><span className={cn("text-xl", goodsSerifClass)}>{product.name}</span><span className="font-semibold tabular-nums">{money(product.price)}</span></span>
        <span className="text-muted-foreground mt-1 block text-sm text-pretty">{product.tagline}</span>
      </a>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="flex gap-1.5" aria-label={`Glazes: ${product.glazes.map((g) => glazes[g]!.name).join(", ")}`} role="img">{product.glazes.map((g) => <span key={g} aria-hidden="true" className={cn("size-4 rounded-full border", glazes[g]!.cls)} />)}</span>
        <button type="button" disabled={!product.inStock} onClick={() => { cart.add(product.id, product.glazes[0]!); setAdded(true) }} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-[3px] disabled:opacity-60"><span aria-live="polite">{!product.inStock ? "Sold out" : added ? <span className="inline-flex items-center gap-1"><Check className="size-4" aria-hidden="true" />Added</span> : "Add to bag"}</span></button>
      </div>
    </li>
  )
}

const values = [[Flame, "Hand-thrown", "Every piece is made on the wheel."], [Recycle, "Plastic-free", "Packed in paper and shredded card."], [Truck, "Two-day dispatch", "From our shed to your door."], [RotateCcw, "30-day returns", "No questions, free labels."]] as const
const cats = [["Mugs", "mug", 1], ["Bowls", "bowl", 2], ["Vases", "vase", 3], ["Plates", "plate", 4]] as const

type GoodsHomeProps = React.ComponentProps<"div"> & { hrefs?: Partial<GoodsHrefs> }

/** The Goods home page: a hero collage, values, categories, bestsellers, the story, reviews and a newsletter. */
function GoodsHome({ hrefs, ...props }: GoodsHomeProps) {
  const link = { shop: "/goods/shop", product: "/goods/shop/morning-mug", ...hrefs }
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState("")
  const [done, setDone] = React.useState(false)
  function join(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter an email like you@example.com.")
    setError("")
    setDone(true)
  }
  return (
    <GoodsShell page="home" hrefs={hrefs} {...props}>
      <main>
        <section aria-labelledby="gh-title" className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div>
            <p className="bg-secondary inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold"><Stars value={5} /> 4.8 from 1,240 reviews</p>
            <h1 id="gh-title" className={cn("mt-6 text-[clamp(3.2rem,8vw,7rem)] leading-[0.95] text-balance", goodsSerifClass)}>Made slowly.<br /><em className="text-chart-1">Used daily.</em></h1>
            <p className="text-muted-foreground mt-6 max-w-md text-xl text-pretty">Everyday ceramics thrown by hand in a shed in Bristol, fired in batches of forty and sent to your table.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={link.shop} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex h-14 items-center gap-2 rounded-full px-8 text-lg font-bold outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] motion-reduce:transition-none motion-reduce:hover:translate-y-0">Shop the collection <ArrowRight className="size-5" aria-hidden="true" /></a>
              <a href={productLink(link.product, "morning-mug")} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-14 items-center rounded-full border-2 px-8 text-lg font-bold outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none">Meet the Morning mug</a>
            </div>
          </div>
          <div aria-hidden="true" className="grid grid-cols-2 gap-4">
            <Piece shape="vase" glaze={3} view={0} className="rounded-[2.5rem] rounded-br-[6rem]" />
            <div className="grid gap-4 pt-10"><Piece shape="mug" glaze={0} view={2} className="aspect-square rounded-[2.5rem] rounded-tl-[6rem]" /><Piece shape="bowl" glaze={1} view={3} className="aspect-square rounded-full" /></div>
          </div>
        </section>

        <section aria-label="Why Kiln & Co" className="bg-surface border-y">
          <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">{values.map(([Icon, t, b]) => <li key={t} className="flex items-start gap-4"><span className="bg-chart-2/30 inline-flex size-11 shrink-0 items-center justify-center rounded-full"><Icon className="size-5" aria-hidden="true" /></span><span><span className="block font-bold">{t}</span><span className="text-muted-foreground text-sm">{b}</span></span></li>)}</ul>
        </section>

        <section aria-labelledby="gh-cats" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 id="gh-cats" className={cn("text-4xl sm:text-5xl", goodsSerifClass)}>Shop by piece</h2>
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{cats.map(([name, shape, g]) => <li key={name}><a href={link.shop} className="focus-visible:ring-ring/50 group block rounded-3xl outline-none focus-visible:ring-[3px]"><Piece shape={shape} glaze={g} view={1} className="aspect-square rounded-3xl transition-transform group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0" /><span className={cn("mt-3 flex items-center justify-between text-2xl", goodsSerifClass)}>{name}<ArrowRight className="size-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" /></span></a></li>)}</ul>
        </section>

        <section aria-labelledby="gh-best" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="flex items-end justify-between gap-4"><h2 id="gh-best" className={cn("text-4xl sm:text-5xl", goodsSerifClass)}>People keep buying these</h2><a href={link.shop} className="text-sm font-bold underline underline-offset-4">Shop everything</a></div>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{[products[0]!, products[2]!, products[4]!, products[6]!].map((p) => <ProductCard key={p.id} product={p} href={productLink(link.product, p.id)} />)}</ul>
        </section>

        <section aria-labelledby="gh-story" className="bg-primary text-primary-foreground">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-4" aria-hidden="true"><Piece shape="pitcher" glaze={4} view={3} className="rounded-3xl" /><Piece shape="plate" glaze={2} view={1} className="mt-12 rounded-3xl" /></div>
            <div>
              <h2 id="gh-story" className={cn("text-4xl text-balance sm:text-6xl", goodsSerifClass)}>A small studio with a very big kiln.</h2>
              <p className="mt-5 max-w-lg text-lg text-pretty">Three potters, one shed and a kiln named Gerald. We make forty pieces at a time, so nothing sits in a warehouse and nothing is wasted.</p>
              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-current/25 pt-6">{[["412", "firings last year"], ["40", "pieces per batch"], ["0", "plastic in the box"]].map(([n, l]) => <div key={l}><dd className={cn("text-4xl sm:text-5xl", goodsSerifClass)}>{n}</dd><dt className="mt-1 text-sm">{l}</dt></div>)}</dl>
            </div>
          </div>
        </section>

        <section aria-labelledby="gh-rev" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 id="gh-rev" className={cn("text-4xl sm:text-5xl", goodsSerifClass)}>Kind words</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">{reviewList.slice(0, 3).map((r) => <li key={r.name} className="bg-card rounded-3xl border p-7"><Stars value={r.stars} /><p className={cn("mt-4 text-2xl text-balance", goodsSerifClass)}>“{r.title}”</p><p className="text-muted-foreground mt-3 text-pretty">{r.body}</p><p className="mt-5 text-sm font-semibold">{r.name}</p></li>)}</ul>
        </section>

        <section aria-labelledby="gh-news" className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
          <div className="bg-chart-3/40 rounded-[2rem] px-6 py-14 text-center sm:px-12">
            <h2 id="gh-news" className={cn("mx-auto max-w-xl text-4xl text-balance sm:text-5xl", goodsSerifClass)}>Get 10% off your first piece</h2>
            <p className="mx-auto mt-3 max-w-md text-pretty">Join the kiln list for new glazes, studio sales and the odd photo of Gerald.</p>
            {done ? <p role="status" className="mt-6 inline-flex items-center gap-2 font-semibold"><Check className="size-5" aria-hidden="true" />Welcome. Your code is KILN10.</p> : (
              <form onSubmit={join} noValidate className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
                <label htmlFor="gh-email" className="sr-only">Email address</label>
                <input id="gh-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "gh-err" : undefined} placeholder="you@example.com" className="bg-background focus-visible:ring-ring/50 aria-invalid:border-destructive h-12 min-w-0 flex-1 rounded-full border px-5 outline-none focus-visible:ring-[3px]" />
                <button type="submit" className="bg-primary text-primary-foreground focus-visible:ring-ring/50 h-12 rounded-full px-7 font-bold outline-none focus-visible:ring-[3px]">Send my code</button>
              </form>
            )}
            {error && <p id="gh-err" role="alert" className="text-destructive mt-2 text-sm font-medium">{error}</p>}
          </div>
        </section>
      </main>
    </GoodsShell>
  )
}

export { GoodsHome, ProductCard, productLink, type GoodsHomeProps }
