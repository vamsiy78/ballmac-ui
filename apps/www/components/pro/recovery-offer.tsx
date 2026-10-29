"use client"

import { Clock, X } from "lucide-react"
import * as React from "react"

import { OFFER_USED_KEY, clock } from "@/lib/checkout-offer"
import { STANDING_PRICE } from "@/lib/limited-offer"

/**
 * The one-time "still thinking?" offer, shown when a buyer clicks back from the Pro checkout and lands on /pro?offer=<id> (see worker/routes/checkout.ts).
 * It asks the Worker whether that offer is really open and for how long, so the clock is the server's and a reload or a second tab shows the same time left.
 * Nothing shows unless the Worker says it is open. It never restarts: when the time is up the card goes away for good.
 */
export function RecoveryOffer() {
  const [id, setId] = React.useState<string | null>(null)
  const [expiresAt, setExpiresAt] = React.useState<number | null>(null)
  const [dollars, setDollars] = React.useState(5)
  const [failed, setFailed] = React.useState(false)
  const [now, setNow] = React.useState(0)
  const [hidden, setHidden] = React.useState(false)

  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const n = q.get("offer")
    if (!n || !/^[A-Za-z0-9_-]{22}$/.test(n)) return
    const ctl = new AbortController()
    fetch(`/api/checkout/offer?n=${n}`, { cache: "no-store", signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { open?: boolean; remainingMs?: number; dollars?: number } | null) => {
        if (!d?.open || typeof d.remainingMs !== "number") return
        setId(n)
        setFailed(q.get("offer_error") === "1")
        setDollars(d.dollars ?? 5)
        const t = Date.now()
        setExpiresAt(t + d.remainingMs)
        setNow(t)
      })
      .catch(() => {})
    return () => ctl.abort()
  }, [])

  React.useEffect(() => {
    if (expiresAt === null) return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [expiresAt])

  const left = expiresAt === null ? 0 : expiresAt - now
  if (!id || hidden || left <= 0) return null
  const price = STANDING_PRICE ? Number(STANDING_PRICE) : null

  return (
    <section aria-label="One-time offer" className="bg-foreground text-background fixed inset-x-3 top-[6.5rem] z-50 mx-auto max-w-md rounded-2xl p-5 shadow-2xl ring-1 ring-white/20 sm:top-28">
      <button type="button" onClick={() => setHidden(true)} aria-label="Close the offer" className="text-background/60 hover:text-background focus-visible:ring-background/60 absolute top-3 end-3 inline-flex size-7 items-center justify-center rounded-full outline-none focus-visible:ring-[3px]">
        <X className="size-4" aria-hidden="true" />
      </button>
      <p className="flex items-center gap-2 text-xs font-medium opacity-70">
        <Clock className="size-3.5" aria-hidden="true" />
        Still thinking? Ends in <span className="font-mono tabular-nums">{clock(left)}</span>
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight">
        ${dollars} off Pro{price ? <>, <span className="whitespace-nowrap">${price - dollars} once</span></> : null}
      </p>
      <p className="mt-1 text-sm opacity-70">For this visit only, and once per customer. The price at checkout already has it applied.</p>
      {failed && <p role="alert" className="mt-2 text-sm text-[oklch(0.83_0.15_78)]">That did not go through. Please try again.</p>}
      <a
        href={`/api/checkout/claim?n=${id}`}
        onClick={() => {
          try {
            window.localStorage.setItem(OFFER_USED_KEY, "1")
          } catch {}
        }}
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-[oklch(0.83_0.15_78)] px-6 text-sm font-semibold text-[oklch(0.25_0.05_70)] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-white/60 motion-reduce:transition-none"
      >
        Take ${dollars} off and check out
      </a>
    </section>
  )
}
