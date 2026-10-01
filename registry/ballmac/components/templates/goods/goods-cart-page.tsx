// Ballmac UI: Goods bag page. https://ui.ballmac.com/templates/template-goods
"use client"

import * as React from "react"
import { Minus, Plus, ShoppingBag, Truck } from "lucide-react"

import { Progress } from "@/components/ballmac/progress"
import { cart, promo, useCart, usePromo } from "@/components/ballmac/templates/goods/goods-cart"
import { FREE_SHIPPING, PROMO, glazes, money } from "@/components/ballmac/templates/goods/goods-data"
import { GoodsShell, Piece, goodsSerifClass, type GoodsHrefs } from "@/components/ballmac/templates/goods/goods-theme"
import { cn } from "@/lib/utils"

/** Puts two pieces in an empty bag once, so previews and screenshots show a full page. Not used by the installed route. */
function useDemoBag(on: boolean) {
  React.useEffect(() => {
    if (!on) return
    if (typeof window !== "undefined" && window.sessionStorage.getItem("kiln-bag") === null) {
      cart.add("morning-mug", 0, 2)
      cart.add("noodle-bowl", 2, 1)
    }
  }, [on])
}

type GoodsCartPageProps = React.ComponentProps<"div"> & { hrefs?: Partial<GoodsHrefs>; demo?: boolean }

/** The bag page: quantities, a free-shipping meter, a promo code and a summary that updates as you change things. */
function GoodsCartPage({ hrefs, demo = false, ...props }: GoodsCartPageProps) {
  const link = { shop: "/goods/shop", checkout: "/goods/checkout", product: "/goods/shop/morning-mug", ...hrefs }
  useDemoBag(demo)
  const { lines, count, subtotal } = useCart()
  const promoOn = usePromo()
  const [code, setCode] = React.useState("")
  const [bad, setBad] = React.useState(false)
  const discount = promoOn ? subtotal * PROMO.rate : 0
  const after = subtotal - discount
  const shipping = after === 0 || after >= FREE_SHIPPING ? 0 : 6
  const total = after + shipping
  const left = Math.max(0, FREE_SHIPPING - after)
  function apply(e: React.FormEvent) {
    e.preventDefault()
    const ok = code.trim().toUpperCase() === PROMO.code
    setBad(!ok)
    if (ok) promo.set(true)
  }
  const step = "hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-[3px]"
  return (
    <GoodsShell page="cart" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6">
        <h1 className={cn("text-[clamp(3rem,8vw,5.5rem)] leading-none", goodsSerifClass)}>Your bag</h1>
        {lines.length === 0 ? (
          <div className="bg-surface mt-10 rounded-[2rem] border px-6 py-20 text-center"><ShoppingBag className="text-muted-foreground mx-auto size-12" aria-hidden="true" /><p className={cn("mt-5 text-3xl", goodsSerifClass)}>Nothing in your bag yet.</p><p className="text-muted-foreground mt-2">Pieces you add will wait here for you.</p><a href={link.shop} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mt-8 inline-flex h-12 items-center rounded-full px-8 font-bold outline-none focus-visible:ring-[3px]">Browse the shop</a></div>
        ) : (
          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div>
              <div className="bg-secondary rounded-2xl p-4">
                <p className="flex items-center gap-2 text-sm font-semibold"><Truck className="size-4" aria-hidden="true" />{left > 0 ? `${money(left)} away from free shipping` : "You have free shipping"}</p>
                <Progress className="mt-3" value={Math.min(100, (after / FREE_SHIPPING) * 100)} aria-label="Progress to free shipping" />
              </div>
              <ul className="mt-2 divide-y">
                {lines.map((l) => (
                  <li key={l.id + l.glaze} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-5 py-6 sm:grid-cols-[7rem_minmax(0,1fr)_auto]">
                    <a href={link.product} aria-label={l.product.name}><Piece shape={l.product.shape} glaze={l.glaze} className="rounded-2xl" /></a>
                    <div className="min-w-0">
                      <h2 className={cn("text-2xl", goodsSerifClass)}>{l.product.name}</h2>
                      <p className="text-muted-foreground text-sm">{glazes[l.glaze]!.name} · {l.product.size}</p>
                      <div className="mt-4 flex items-center gap-4">
                        <div role="group" aria-label={`Quantity of ${l.product.name}`} className="flex items-center rounded-full border">
                          <button type="button" aria-label={`Fewer ${l.product.name}`} onClick={() => cart.setQty(l.id, l.glaze, l.qty - 1)} className={step}><Minus className="size-4" aria-hidden="true" /></button>
                          <span className="w-8 text-center font-semibold tabular-nums">{l.qty}</span>
                          <button type="button" aria-label={`More ${l.product.name}`} onClick={() => cart.setQty(l.id, l.glaze, l.qty + 1)} className={step}><Plus className="size-4" aria-hidden="true" /></button>
                        </div>
                        <button type="button" onClick={() => cart.remove(l.id, l.glaze)} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded text-sm underline underline-offset-4 outline-none focus-visible:ring-[3px]">Remove</button>
                      </div>
                    </div>
                    <p className="col-start-2 text-lg font-semibold tabular-nums sm:col-start-auto">{money(l.product.price * l.qty)}</p>
                  </li>
                ))}
              </ul>
            </div>
            <aside aria-labelledby="gc-sum" className="bg-card rounded-3xl border p-6 lg:sticky lg:top-24">
              <h2 id="gc-sum" className={cn("text-2xl", goodsSerifClass)}>Summary</h2>
              <form onSubmit={apply} className="mt-5 flex gap-2">
                <label htmlFor="gc-code" className="sr-only">Promo code</label>
                <input id="gc-code" value={code} onChange={(e) => { setCode(e.target.value); setBad(false) }} placeholder="Promo code" aria-describedby="gc-code-msg" className="bg-background focus-visible:ring-ring/50 h-11 min-w-0 flex-1 rounded-full border px-4 text-sm outline-none focus-visible:ring-[3px]" />
                <button type="submit" className="hover:bg-accent focus-visible:ring-ring/50 h-11 rounded-full border px-5 text-sm font-bold outline-none focus-visible:ring-[3px]">Apply</button>
              </form>
              <p id="gc-code-msg" role="status" className={cn("mt-2 min-h-5 text-sm", bad && "text-destructive")}>{promoOn ? `${PROMO.code} applied: 10% off.` : bad ? `That code is not valid. Try ${PROMO.code}.` : ""}</p>
              <dl className="mt-3 grid gap-2 border-t pt-4 text-sm">
                <div className="flex justify-between"><dt>Subtotal ({count})</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
                {discount > 0 && <div className="flex justify-between"><dt>Promo {PROMO.code}</dt><dd className="tabular-nums">−{money(discount)}</dd></div>}
                <div className="flex justify-between"><dt>Shipping</dt><dd className="tabular-nums">{shipping === 0 ? "Free" : money(shipping)}</dd></div>
                <div className="flex justify-between border-t pt-3 text-lg font-bold"><dt>Total</dt><dd className="tabular-nums">{money(total)}</dd></div>
              </dl>
              <a href={link.checkout} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mt-6 flex h-14 items-center justify-center rounded-full text-lg font-bold outline-none focus-visible:ring-[3px]">Checkout</a>
              <a href={link.shop} className="mt-3 block text-center text-sm font-semibold underline underline-offset-4">Keep shopping</a>
            </aside>
          </div>
        )}
      </main>
    </GoodsShell>
  )
}

export { GoodsCartPage, useDemoBag, type GoodsCartPageProps }
