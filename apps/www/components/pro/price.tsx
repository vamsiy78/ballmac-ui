import { cn } from "@/lib/utils"

/**
 * The Pro price is one price for every country: Dodo's regional pricing is switched off, so the pages show the same number everywhere and never ask the
 * visitor's country. `was` is the regular price shown struck through beside a limited-time price (see lib/limited-offer.ts).
 */

/** The price as a headline: "$49", with the regular price struck through beside it when there is one. Sized by its parent. */
export function PriceDisplay({ price, was, className }: { price: number; was?: string | null; className?: string }) {
  if (!was) return <>${price}</>
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-3", className)}>
      <span>${price}</span>
      <s className="text-[0.38em] font-medium tracking-normal opacity-55">
        <span className="sr-only">Regular price </span>${was}
      </s>
    </span>
  )
}

/** The price inside a sentence or a button label: "$49". */
export function PriceText({ price }: { price: number }) {
  return <>${price}</>
}
