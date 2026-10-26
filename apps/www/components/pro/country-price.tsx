"use client"

import * as React from "react"

import { pppPrice } from "@/lib/ppp"
import { cn } from "@/lib/utils"

type Local = { country: string; name: string; price: number }

/**
 * The lower price for the visitor's country, or null (the full price applies, the country is unknown, or the lookup failed). It asks the Worker which country the
 * connection is in. Dodo's checkout uses the billing country, so what the pages show is a guide, and they say the checkout has the exact price.
 */
function useCountryPrice(price: number, enabled = true): Local | null {
  const [local, setLocal] = React.useState<Local | null>(null)

  React.useEffect(() => {
    if (!enabled) return
    let live = true
    fetch("/api/geo", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { country?: string | null } | null) => {
        const found = pppPrice(price, data?.country)
        if (!live || !found || !data?.country) return
        let name = data.country
        try {
          name = new Intl.DisplayNames(["en"], { type: "region" }).of(data.country) ?? data.country
        } catch {}
        setLocal({ country: data.country, name, price: found.price })
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [price, enabled])

  return local
}

/** The price as a headline: "$99", or for a visitor with a lower price the new price large and the regular one struck through beside it. Sized by its parent. */
export function PriceDisplay({ price }: { price: number }) {
  const local = useCountryPrice(price)
  if (!local) return <>${price}</>
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-3">
      <span>${local.price.toFixed(2)}</span>
      <s className="text-[0.38em] font-medium tracking-normal opacity-55">
        <span className="sr-only">Regular price </span>${price}
      </s>
    </span>
  )
}

/** The price inside a sentence or a button label: "$99", or the lower price for the visitor's country. */
export function PriceText({ price, regional = true }: { price: number; regional?: boolean }) {
  const local = useCountryPrice(price, regional)
  return <>${local ? local.price.toFixed(2) : price}</>
}

/** A short notice under the price, only for visitors with a lower price: which country, the new price, and where the exact price is shown. */
export function CountryPrice({ price, className }: { price: number; className?: string }) {
  const local = useCountryPrice(price)
  if (!local) return null
  return (
    <span role="status" className={cn("block rounded-lg border border-current/25 bg-current/10 px-3.5 py-2.5 text-sm leading-snug", className)}>
      <span className="font-semibold">
        Your price in {local.name}: ${local.price.toFixed(2)}
      </span>{" "}
      instead of ${price}. The checkout page shows the exact price.
    </span>
  )
}
