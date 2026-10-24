"use client"

import * as React from "react"
import { ArrowRight, X } from "lucide-react"

import { buttonVariants } from "@/components/ballmac/button"
import { CheckoutLink } from "@/components/pro/checkout-link"
import { cn } from "@/lib/utils"

const key = "ballmac-buy-dock-closed"

/**
 * A slim bar that keeps the purchase one tap away once someone has scrolled past the first screen of the Pro page. It steps aside while the buy
 * section itself is in view, can be dismissed for the session, and is hidden from print. Without storage it simply comes back on reload.
 */
export function BuyDock({ href, price }: { href: string; price: string }) {
  const [past, setPast] = React.useState(false)
  const [atBuy, setAtBuy] = React.useState(false)
  const [closed, setClosed] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setPast(window.scrollY > 900)
    // Read the dismissal in the first scroll callback, not synchronously in the effect body.
    const first = requestAnimationFrame(() => {
      try {
        if (sessionStorage.getItem(key)) setClosed(true)
      } catch {}
      onScroll()
    })
    window.addEventListener("scroll", onScroll, { passive: true })
    const buy = document.getElementById("buy")
    const io = buy ? new IntersectionObserver(([e]) => setAtBuy(e.isIntersecting), { threshold: 0.15 }) : null
    if (buy) io?.observe(buy)
    return () => {
      cancelAnimationFrame(first)
      window.removeEventListener("scroll", onScroll)
      io?.disconnect()
    }
  }, [])

  const show = past && !atBuy && !closed
  return (
    <div
      role="region"
      aria-label="Buy Ballmac UI Pro"
      hidden={!show}
      className={cn(
        "bg-background/90 fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl border p-2 pl-4 shadow-lg backdrop-blur print:hidden",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-300 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      )}
    >
      <p className="min-w-0 flex-1 text-sm leading-tight">
        <span className="font-semibold">Ballmac UI Pro</span>
        <span className="text-muted-foreground block truncate text-xs">${price} once · tax included · money back if it does not work</span>
      </p>
      <CheckoutLink href={href} className={buttonVariants({ shape: "pill" })}>
        Get Pro <ArrowRight aria-hidden="true" />
      </CheckoutLink>
      <button
        type="button"
        aria-label="Hide this bar"
        onClick={() => {
          setClosed(true)
          try {
            sessionStorage.setItem(key, "1")
          } catch {}
        }}
        className="text-muted-foreground hover:bg-accent focus-visible:ring-ring/50 flex size-9 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-[3px]"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
