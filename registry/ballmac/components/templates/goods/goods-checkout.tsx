// Ballmac UI: Goods checkout page. https://ui.ballmac.com/templates/template-goods
"use client"

import * as React from "react"
import { Check, Lock } from "lucide-react"

import { cart, useCart, usePromo } from "@/components/ballmac/templates/goods/goods-cart"
import { useDemoBag } from "@/components/ballmac/templates/goods/goods-cart-page"
import { FREE_SHIPPING, PROMO, glazes, money } from "@/components/ballmac/templates/goods/goods-data"
import { GoodsShell, Piece, goodsSerifClass, type GoodsHrefs } from "@/components/ballmac/templates/goods/goods-theme"
import { cn } from "@/lib/utils"

const methods = [["standard", "Standard", "2 to 3 working days", 6], ["express", "Express", "Next working day", 12]] as const
const field = "bg-background focus-visible:ring-ring/50 aria-invalid:border-destructive h-12 w-full rounded-xl border px-4 outline-none focus-visible:ring-[3px]"
type Values = { email: string; name: string; address: string; city: string; postcode: string; card: string; expiry: string; cvc: string }
const empty: Values = { email: "", name: "", address: "", city: "", postcode: "", card: "", expiry: "", cvc: "" }

type GoodsCheckoutProps = React.ComponentProps<"div"> & { hrefs?: Partial<GoodsHrefs>; demo?: boolean }

/** Checkout: contact, delivery, a demo card form that formats as you type, a live summary and a thank-you page. */
function GoodsCheckout({ hrefs, demo = false, ...props }: GoodsCheckoutProps) {
  const link = { shop: "/goods/shop", cart: "/goods/cart", ...hrefs }
  useDemoBag(demo)
  const { lines, subtotal } = useCart()
  const promoOn = usePromo()
  const [v, setV] = React.useState<Values>(empty)
  const [method, setMethod] = React.useState<(typeof methods)[number][0]>("standard")
  const [errors, setErrors] = React.useState<Partial<Record<keyof Values, string>>>({})
  const [order, setOrder] = React.useState<{ number: string; total: number; email: string } | null>(null)
  const form = React.useRef<HTMLFormElement>(null)

  const after = subtotal * (promoOn ? 1 - PROMO.rate : 1)
  const base = methods.find((m) => m[0] === method)!
  const shipping = lines.length === 0 ? 0 : method === "standard" && after >= FREE_SHIPPING ? 0 : base[3]
  const total = after + shipping

  const set = (k: keyof Values, format?: (s: string) => string) => ({
    id: `gk-${k}`, name: k, value: v[k], "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `gk-err-${k}` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: format ? format(e.target.value) : e.target.value })),
  })
  const err = (k: keyof Values) => (errors[k] ? <p id={`gk-err-${k}`} role="alert" className="text-destructive text-sm">{errors[k]}</p> : null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: Partial<Record<keyof Values, string>> = {}
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) next.email = "Enter an email like you@example.com."
    if (!v.name.trim()) next.name = "We need a name for the parcel."
    if (!v.address.trim()) next.address = "Enter a street address."
    if (!v.city.trim()) next.city = "Enter a town or city."
    if (v.postcode.trim().length < 5) next.postcode = "Enter a full postcode."
    if (v.card.replace(/\s/g, "").length < 16) next.card = "Enter all 16 digits."
    if (!/^\d{2}\/\d{2}$/.test(v.expiry)) next.expiry = "Use MM/YY."
    if (v.cvc.length < 3) next.cvc = "3 digits."
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) return void form.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus()
    setOrder({ number: "KC-48213", total, email: v.email.trim() })
    cart.clear()
  }

  return (
    <GoodsShell page="checkout" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6">
        {order ? (
          <section aria-labelledby="gk-done" className="bg-chart-2/25 mx-auto max-w-2xl rounded-[2rem] border px-6 py-16 text-center sm:px-12">
            <span className="bg-primary text-primary-foreground mx-auto flex size-14 items-center justify-center rounded-full"><Check className="size-7" aria-hidden="true" /></span>
            <h1 id="gk-done" className={cn("mt-6 text-5xl", goodsSerifClass)}>Thank you.</h1>
            <p role="status" className="mt-4 text-lg text-pretty">Order {order.number} is confirmed. A receipt for {money(order.total)} is on its way to {order.email}, and your pieces will leave the studio in two working days.</p>
            <a href={link.shop} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mt-8 inline-flex h-12 items-center rounded-full px-8 font-bold outline-none focus-visible:ring-[3px]">Back to the shop</a>
          </section>
        ) : lines.length === 0 ? (
          <div className="bg-surface mx-auto max-w-2xl rounded-[2rem] border px-6 py-20 text-center"><h1 className={cn("text-4xl", goodsSerifClass)}>Your bag is empty.</h1><p className="text-muted-foreground mt-2">Add a piece before you check out.</p><a href={link.shop} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 mt-8 inline-flex h-12 items-center rounded-full px-8 font-bold outline-none focus-visible:ring-[3px]">Browse the shop</a></div>
        ) : (
          <>
            <h1 className={cn("text-[clamp(3rem,8vw,5rem)] leading-none", goodsSerifClass)}>Checkout</h1>
            <div className="mt-8 grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
              <form ref={form} onSubmit={submit} noValidate className="grid gap-10">
                <section aria-labelledby="gk-contact" className="grid gap-4"><h2 id="gk-contact" className={cn("text-2xl", goodsSerifClass)}>Contact</h2>
                  <div className="grid gap-2"><label htmlFor="gk-email" className="text-sm font-semibold">Email</label><input type="email" autoComplete="email" className={field} {...set("email")} />{err("email")}</div></section>
                <section aria-labelledby="gk-ship" className="grid gap-4"><h2 id="gk-ship" className={cn("text-2xl", goodsSerifClass)}>Delivery address</h2>
                  <div className="grid gap-2"><label htmlFor="gk-name" className="text-sm font-semibold">Full name</label><input autoComplete="name" className={field} {...set("name")} />{err("name")}</div>
                  <div className="grid gap-2"><label htmlFor="gk-address" className="text-sm font-semibold">Address</label><input autoComplete="street-address" className={field} {...set("address")} />{err("address")}</div>
                  <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><label htmlFor="gk-city" className="text-sm font-semibold">Town or city</label><input autoComplete="address-level2" className={field} {...set("city")} />{err("city")}</div><div className="grid gap-2"><label htmlFor="gk-postcode" className="text-sm font-semibold">Postcode</label><input autoComplete="postal-code" className={field} {...set("postcode", (s) => s.toUpperCase())} />{err("postcode")}</div></div></section>
                <fieldset className="grid gap-3"><legend className={cn("mb-1 text-2xl", goodsSerifClass)}>Delivery method</legend>
                  {methods.map(([id, label, note, price]) => <label key={id} className={cn("bg-card focus-within:ring-ring/50 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 p-4 focus-within:ring-[3px]", method === id ? "border-primary" : "hover:border-primary/40")}><input type="radio" name="method" value={id} checked={method === id} onChange={() => setMethod(id)} className="sr-only" /><span><span className="block font-bold">{label}</span><span className="text-muted-foreground text-sm">{note}</span></span><span className="font-semibold tabular-nums">{id === "standard" && after >= FREE_SHIPPING ? "Free" : money(price)}</span></label>)}</fieldset>
                <section aria-labelledby="gk-pay" className="grid gap-4"><h2 id="gk-pay" className={cn("flex items-center gap-2 text-2xl", goodsSerifClass)}>Payment <Lock className="text-muted-foreground size-4" aria-hidden="true" /></h2>
                  <div className="grid gap-2"><label htmlFor="gk-card" className="text-sm font-semibold">Card number</label><input inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" className={field} {...set("card", (s) => s.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())} />{err("card")}</div>
                  <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><label htmlFor="gk-expiry" className="text-sm font-semibold">Expiry</label><input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" className={field} {...set("expiry", (s) => { const d = s.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d })} />{err("expiry")}</div><div className="grid gap-2"><label htmlFor="gk-cvc" className="text-sm font-semibold">Security code</label><input inputMode="numeric" autoComplete="cc-csc" placeholder="123" className={field} {...set("cvc", (s) => s.replace(/\D/g, "").slice(0, 4))} />{err("cvc")}</div></div></section>
                <div><button type="submit" className="bg-primary text-primary-foreground focus-visible:ring-ring/50 h-14 w-full rounded-full text-lg font-bold outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Pay {money(total)}</button><p className="text-muted-foreground mt-3 text-center text-xs">Demo checkout: no payment is taken.</p></div>
              </form>
              <aside aria-labelledby="gk-sum" className="bg-card rounded-3xl border p-6 lg:sticky lg:top-24">
                <h2 id="gk-sum" className={cn("text-2xl", goodsSerifClass)}>In your bag</h2>
                <ul className="mt-5 grid gap-4">{lines.map((l) => <li key={l.id + l.glaze} className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-3"><Piece shape={l.product.shape} glaze={l.glaze} className="rounded-lg" /><span className="min-w-0"><span className="block font-semibold">{l.product.name}</span><span className="text-muted-foreground text-sm">{glazes[l.glaze]!.name} × {l.qty}</span></span><span className="font-semibold tabular-nums">{money(l.product.price * l.qty)}</span></li>)}</ul>
                <dl className="mt-5 grid gap-2 border-t pt-4 text-sm">
                  <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
                  {promoOn && <div className="flex justify-between"><dt>Promo {PROMO.code}</dt><dd className="tabular-nums">−{money(subtotal * PROMO.rate)}</dd></div>}
                  <div className="flex justify-between"><dt>Shipping</dt><dd className="tabular-nums">{shipping === 0 ? "Free" : money(shipping)}</dd></div>
                  <div className="flex justify-between border-t pt-3 text-lg font-bold"><dt>Total</dt><dd className="tabular-nums">{money(total)}</dd></div>
                </dl>
                <a href={link.cart} className="mt-4 block text-center text-sm font-semibold underline underline-offset-4">Edit bag</a>
              </aside>
            </div>
          </>
        )}
      </main>
    </GoodsShell>
  )
}

export { GoodsCheckout, type GoodsCheckoutProps }
