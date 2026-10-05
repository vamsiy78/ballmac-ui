"use client"

import { ArrowRight, X } from "lucide-react"
import * as React from "react"

import Link from "@/components/site/link"
import type { Founding } from "@/lib/founding"

const KEY = "founding-banner"

/** A slim strip under the header announcing the founding price. Dismissible, and it stays dismissed for that offer. */
export function FoundingBanner({ offer, href = "/pricing" }: { offer: Founding; href?: string }) {
  const id = `${offer.limit}-${offer.price}`
  // Hidden until mounted, so a dismissed banner never flashes.
  const [shown, setShown] = React.useState(false)
  React.useEffect(() => {
    let dismissed = false
    try {
      dismissed = localStorage.getItem(KEY) === id
    } catch {
      // Storage can be blocked; show the banner.
    }
    const frame = requestAnimationFrame(() => setShown(!dismissed))
    return () => cancelAnimationFrame(frame)
  }, [id])
  if (!shown) return null
  return (
    <div className="bg-foreground text-background relative" role="region" aria-label="Founding price">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 pr-12 pl-4 text-center text-[13px] leading-5 sm:px-12">
        <p>
          <span className="font-semibold">Founding price:</span> Ballmac UI Pro is <span className="font-semibold">${offer.price}</span> for the first{" "}
          <span className="font-semibold">{offer.limit}</span> buyers, then the price goes up.
        </p>
        <Link href={href} className="focus-visible:ring-background/60 inline-flex items-center gap-1 rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-2">
          Get Pro <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <button
        type="button"
        aria-label="Dismiss the founding price notice"
        onClick={() => {
          setShown(false)
          try {
            localStorage.setItem(KEY, id)
          } catch {
            // Not saved; it will show again next time.
          }
        }}
        className="hover:bg-background/15 focus-visible:ring-background/60 absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md outline-none focus-visible:ring-2 sm:right-4"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
