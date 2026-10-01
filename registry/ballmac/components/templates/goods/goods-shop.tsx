// Ballmac UI: Goods shop page. https://ui.ballmac.com/templates/template-goods
"use client"

import * as React from "react"
import { SlidersHorizontal, X } from "lucide-react"

import { Slider } from "@/components/ballmac/slider"
import { ProductCard, productLink } from "@/components/ballmac/templates/goods/goods-home"
import { glazes, money, products, type Category } from "@/components/ballmac/templates/goods/goods-data"
import { GoodsShell, goodsSerifClass, type GoodsHrefs } from "@/components/ballmac/templates/goods/goods-theme"
import { cn } from "@/lib/utils"

const categories: Category[] = ["Mugs", "Bowls", "Vases", "Plates"]
const sorts = [["featured", "Featured"], ["low", "Price: low to high"], ["high", "Price: high to low"], ["rating", "Best rated"]] as const

type GoodsShopProps = React.ComponentProps<"div"> & { hrefs?: Partial<GoodsHrefs> }

/** The shop: category, price, glaze and stock filters with removable chips, sorting and an honest empty state. */
function GoodsShop({ hrefs, ...props }: GoodsShopProps) {
  const link = { product: "/goods/shop/morning-mug", ...hrefs }
  const [cats, setCats] = React.useState<Category[]>([])
  const [maxPrice, setMaxPrice] = React.useState(80)
  const [picked, setPicked] = React.useState<number[]>([])
  const [stock, setStock] = React.useState(false)
  const [sort, setSort] = React.useState<(typeof sorts)[number][0]>("featured")
  const toggle = <T,>(set: React.Dispatch<React.SetStateAction<T[]>>, v: T) => set((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]))
  const list = products
    .filter((p) => (cats.length === 0 || cats.includes(p.category)) && p.price <= maxPrice && (picked.length === 0 || p.glazes.some((g) => picked.includes(g))) && (!stock || p.inStock))
    .sort((a, b) => (sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : sort === "rating" ? b.rating - a.rating : 0))
  const active = cats.length + picked.length + (stock ? 1 : 0) + (maxPrice < 80 ? 1 : 0)
  const clear = () => { setCats([]); setPicked([]); setStock(false); setMaxPrice(80) }
  const chip = "bg-secondary hover:bg-accent focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-full pl-3 pr-2 text-sm font-medium outline-none focus-visible:ring-[3px]"

  const filters = (p: string) => (
    <div className="grid gap-8">
      <fieldset><legend className="mb-3 font-bold">Piece</legend><div className="flex flex-wrap gap-2">{categories.map((c) => <button key={c} type="button" aria-pressed={cats.includes(c)} onClick={() => toggle(setCats, c)} className="hover:bg-accent focus-visible:ring-ring/50 aria-pressed:bg-primary aria-pressed:text-primary-foreground h-10 rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-[3px]">{c} <span className="opacity-100">({products.filter((p) => p.category === c).length})</span></button>)}</div></fieldset>
      <div><p id={`${p}-price`} className="mb-3 flex justify-between font-bold">Price<span className="text-muted-foreground font-normal">up to {money(maxPrice)}</span></p><Slider aria-labelledby={`${p}-price`} thumbLabels={["Maximum price"]} min={20} max={80} step={2} value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0]!)} /></div>
      <fieldset><legend className="mb-3 font-bold">Glaze</legend><div className="flex flex-wrap gap-3">{glazes.map((g, i) => <button key={g.name} type="button" aria-pressed={picked.includes(i)} aria-label={g.name} title={g.name} onClick={() => toggle(setPicked, i)} className={cn("focus-visible:ring-ring/50 relative size-9 rounded-full border-2 border-transparent outline-none focus-visible:ring-[3px] aria-pressed:border-foreground aria-pressed:ring-2 aria-pressed:ring-background aria-pressed:ring-offset-0", g.cls)} />)}</div></fieldset>
      <label className="flex cursor-pointer items-center gap-3 font-semibold"><input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} className="accent-primary size-5" />In stock only</label>
    </div>
  )

  return (
    <GoodsShell page="shop" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6">
        <h1 className={cn("text-[clamp(3rem,8vw,6rem)] leading-none", goodsSerifClass)}>The shop</h1>
        <p className="text-muted-foreground mt-3 max-w-xl text-xl text-pretty">Twelve pieces, five glazes and nothing you do not need.</p>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside aria-label="Filters" className="hidden lg:block">{filters("gs-d")}</aside>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <details className="lg:hidden"><summary className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-10 cursor-pointer list-none items-center gap-2 rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-[3px]"><SlidersHorizontal className="size-4" aria-hidden="true" />Filters{active > 0 ? ` (${active})` : ""}</summary><div className="bg-card mt-3 rounded-3xl border p-5">{filters("gs-m")}</div></details>
              <p role="status" className="text-muted-foreground text-sm">{list.length} {list.length === 1 ? "piece" : "pieces"}</p>
              <div className="ml-auto flex items-center gap-2 text-sm"><label htmlFor="gs-sort" className="text-muted-foreground">Sort</label><select id="gs-sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="bg-card focus-visible:ring-ring/50 h-10 rounded-full border px-3 font-medium outline-none focus-visible:ring-[3px]">{sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
            </div>
            {active > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active filters" role="group">
                {cats.map((c) => <button key={c} type="button" aria-label={`Remove filter ${c}`} className={chip} onClick={() => toggle(setCats, c)}>{c}<X className="size-4" aria-hidden="true" /></button>)}
                {picked.map((g) => <button key={g} type="button" aria-label={`Remove filter ${glazes[g]!.name}`} className={chip} onClick={() => toggle(setPicked, g)}>{glazes[g]!.name}<X className="size-4" aria-hidden="true" /></button>)}
                {maxPrice < 80 && <button type="button" aria-label="Remove price filter" className={chip} onClick={() => setMaxPrice(80)}>Up to {money(maxPrice)}<X className="size-4" aria-hidden="true" /></button>}
                {stock && <button type="button" aria-label="Remove in stock filter" className={chip} onClick={() => setStock(false)}>In stock<X className="size-4" aria-hidden="true" /></button>}
                <button type="button" onClick={clear} className="focus-visible:ring-ring/50 rounded text-sm font-semibold underline underline-offset-4 outline-none focus-visible:ring-[3px]">Clear all</button>
              </div>
            )}
            {list.length > 0 ? (
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">{list.map((p) => <ProductCard key={p.id} product={p} href={productLink(link.product, p.id)} />)}</ul>
            ) : (
              <div className="bg-surface mt-6 rounded-3xl border p-12 text-center"><p className={cn("text-3xl", goodsSerifClass)}>Nothing fits that exactly.</p><p className="text-muted-foreground mt-2">Try a higher price or fewer glazes.</p><button type="button" onClick={clear} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mt-6 h-11 rounded-full px-6 font-bold outline-none focus-visible:ring-[3px]">Clear filters</button></div>
            )}
          </div>
        </div>
      </main>
    </GoodsShell>
  )
}

export { GoodsShop, type GoodsShopProps }
