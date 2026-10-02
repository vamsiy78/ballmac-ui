// Ballmac UI: Goods product page. https://ui.ballmac.com/templates/template-goods
"use client"

import * as React from "react"
import { Check, Minus, Plus, Truck } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ballmac/accordion"
import { cart } from "@/components/ballmac/templates/goods/goods-cart"
import { glazes, money, productById, products, reviewList } from "@/components/ballmac/templates/goods/goods-data"
import { ProductCard, productLink } from "@/components/ballmac/templates/goods/goods-home"
import { GoodsShell, Piece, Stars, goodsSerifClass, type GoodsHrefs } from "@/components/ballmac/templates/goods/goods-theme"
import { cn } from "@/lib/utils"

const viewNames = ["Front", "Close up", "In a pair", "On a dark wall"]
const bars = [[5, 78], [4, 15], [3, 5], [2, 1], [1, 1]]

type GoodsProductProps = React.ComponentProps<"div"> & {
  hrefs?: Partial<GoodsHrefs>
  /** Product id. When left out the page reads ?p= from the address, then falls back to the first product. */
  slug?: string
}

/** A product page: gallery with four views, glaze and quantity pickers, an add-to-bag that confirms, details, reviews and pairings. */
function GoodsProduct({ hrefs, slug, ...props }: GoodsProductProps) {
  const link = { shop: "/goods/shop", product: "/goods/shop/morning-mug", cart: "/goods/cart", ...hrefs }
  const [id, setId] = React.useState(slug ?? products[0]!.id)
  React.useEffect(() => {
    if (slug) return setId(slug)
    const p = new URLSearchParams(window.location.search).get("p")
    if (p) setId(p)
  }, [slug])
  const product = productById(id)
  const [glaze, setGlaze] = React.useState(product.glazes[0]!)
  const [view, setView] = React.useState(0)
  const [qty, setQty] = React.useState(1)
  const [added, setAdded] = React.useState(false)
  React.useEffect(() => { setGlaze(product.glazes[0]!); setView(0); setQty(1); setAdded(false) }, [product])
  const pairs = products.filter((p) => p.category !== product.category && p.id !== product.id).slice(0, 4)
  const picker = "hover:bg-accent focus-visible:ring-ring/50 inline-flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-[3px]"

  return (
    <GoodsShell page="product" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-7xl px-4 pt-8 pb-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm"><a href={link.shop} className="hover:text-foreground underline underline-offset-4">Shop</a><span aria-hidden="true"> / </span><span>{product.category}</span><span aria-hidden="true"> / </span><span aria-current="page" className="text-foreground font-medium">{product.name}</span></nav>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-[5rem_minmax(0,1fr)]">
            <div role="radiogroup" aria-label="Gallery views" className="order-2 grid grid-cols-4 gap-3 sm:order-1 sm:grid-cols-1 sm:content-start">
              {viewNames.map((v, i) => (
                <button key={v} type="button" role="radio" aria-checked={view === i} aria-label={v} onClick={() => setView(i)} className={cn("focus-visible:ring-ring/50 overflow-hidden rounded-xl border-2 outline-none focus-visible:ring-[3px]", view === i ? "border-foreground" : "border-transparent")}><Piece shape={product.shape} glaze={glaze} view={i} /></button>
              ))}
            </div>
            <div className="order-1 sm:order-2"><Piece shape={product.shape} glaze={glaze} view={view} className="rounded-3xl" /><p role="status" className="sr-only">Showing the {viewNames[view]!.toLowerCase()} view in {glazes[glaze]!.name}</p></div>
          </div>

          <div>
            <h1 className={cn("text-[clamp(2.6rem,5vw,4rem)] leading-none", goodsSerifClass)}>{product.name}</h1>
            <p className="mt-3 flex items-center gap-3 text-sm"><Stars value={product.rating} /><a href="#reviews" className="underline underline-offset-4">{product.rating} · {product.reviews} reviews</a></p>
            <p className="mt-5 text-3xl font-semibold tabular-nums">{money(product.price)}</p>
            <p className="text-muted-foreground mt-4 text-lg text-pretty">{product.description}</p>

            <fieldset className="mt-8"><legend className="font-bold">Glaze: <span className="font-normal">{glazes[glaze]!.name}</span></legend>
              <div className="mt-3 flex gap-3">{product.glazes.map((g) => <label key={g} className={cn("focus-within:ring-ring/50 relative size-11 cursor-pointer rounded-full border-2 transition-shadow focus-within:ring-[3px] motion-reduce:transition-none", glazes[g]!.cls, glaze === g ? "border-foreground ring-background ring-2 ring-inset" : "border-transparent")}><input type="radio" name="glaze" value={g} checked={glaze === g} onChange={() => setGlaze(g)} className="sr-only" /><span className="sr-only">{glazes[g]!.name}</span></label>)}</div>
            </fieldset>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div role="group" aria-label="Quantity" className="flex items-center rounded-full border">
                <button type="button" aria-label="Fewer" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} className={cn(picker, "disabled:opacity-50")}><Minus className="size-4" aria-hidden="true" /></button>
                <output aria-live="polite" className="w-9 text-center font-semibold tabular-nums">{qty}</output>
                <button type="button" aria-label="More" disabled={qty >= 10} onClick={() => setQty((q) => Math.min(10, q + 1))} className={cn(picker, "disabled:opacity-50")}><Plus className="size-4" aria-hidden="true" /></button>
              </div>
              <button type="button" disabled={!product.inStock} onClick={() => { cart.add(product.id, glaze, qty); setAdded(true) }} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 h-14 flex-1 rounded-full px-8 text-lg font-bold outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px] disabled:opacity-60">{product.inStock ? `Add to bag · ${money(product.price * qty)}` : "Sold out"}</button>
            </div>
            <p role="status" className="mt-3 min-h-6 text-sm font-medium">{added ? <span className="inline-flex items-center gap-2"><Check className="size-4" aria-hidden="true" />Added to your bag. <a href={link.cart} className="underline underline-offset-4">View bag</a></span> : null}</p>
            <p className="bg-secondary mt-4 flex items-center gap-3 rounded-2xl p-4 text-sm"><Truck className="size-5 shrink-0" aria-hidden="true" />Ships in two working days. Free over $80, free returns for 30 days.</p>

            <Accordion type="single" collapsible defaultValue="size" className="mt-8">
              <AccordionItem value="size"><AccordionTrigger className="font-bold">Size and capacity</AccordionTrigger><AccordionContent className="text-muted-foreground">{product.size}. Sizes vary by up to 5 mm because each piece is made by hand.</AccordionContent></AccordionItem>
              <AccordionItem value="care"><AccordionTrigger className="font-bold">Care</AccordionTrigger><AccordionContent className="text-muted-foreground">Dishwasher, microwave and oven safe to 220°C. Avoid sudden changes from freezer to hob. Hand wash if you want the glaze to last a lifetime.</AccordionContent></AccordionItem>
              <AccordionItem value="ship"><AccordionTrigger className="font-bold">Shipping and returns</AccordionTrigger><AccordionContent className="text-muted-foreground">UK delivery takes two to three days and costs $6. Return anything within 30 days with the prepaid label in the box.</AccordionContent></AccordionItem>
            </Accordion>
          </div>
        </div>

        <section id="reviews" aria-labelledby="gp-rev" className="mt-20 scroll-mt-24 grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div>
            <h2 id="gp-rev" className={cn("text-3xl", goodsSerifClass)}>Reviews</h2>
            <p className="mt-4 flex items-end gap-3"><span className={cn("text-6xl leading-none", goodsSerifClass)}>{product.rating}</span><Stars value={product.rating} className="pb-1" /></p>
            <p className="text-muted-foreground mt-1 text-sm">{product.reviews} reviews</p>
            <ul className="mt-5 grid gap-2" aria-label="Rating breakdown">{bars.map(([s, pct]) => <li key={s} className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 text-sm"><span>{s} star</span><span className="bg-muted h-2 overflow-hidden rounded-full" aria-hidden="true"><span className="bg-chart-3 block h-full" style={{ width: `${pct}%` }} /></span><span className="text-muted-foreground text-end tabular-nums">{pct}%</span></li>)}</ul>
          </div>
          <ul className="divide-y border-y">{reviewList.map((r) => <li key={r.name} className="py-6"><div className="flex items-center justify-between gap-3"><Stars value={r.stars} /><span className="text-muted-foreground text-sm">{r.date}</span></div><h3 className={cn("mt-3 text-xl", goodsSerifClass)}>{r.title}</h3><p className="text-muted-foreground mt-1 text-pretty">{r.body}</p><p className="mt-3 text-sm font-semibold">{r.name} <span className="text-muted-foreground font-normal">· Verified buyer</span></p></li>)}</ul>
        </section>

        <section aria-labelledby="gp-pair" className="mt-20">
          <h2 id="gp-pair" className={cn("text-3xl sm:text-4xl", goodsSerifClass)}>Pairs well with</h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{pairs.map((p) => <ProductCard key={p.id} product={p} href={productLink(link.product, p.id)} />)}</ul>
        </section>
      </main>
    </GoodsShell>
  )
}

export { GoodsProduct, type GoodsProductProps }
