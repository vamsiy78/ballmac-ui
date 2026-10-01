// Ballmac UI: Summit tickets page. https://ui.ballmac.com/templates/template-summit
"use client"

import * as React from "react"
import { Check, Minus, PartyPopper, Plus } from "lucide-react"

import { faqs, tiers } from "@/components/ballmac/templates/summit/summit-data"
import { SummitShell, summitDisplayClass, summitOnSun, type SummitHrefs } from "@/components/ballmac/templates/summit/summit-theme"
import { cn } from "@/lib/utils"

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
const field = "bg-background focus-visible:ring-ring/50 aria-invalid:border-destructive h-12 w-full rounded-xl border px-4 outline-none focus-visible:ring-[3px]"

type SummitTicketsProps = React.ComponentProps<"div"> & { hrefs?: Partial<SummitHrefs> }

/** Tickets: pick a tier and a quantity, see a live total with group and promo discounts, then a validated checkout form. */
function SummitTickets({ hrefs, ...props }: SummitTicketsProps) {
  const [tier, setTier] = React.useState("early")
  const [qty, setQty] = React.useState(1)
  const [promo, setPromo] = React.useState("")
  const [promoState, setPromoState] = React.useState<"idle" | "ok" | "bad">("idle")
  const [form, setForm] = React.useState({ name: "", email: "", company: "" })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [done, setDone] = React.useState(false)
  const errorRef = React.useRef<HTMLFormElement>(null)

  const t = tiers.find((x) => x.id === tier)!
  const subtotal = t.price * qty
  const group = qty >= 5 ? subtotal * 0.15 : 0
  const code = promoState === "ok" ? (subtotal - group) * 0.1 : 0
  const total = subtotal - group - code

  function applyPromo(e: React.FormEvent) {
    e.preventDefault()
    setPromoState(promo.trim().toUpperCase() === "NORTH10" ? "ok" : "bad")
  }
  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = "Tell us who the ticket is for."
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter an email like you@example.com."
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) return void errorRef.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus()
    setDone(true)
  }
  const bind = (k: keyof typeof form) => ({ name: k, value: form[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value })), "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `st-err-${k}` : undefined })

  return (
    <SummitShell page="tickets" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
        <h1 className={cn("text-[clamp(2.8rem,9vw,7rem)] leading-[0.95]", summitDisplayClass)}>Tickets</h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-xl text-pretty">One ticket covers both days and every room. Buy five or more and take 15% off automatically.</p>

        {done ? (
          <section aria-labelledby="st-done" className="bg-chart-2/25 mt-10 rounded-[2rem] border p-8 text-center sm:p-14">
            <PartyPopper className="mx-auto size-10" aria-hidden="true" />
            <h2 id="st-done" className={cn("mt-4 text-3xl sm:text-5xl", summitDisplayClass)}>You are going, {form.name.split(" ")[0]}.</h2>
            <p role="status" className="mx-auto mt-4 max-w-md text-lg text-pretty">{qty} × {t.name} for {money(total)}. A receipt and your ticket{qty > 1 ? "s are" : " is"} on the way to {form.email}.</p>
            <button type="button" onClick={() => { setDone(false); setForm({ name: "", email: "", company: "" }) }} className="hover:bg-accent focus-visible:ring-ring/50 mt-8 h-12 rounded-full border-2 px-6 font-bold outline-none focus-visible:ring-[3px]">Buy more tickets</button>
          </section>
        ) : (
          <div className="mt-10 grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="grid gap-8">
              <fieldset>
                <legend className={cn("mb-4 text-2xl", summitDisplayClass)}>1. Choose a ticket</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tiers.map((x) => (
                    <label key={x.id} className={cn("bg-card focus-within:ring-ring/50 relative flex cursor-pointer flex-col rounded-3xl border-2 p-6 transition-colors focus-within:ring-[3px] motion-reduce:transition-none", tier === x.id ? "border-primary bg-accent/40" : "hover:border-primary/40")}>
                      <input type="radio" name="tier" value={x.id} checked={tier === x.id} onChange={() => setTier(x.id)} className="sr-only" />
                      {x.badge && <span className={cn("bg-chart-2 absolute -top-3 left-6 rounded-full px-3 py-0.5 text-xs font-bold", summitOnSun)}>{x.badge}</span>}
                      <span className="flex items-baseline justify-between gap-2"><span className="text-lg font-bold">{x.name}</span><span className={cn("text-3xl tabular-nums", summitDisplayClass)}>${x.price}</span></span>
                      <span className="text-muted-foreground mt-1 text-sm">{x.blurb}</span>
                      <ul className="mt-4 grid gap-1.5 text-sm">{x.perks.map((p) => <li key={p} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{p}</li>)}</ul>
                    </label>
                  ))}
                </div>
              </fieldset>

              <form ref={errorRef} onSubmit={submit} noValidate aria-labelledby="st-details" className="bg-card grid gap-5 rounded-3xl border p-6 sm:p-8">
                <h2 id="st-details" className={cn("text-2xl", summitDisplayClass)}>2. Your details</h2>
                <div className="grid gap-2"><label htmlFor="st-name" className="text-sm font-semibold">Full name</label><input id="st-name" autoComplete="name" className={field} {...bind("name")} />{errors.name && <p id="st-err-name" role="alert" className="text-destructive text-sm">{errors.name}</p>}</div>
                <div className="grid gap-2"><label htmlFor="st-email" className="text-sm font-semibold">Email for the receipt</label><input id="st-email" type="email" autoComplete="email" className={field} {...bind("email")} />{errors.email && <p id="st-err-email" role="alert" className="text-destructive text-sm">{errors.email}</p>}</div>
                <div className="grid gap-2"><label htmlFor="st-company" className="text-sm font-semibold">Company <span className="text-muted-foreground font-normal">(optional)</span></label><input id="st-company" autoComplete="organization" className={field} {...bind("company")} /></div>
                <button type="submit" className="bg-primary text-primary-foreground focus-visible:ring-ring/50 h-14 rounded-full text-lg font-bold outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px]">Pay {money(total)}</button>
                <p className="text-muted-foreground text-center text-xs">Demo checkout: no card is taken. Refundable until 30 days before.</p>
              </form>
            </div>

            <aside aria-labelledby="st-sum" className="bg-surface rounded-3xl border p-6 lg:sticky lg:top-24">
              <h2 id="st-sum" className={cn("text-2xl", summitDisplayClass)}>Your order</h2>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="font-semibold">{t.name}</span>
                <div className="flex items-center gap-1 rounded-full border bg-card" role="group" aria-label="Number of tickets">
                  <button type="button" aria-label="Fewer tickets" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] disabled:opacity-50"><Minus className="size-4" aria-hidden="true" /></button>
                  <output aria-live="polite" className="w-8 text-center font-bold tabular-nums">{qty}</output>
                  <button type="button" aria-label="More tickets" disabled={qty >= 20} onClick={() => setQty((q) => Math.min(20, q + 1))} className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] disabled:opacity-50"><Plus className="size-4" aria-hidden="true" /></button>
                </div>
              </div>
              <form onSubmit={applyPromo} className="mt-5 flex gap-2">
                <label htmlFor="st-promo" className="sr-only">Promo code</label>
                <input id="st-promo" value={promo} onChange={(e) => { setPromo(e.target.value); setPromoState("idle") }} placeholder="Promo code" aria-describedby="st-promo-msg" className="bg-background focus-visible:ring-ring/50 h-11 min-w-0 flex-1 rounded-xl border px-3 text-sm outline-none focus-visible:ring-[3px]" />
                <button type="submit" className="hover:bg-accent focus-visible:ring-ring/50 h-11 rounded-xl border px-4 text-sm font-bold outline-none focus-visible:ring-[3px]">Apply</button>
              </form>
              <p id="st-promo-msg" role="status" className={cn("mt-2 min-h-5 text-sm", promoState === "bad" && "text-destructive")}>{promoState === "ok" ? "NORTH10 applied: 10% off." : promoState === "bad" ? "That code is not valid. Try NORTH10." : ""}</p>
              <dl className="mt-3 grid gap-2 border-t pt-4 text-sm">
                <div className="flex justify-between"><dt>{qty} × {t.name}</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
                {group > 0 && <div className="flex justify-between"><dt>Group discount (15%)</dt><dd className="tabular-nums">−{money(group)}</dd></div>}
                {code > 0 && <div className="flex justify-between"><dt>Promo NORTH10</dt><dd className="tabular-nums">−{money(code)}</dd></div>}
                <div className="flex justify-between border-t pt-3 text-lg font-bold"><dt>Total</dt><dd className="tabular-nums">{money(total)}</dd></div>
              </dl>
              {qty < 5 && <p className="text-muted-foreground mt-4 text-xs">Add {5 - qty} more {5 - qty === 1 ? "ticket" : "tickets"} for 15% off.</p>}
            </aside>
          </div>
        )}

        <section aria-labelledby="st-faq" className="mt-20 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <h2 id="st-faq" className={cn("text-[clamp(2rem,5vw,3rem)] leading-none", summitDisplayClass)}>Before you buy</h2>
          <div className="divide-y border-y">{faqs.slice(2, 5).map((f) => <details key={f.q} className="group py-4"><summary className="focus-visible:ring-ring/50 cursor-pointer list-none rounded-md text-lg font-bold outline-none focus-visible:ring-[3px]">{f.q}</summary><p className="text-muted-foreground mt-2 text-pretty">{f.a}</p></details>)}</div>
        </section>
      </main>
    </SummitShell>
  )
}

export { SummitTickets, type SummitTicketsProps }
