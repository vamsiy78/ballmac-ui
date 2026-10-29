import { ArrowRight, Clock, ShieldCheck } from "lucide-react"

import { BuildCost } from "@/components/pro/build-cost"
import { CheckoutLink } from "@/components/pro/checkout-link"
import { cn } from "@/lib/utils"

/** Kit prices as listed on the vendors' own pricing pages in October 2026, for one person, one-time. */
const KITS = [
  { label: "Premium Tailwind kit", price: 299, note: "one-time, one person" },
  { label: "Popular shadcn block kit", price: 149, note: "one-time, one person" },
]

/**
 * The price, put next to what it replaces: a short bar comparison against premium UI kits (one series, every bar labelled, Pro the only coloured mark),
 * then the build-it-yourself calculator with the visitor's own numbers. Bars grow in as they scroll into view; without scroll-driven animation they are
 * simply drawn.
 */
export function ValueAnchor({ price, checkout, proCount }: { price: number; checkout: string | null; proCount: number }) {
  const rows = [...KITS, { label: "Ballmac UI Pro", price, note: `${proCount} screens, 3 starter apps`, ours: true }]
  const max = Math.max(...rows.map((r) => r.price))
  return (
    <section aria-labelledby="value-h" className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6">
      <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <div className="bm-reveal">
          <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium"><Clock className="size-4" aria-hidden="true" />The maths</p>
          <h2 id="value-h" className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">Weeks of UI work. Less than an hour&rsquo;s pay.</h2>
          <p className="text-muted-foreground mt-5 max-w-md text-lg leading-relaxed">
            A screen done properly, with loading, empty and error states, dark mode, keyboard support and motion, takes most of a day. Pro is {proCount} of them for ${price}, once.
          </p>
        </div>

        <figure className="bm-reveal">
          <figcaption className="text-muted-foreground mb-5 text-sm">What a premium UI library costs, one person, one-time</figcaption>
          <ul className="grid gap-5">
            {rows.map((r) => (
              <li key={r.label} className="grid gap-2">
                <div className="flex items-baseline justify-between gap-4">
                  <span className={cn("text-[15px]", "ours" in r ? "font-semibold" : "text-muted-foreground")}>
                    {r.label} <span className="text-muted-foreground text-xs font-normal">· {r.note}</span>
                  </span>
                  <span className={cn("text-2xl font-semibold tracking-tight tabular-nums", !("ours" in r) && "text-muted-foreground")}>${r.price}</span>
                </div>
                <div className="bg-muted h-3 overflow-hidden rounded-full">
                  <div
                    className={cn("bm-grow h-full rounded-full", "ours" in r ? "bg-[oklch(0.78_0.15_75)]" : "bg-foreground/25")}
                    style={{ width: `${Math.max(3, (r.price / max) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground mt-5 text-xs">Prices as listed on each vendor&rsquo;s pricing page, October 2026.</p>
        </figure>
      </div>

      <BuildCost
        className="bm-reveal mt-16"
        price={price}
        action={
          checkout ? (
            <CheckoutLink href={checkout} plan="pro" className="bm-sheen bg-foreground text-background relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full px-7 text-[15px] font-semibold outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none">
              Get Pro for ${price} <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </CheckoutLink>
          ) : null
        }
      />
      <p className="text-muted-foreground mt-5 flex items-center justify-center gap-2 text-sm">
        <ShieldCheck className="size-4" aria-hidden="true" />If a Pro item does not work as described and we cannot fix it, you get your money back.
      </p>
    </section>
  )
}
