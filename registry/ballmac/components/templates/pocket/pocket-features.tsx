// Ballmac UI: Pocket features page. https://ui.ballmac.com/templates/template-pocket
"use client"

import * as React from "react"
import { Send, Snowflake } from "lucide-react"

import { Slider } from "@/components/ballmac/slider"
import { Switch } from "@/components/ballmac/switch"
import { currencies, money } from "@/components/ballmac/templates/pocket/pocket-data"
import { PocketShell, pocketDisplayClass, type PocketHrefs } from "@/components/ballmac/templates/pocket/pocket-theme"
import { cn } from "@/lib/utils"

const bars = [["Food", 340, "bg-chart-1"], ["Travel", 215, "bg-chart-4"], ["Fun", 180, "bg-chart-5"], ["Home", 120, "bg-chart-2"]] as const
const people = [["Sam", "bg-chart-1", true], ["Ana", "bg-chart-4", true], ["Joe", "bg-chart-5", false], ["Mei", "bg-chart-2", false]] as const

type PocketFeaturesProps = React.ComponentProps<"div"> & { hrefs?: Partial<PocketHrefs> }

/** The features page: five live demos instead of five screenshots. Freeze a card, tune round-ups, split a bill, convert money. */
function PocketFeatures({ hrefs, ...props }: PocketFeaturesProps) {
  const [frozen, setFrozen] = React.useState(false)
  const [spend, setSpend] = React.useState(900)
  const [paid, setPaid] = React.useState<string[]>(["Sam", "Ana"])
  const [amount, setAmount] = React.useState("100")
  const [cur, setCur] = React.useState<(typeof currencies)[number][0]>("EUR")
  const savedPerMonth = Math.round(spend * 0.045)
  const rate = currencies.find((c) => c[0] === cur)!
  const converted = (Number(amount) || 0) * rate[1]
  const bill = 128
  const share = bill / people.length
  const total = bars.reduce((n, b) => n + b[1], 0)
  const card = "rounded-[2rem] border p-8 sm:p-10"
  return (
    <PocketShell page="features" hrefs={hrefs} {...props}>
      <main className="mx-auto max-w-6xl px-4 pt-14 pb-8 sm:px-6 sm:pt-20">
        <h1 className={cn("max-w-3xl text-[clamp(3rem,9vw,7rem)] leading-[0.9] text-balance", pocketDisplayClass)}>Try it right here.</h1>
        <p className="text-muted-foreground mt-5 max-w-xl text-xl font-medium text-pretty">Everything below works. Freeze the card, drag the slider, split the bill.</p>

        <div className="mt-14 grid gap-4 lg:grid-cols-6">
          <section aria-labelledby="pf-card" className={cn(card, "bg-[var(--pocket-navy)] text-[var(--pocket-on-navy)] lg:col-span-3")}>
            <h2 id="pf-card" className={cn("text-3xl", pocketDisplayClass)}>Freeze it in one tap</h2>
            <p className="mt-2 max-w-sm font-medium text-pretty">Lost it? Misplaced it? Stop every payment instantly, then undo it when you find it in a coat.</p>
            <div className={cn("relative mt-8 aspect-[1.6] max-w-sm overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground transition-all duration-500 motion-reduce:transition-none", frozen && "scale-[0.97] opacity-60 saturate-0")}>
              <p className={cn("text-2xl", pocketDisplayClass)}>pocket</p><p className="mt-12 text-xl font-bold tracking-widest tabular-nums">•••• •••• •••• 4821</p>
              {frozen && <span className="bg-card text-card-foreground absolute top-5 right-5 flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold"><Snowflake className="size-4" aria-hidden="true" />Frozen</span>}
            </div>
            <label className="mt-6 flex max-w-sm cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white/10 p-4"><span className="font-extrabold">Freeze card</span><Switch checked={frozen} onCheckedChange={setFrozen} /></label>
            <p role="status" className="mt-3 text-sm font-semibold">{frozen ? "Payments are off. Nothing can be charged." : "Your card is live."}</p>
          </section>

          <section aria-labelledby="pf-round" className={cn(card, "bg-chart-1 text-[var(--pocket-on-lime)] lg:col-span-3")}>
            <h2 id="pf-round" className={cn("text-3xl", pocketDisplayClass)}>Round-ups, calculated</h2>
            <p className="mt-2 max-w-sm font-medium text-pretty">Tell us roughly what you spend on your card each month.</p>
            <p id="pf-spend" className="mt-8 flex items-baseline justify-between font-extrabold"><span>Monthly card spending</span><span className="text-2xl tabular-nums">{money(spend, 0)}</span></p>
            <Slider aria-labelledby="pf-spend" thumbLabels={["Monthly spending"]} min={200} max={3000} step={50} value={[spend]} onValueChange={(v) => setSpend(v[0]!)} className="mt-4 [&_[data-slot=slider-track]]:bg-black/20 [&_[data-slot=slider-range]]:bg-[var(--pocket-ink)] [&_[data-slot=slider-thumb]]:border-[var(--pocket-ink)] [&_[data-slot=slider-thumb]]:bg-white" />
            <div className="mt-10"><p className="font-extrabold">You would save about</p><p className={cn("text-[clamp(3.5rem,8vw,6rem)] leading-none tabular-nums", pocketDisplayClass)}><output aria-live="polite">{money(savedPerMonth, 0)}</output></p><p className="mt-1 font-bold">a month · {money(savedPerMonth * 12, 0)} a year</p></div>
          </section>

          <section aria-labelledby="pf-ins" className={cn(card, "bg-card lg:col-span-2")}>
            <h2 id="pf-ins" className={cn("text-3xl", pocketDisplayClass)}>Where it went</h2>
            <p className="text-muted-foreground mt-2 text-lg font-medium">{money(total, 0)} in August</p>
            <ul className="mt-6 grid gap-4">{bars.map(([n, v, c]) => <li key={n}><div className="flex justify-between text-sm font-extrabold"><span>{n}</span><span className="tabular-nums">{money(v, 0)}</span></div><div className="bg-muted mt-1.5 h-4 overflow-hidden rounded-full" aria-hidden="true"><div className={cn("h-full rounded-full", c)} style={{ width: `${(v / 340) * 100}%` }} /></div></li>)}</ul>
          </section>

          <section aria-labelledby="pf-split" className={cn(card, "bg-card lg:col-span-2")}>
            <h2 id="pf-split" className={cn("text-3xl", pocketDisplayClass)}>Split the bill</h2>
            <p className="text-muted-foreground mt-2 font-medium">Dinner, {money(bill, 0)} · {money(share, 0)} each</p>
            <ul className="mt-5 grid gap-2">{people.map(([n, c]) => { const isPaid = paid.includes(n); return <li key={n} className="flex items-center justify-between gap-3"><span className="flex items-center gap-3"><span aria-hidden="true" className={cn("flex size-10 items-center justify-center rounded-full font-black text-[var(--pocket-on-lime)]", c)}>{n[0]}</span><span className="font-bold">{n}</span></span>{isPaid ? <span className="bg-secondary rounded-full px-3 py-1 text-sm font-extrabold">Paid</span> : <button type="button" onClick={() => setPaid((p) => [...p, n])} className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold outline-none focus-visible:ring-[3px]"><Send className="size-3.5" aria-hidden="true" />Remind {n}</button>}</li> })}</ul>
            <p role="status" className="text-muted-foreground mt-4 text-sm font-semibold">{paid.length === people.length ? "Everyone has paid." : `${people.length - paid.length} still to pay.`}</p>
          </section>

          <section aria-labelledby="pf-fx" className={cn(card, "bg-chart-4 text-[var(--pocket-on-lime)] lg:col-span-2")}>
            <h2 id="pf-fx" className={cn("text-3xl", pocketDisplayClass)}>Real exchange rate</h2>
            <p className="mt-2 font-medium">No fee, no markup.</p>
            <div className="mt-6 grid gap-3">
              <div className="grid gap-1.5"><label htmlFor="pf-amount" className="text-sm font-extrabold">You send (USD)</label><input id="pf-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} className="h-12 rounded-2xl border-2 border-[var(--pocket-ink)] bg-white/60 px-4 text-lg font-extrabold tabular-nums outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--pocket-ink)]/40" /></div>
              <div role="group" aria-label="Currency" className="flex flex-wrap gap-2">{currencies.slice(1).map(([c]) => <button key={c} type="button" aria-pressed={cur === c} onClick={() => setCur(c)} className="aria-pressed:bg-[var(--pocket-ink)] aria-pressed:text-white focus-visible:ring-[var(--pocket-ink)]/50 h-10 rounded-full border-2 border-[var(--pocket-ink)] px-4 text-sm font-extrabold outline-none focus-visible:ring-[3px]">{c}</button>)}</div>
              <p className="mt-2 font-extrabold">They receive</p>
              <p className={cn("text-4xl tabular-nums", pocketDisplayClass)}><output aria-live="polite">{rate[2]}{converted.toLocaleString("en-US", { maximumFractionDigits: cur === "JPY" ? 0 : 2, minimumFractionDigits: cur === "JPY" ? 0 : 2 })}</output></p>
              <p className="text-sm font-bold">1 USD = {rate[1]} {cur}</p>
            </div>
          </section>
        </div>
      </main>
    </PocketShell>
  )
}

export { PocketFeatures, type PocketFeaturesProps }
