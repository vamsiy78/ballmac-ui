// Ballmac UI: Goods template shell. https://ui.ballmac.com/templates/template-goods
"use client"

import * as React from "react"
import { Menu, Minus, Plus, ShoppingBag, Star, X } from "lucide-react"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ballmac/sheet"
import { cart, useCart } from "@/components/ballmac/templates/goods/goods-cart"
import { FREE_SHIPPING, glazes, money, type Shape } from "@/components/ballmac/templates/goods/goods-data"
import { goodsSans, goodsSerif } from "@/components/ballmac/templates/goods/goods-fonts"
import { cn } from "@/lib/utils"

type GoodsPage = "home" | "shop" | "product" | "cart" | "checkout"
type GoodsHrefs = Record<GoodsPage, string>

const defaultHrefs: GoodsHrefs = { home: "/goods", shop: "/goods/shop", product: "/goods/shop/morning-mug", cart: "/goods/cart", checkout: "/goods/checkout" }

/** Kiln & Co's palette: oat paper, warm brown ink and five glazes. Dark mode is a studio at night with the kiln still glowing. */
const goodsCss = `
.goods-theme,body:has(.goods-theme){--background:oklch(0.968 0.02 85);--foreground:oklch(0.26 0.04 50);--card:oklch(0.985 0.012 85);--card-foreground:oklch(0.26 0.04 50);--popover:oklch(0.985 0.012 85);--popover-foreground:oklch(0.26 0.04 50);--primary:oklch(0.32 0.05 45);--primary-foreground:oklch(0.968 0.02 85);--secondary:oklch(0.93 0.03 80);--secondary-foreground:oklch(0.26 0.04 50);--muted:oklch(0.935 0.028 80);--muted-foreground:oklch(0.46 0.04 55);--accent:oklch(0.92 0.04 75);--accent-foreground:oklch(0.26 0.04 50);--border:oklch(0.26 0.04 50 / 14%);--input:oklch(0.26 0.04 50 / 22%);--ring:oklch(0.55 0.14 45);--surface:oklch(0.95 0.025 82);--destructive:oklch(0.52 0.21 27);--chart-1:oklch(0.62 0.14 42);--chart-2:oklch(0.68 0.07 150);--chart-3:oklch(0.8 0.13 88);--chart-4:oklch(0.55 0.06 240);--chart-5:oklch(0.82 0.07 25);--goods-wall:oklch(0.9 0.035 78);--goods-wall-2:oklch(0.82 0.045 70);--goods-on-clay:oklch(0.2 0.04 50);--radius:1rem}
.dark .goods-theme,.dark body:has(.goods-theme){--background:oklch(0.19 0.02 50);--foreground:oklch(0.95 0.02 80);--card:oklch(0.23 0.022 50);--card-foreground:oklch(0.95 0.02 80);--popover:oklch(0.25 0.024 50);--popover-foreground:oklch(0.95 0.02 80);--primary:oklch(0.88 0.06 75);--primary-foreground:oklch(0.22 0.03 50);--secondary:oklch(0.28 0.025 50);--secondary-foreground:oklch(0.95 0.02 80);--muted:oklch(0.27 0.025 50);--muted-foreground:oklch(0.74 0.04 70);--accent:oklch(0.31 0.03 50);--accent-foreground:oklch(0.95 0.02 80);--border:oklch(1 0 0 / 11%);--input:oklch(1 0 0 / 16%);--ring:oklch(0.75 0.13 50);--surface:oklch(0.21 0.022 50);--destructive:oklch(0.7 0.19 27);--chart-1:oklch(0.7 0.14 45);--chart-2:oklch(0.74 0.08 150);--chart-3:oklch(0.84 0.12 88);--chart-4:oklch(0.68 0.08 240);--chart-5:oklch(0.8 0.08 25);--goods-wall:oklch(0.3 0.03 55);--goods-wall-2:oklch(0.26 0.03 50)}
body:has(.goods-theme){font-family:var(--goods-sans),ui-sans-serif,system-ui,sans-serif}
`

const serif = "[font-family:var(--goods-serif),ui-serif,Georgia,serif] font-medium tracking-[-0.02em]"
const onClay = "text-[var(--goods-on-clay)]"

/**
 * A piece of ceramics drawn in CSS: a mug, bowl, vase, plate, pitcher or cup in one of five glazes, on a wall.
 * `view` changes the composition (front, close, pair, dark wall) so a gallery has something to switch between.
 */
function Piece({ shape, glaze = 0, view = 0, className }: { shape: Shape; glaze?: number; view?: number; className?: string }) {
  const gl = glazes[glaze % glazes.length]!
  const g = gl.cls
  const shine = "bg-gradient-to-br from-white/35 via-transparent to-black/25"
  const wall = view === 3 ? "bg-[var(--goods-wall-2)]" : "bg-[var(--goods-wall)]"
  const body = (cls: string, extra?: React.ReactNode) => (
    <div className={cn("absolute overflow-hidden", g, cls)}>
      <div className={cn("absolute inset-0 rounded-[inherit]", shine)} />
      {extra}
    </div>
  )
  const art: Record<Shape, React.ReactNode> = {
    mug: (<>
      <div className={cn("absolute top-[40%] left-[54%] aspect-square w-[22%] rounded-full border-[7px] border-solid bg-transparent", gl.border)} />
      {body("top-[34%] left-[28%] h-[34%] w-[38%] rounded-t-md rounded-b-[26%]", <div className="absolute inset-x-0 top-0 h-[10%] rounded-t-md bg-black/20" />)}
    </>),
    cup: (<>
      {body("top-[40%] left-[30%] h-[28%] w-[40%] rounded-t-sm rounded-b-[45%]", <div className="absolute inset-x-0 top-0 h-[12%] rounded-t-sm bg-black/20" />)}
    </>),
    bowl: (<>
      {body("top-[42%] left-[16%] h-[28%] w-[68%] rounded-t-md rounded-b-full", <div className="absolute inset-x-0 top-0 h-[14%] rounded-t-md bg-black/20" />)}
    </>),
    vase: (<>
      {body("top-[16%] left-[43%] h-[16%] w-[14%] rounded-t-md", <div className="absolute inset-x-0 top-0 h-[16%] bg-black/25" />)}
      {body("top-[28%] left-[27%] h-[44%] w-[46%] rounded-[50%_50%_30%_30%/45%_45%_22%_22%]")}
    </>),
    plate: (<>
      {body("top-[52%] left-[10%] h-[10%] w-[80%] rounded-[50%]")}
      <div className="absolute top-[53.5%] left-[18%] h-[5%] w-[64%] rounded-[50%] bg-black/15" />
    </>),
    pitcher: (<>
      <div className={cn("absolute top-[36%] left-[56%] aspect-square w-[20%] rounded-full border-[7px] bg-transparent", gl.border)} />
      {body("top-[28%] left-[26%] h-[44%] w-[40%] rounded-[30%_30%_26%_26%/20%_20%_22%_22%]", <div className="absolute inset-x-0 top-0 h-[8%] rounded-t-[30%] bg-black/20" />)}
      {body("top-[28%] left-[18%] h-[8%] w-[14%] -rotate-[28deg] rounded-md")}
    </>),
  }
  const ground = shape === "plate" ? "top-[60%]" : shape === "vase" ? "top-[70%]" : shape === "bowl" ? "top-[68%]" : "top-[66%]"
  return (
    <div aria-hidden="true" className={cn("relative isolate aspect-[4/5] w-full overflow-hidden", wall, className)}>
      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-black/[0.06]" />
      <div className={cn("absolute left-1/2 h-[4%] w-[52%] -translate-x-1/2 rounded-[50%] bg-black/20 blur-[3px]", ground)} style={{ top: shape === "plate" ? "62%" : undefined }} />
      <div className="absolute inset-0 origin-center" style={{ transform: view === 1 ? "scale(1.25) translateY(2%)" : view === 2 ? "scale(0.82) translateX(-14%)" : undefined }}>{art[shape]}</div>
      {view === 2 && (
        <div className="absolute inset-0 origin-center" style={{ transform: "scale(0.6) translate(48%, 14%)" }}>{art[shape === "mug" ? "cup" : shape === "bowl" ? "plate" : "mug"]}</div>
      )}
    </div>
  )
}

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span role="img" aria-label={`${value} out of 5 stars`} className={cn("inline-flex gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} aria-hidden="true" className={cn("size-4", i <= Math.round(value) ? "fill-chart-3 stroke-chart-3" : "stroke-muted-foreground")} />)}
    </span>
  )
}

const links: { key: GoodsPage; label: string }[] = [{ key: "shop", label: "Shop" }, { key: "home", label: "Our story" }]

type GoodsShellProps = React.ComponentProps<"div"> & {
  /** The page being shown, so its nav link is marked current. */
  page: GoodsPage
  /** Override where pages live (used by previews). */
  hrefs?: Partial<GoodsHrefs>
}

/** Kiln & Co's frame: an announcement bar, a header with the bag and a drawer that shows what you have picked. */
function GoodsShell({ page, hrefs: overrides, className, style, children, ...props }: GoodsShellProps) {
  const hrefs = { ...defaultHrefs, ...overrides }
  const [menu, setMenu] = React.useState(false)
  const [bag, setBag] = React.useState(false)
  const { lines, count, subtotal } = useCart()
  React.useEffect(() => {
    const classes = [goodsSerif.variable, goodsSans.variable].filter(Boolean)
    document.body.classList.add(...classes)
    return () => document.body.classList.remove(...classes)
  }, [])
  const left = Math.max(0, FREE_SHIPPING - subtotal)
  return (
    <div
      data-slot="goods"
      className={cn("goods-theme bg-background text-foreground relative min-h-dvh overflow-x-clip", goodsSerif.variable, goodsSans.variable, className)}
      style={{ fontFamily: "var(--goods-sans), ui-sans-serif, system-ui, sans-serif", ...style }}
      {...props}
    >
      <style>{goodsCss}</style>
      <p className="bg-primary text-primary-foreground px-4 py-2 text-center text-sm font-medium">Free shipping on orders over {money(FREE_SHIPPING)} · Made in small batches, shipped in two days</p>
      <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links.map((l) => <a key={l.label} href={hrefs[l.key]} aria-current={page === l.key || (l.key === "shop" && page === "product") ? "page" : undefined} className="hover:bg-accent aria-[current=page]:bg-accent focus-visible:ring-ring/50 rounded-full px-4 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px] motion-reduce:transition-none">{l.label}</a>)}
          </nav>
          <button type="button" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="goods-mobile-menu" onClick={() => setMenu((v) => !v)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] md:hidden">{menu ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}</button>
          <a href={hrefs.home} className={cn("focus-visible:ring-ring/50 justify-self-center rounded-lg px-2 text-2xl outline-none focus-visible:ring-[3px]", serif)}>Kiln <span className="text-chart-1">&amp;</span> Co</a>
          <div className="flex justify-end">
            <button type="button" onClick={() => setBag(true)} aria-label={`Open your bag, ${count} ${count === 1 ? "item" : "items"}`} className="hover:bg-accent focus-visible:ring-ring/50 relative inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold outline-none focus-visible:ring-[3px]">
              <ShoppingBag className="size-5" aria-hidden="true" /><span className="hidden sm:inline">Bag</span>
              <span aria-hidden="true" className={cn("bg-chart-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums", onClay)}>{count}</span>
            </button>
          </div>
        </div>
        {menu && <nav id="goods-mobile-menu" aria-label="Mobile" className="px-4 pb-4 md:hidden">{links.map((l) => <a key={l.label} href={hrefs[l.key]} className="hover:bg-accent block rounded-2xl px-4 py-3 text-lg font-semibold">{l.label}</a>)}</nav>}
      </header>

      <Sheet open={bag} onOpenChange={setBag}>
        <SheetContent side="right" className="goods-theme bg-background flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b p-5 text-left"><SheetTitle className={cn("text-2xl", serif)}>Your bag</SheetTitle><SheetDescription>{count === 0 ? "Nothing in here yet." : `${count} ${count === 1 ? "piece" : "pieces"} picked out.`}</SheetDescription></SheetHeader>
          <div className="flex-1 overflow-y-auto p-5">
            {lines.length === 0 ? (
              <div className="grid h-full place-items-center text-center"><div><ShoppingBag className="text-muted-foreground mx-auto size-10" aria-hidden="true" /><p className={cn("mt-4 text-2xl", serif)}>Your bag is empty.</p><a href={hrefs.shop} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mt-5 inline-flex h-11 items-center rounded-full px-6 font-semibold outline-none focus-visible:ring-[3px]">Browse the shop</a></div></div>
            ) : (
              <ul className="grid gap-5">
                {lines.map((l) => (
                  <li key={l.id + l.glaze} className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4">
                    <Piece shape={l.product.shape} glaze={l.glaze} className="rounded-xl" />
                    <div className="min-w-0">
                      <p className="font-semibold">{l.product.name}</p>
                      <p className="text-muted-foreground text-sm">{glazes[l.glaze]!.name} · {money(l.product.price)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div role="group" aria-label={`Quantity of ${l.product.name}`} className="flex items-center rounded-full border">
                          <button type="button" aria-label={`Fewer ${l.product.name}`} onClick={() => cart.setQty(l.id, l.glaze, l.qty - 1)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-[3px]"><Minus className="size-4" aria-hidden="true" /></button>
                          <span className="w-7 text-center text-sm font-semibold tabular-nums">{l.qty}</span>
                          <button type="button" aria-label={`More ${l.product.name}`} onClick={() => cart.setQty(l.id, l.glaze, l.qty + 1)} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-[3px]"><Plus className="size-4" aria-hidden="true" /></button>
                        </div>
                        <button type="button" onClick={() => cart.remove(l.id, l.glaze)} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded text-sm underline underline-offset-4 outline-none focus-visible:ring-[3px]">Remove</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {lines.length > 0 && (
            <div className="grid gap-3 border-t p-5">
              <p className="text-muted-foreground text-sm">{left > 0 ? `${money(left)} away from free shipping.` : "You have free shipping."}</p>
              <p className="flex justify-between text-lg font-semibold"><span>Subtotal</span><span className="tabular-nums">{money(subtotal)}</span></p>
              <a href={hrefs.checkout} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex h-12 items-center justify-center rounded-full font-bold outline-none focus-visible:ring-[3px]">Checkout</a>
              <a href={hrefs.cart} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex h-11 items-center justify-center rounded-full border font-semibold outline-none focus-visible:ring-[3px]">View full bag</a>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {children}

      <footer className="bg-primary text-primary-foreground mt-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div><p className={cn("text-3xl", serif)}>Kiln &amp; Co</p><p className="mt-3 max-w-xs text-pretty">Everyday ceramics, thrown by hand in a shed in Bristol and fired in batches of forty.</p></div>
          {[["Shop", [["Mugs", hrefs.shop], ["Bowls", hrefs.shop], ["Vases", hrefs.shop], ["Plates", hrefs.shop]]], ["Help", [["Shipping", hrefs.cart], ["Returns", hrefs.cart], ["Care guide", hrefs.product], ["Contact", hrefs.home]]], ["Studio", [["Our story", hrefs.home], ["Visit", hrefs.home], ["Wholesale", hrefs.home]]]].map(([t, items]) => (
            <div key={t as string}><h2 className="text-xs font-bold tracking-[0.14em] uppercase">{t as string}</h2><ul className="mt-4 grid gap-2.5">{(items as string[][]).map(([l, h]) => <li key={l}><a href={h} className="hover:underline">{l}</a></li>)}</ul></div>
          ))}
        </div>
        <p className="mx-auto max-w-7xl border-t border-current/20 px-4 py-5 text-xs sm:px-6">© 2026 Kiln &amp; Co. Every imperfection is deliberate.</p>
      </footer>
    </div>
  )
}

export { GoodsShell, Piece, Stars, defaultHrefs as goodsDefaultHrefs, onClay as goodsOnClay, serif as goodsSerifClass, type GoodsHrefs, type GoodsPage, type GoodsShellProps }
