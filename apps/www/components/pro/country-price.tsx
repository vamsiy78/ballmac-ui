"use client"

import * as React from "react"

import { pppPrice } from "@/lib/ppp"
import { cn } from "@/lib/utils"

/**
 * One line for visitors in a country with a lower price: "In India you pay about $29.70". It asks the Worker which country the visitor is in and says nothing
 * for everyone else, or when that fails. The country comes from the connection, Dodo's checkout uses the billing country, so the line is a guide and says so.
 */
export function CountryPrice({ price, className }: { price: number; className?: string }) {
  const [local, setLocal] = React.useState<{ country: string; price: number } | null>(null)

  React.useEffect(() => {
    let live = true
    fetch("/api/geo", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { country?: string | null } | null) => {
        const found = pppPrice(price, data?.country)
        if (live && found && data?.country) setLocal({ country: data.country, price: found.price })
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [price])

  if (!local) return null
  let name = local.country
  try {
    name = new Intl.DisplayNames(["en"], { type: "region" }).of(local.country) ?? local.country
  } catch {}
  return (
    <span className={cn("block text-sm", className)}>
      <span className="font-semibold">In {name} you pay about ${local.price.toFixed(2)}.</span>{" "}
      <span className="opacity-70">Prices follow local purchasing power. The checkout page shows the final price.</span>
    </span>
  )
}
