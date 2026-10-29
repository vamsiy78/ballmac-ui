"use client"

import * as React from "react"

import { withRedirect } from "@/lib/pro-checkout"

/** Provider link with a same-site return address and server-validated partner discount. */
/**
 * Tells the Worker that someone is leaving for the checkout, so the owner is emailed (see worker/routes/checkout-click.ts). It sends no personal data and never
 * delays or blocks the click. Once per page view and plan.
 */
function notifyClick(plan: "pro" | "team" | "monthly") {
  try {
    const q = new URLSearchParams(window.location.search)
    const utm = ["utm_source", "utm_medium", "utm_campaign"].map((k) => q.get(k) ?? "").join("/").replace(/^\/+|\/+$/g, "")
    let from = ""
    try {
      from = document.referrer ? new URL(document.referrer).host : ""
    } catch {}
    const body = JSON.stringify({ plan, page: window.location.pathname, utm, from: from === window.location.host ? "" : from })
    if (!navigator.sendBeacon?.("/api/checkout-click", new Blob([body], { type: "text/plain" }))) void fetch("/api/checkout-click", { method: "POST", body, keepalive: true }).catch(() => {})
  } catch {}
}

export function CheckoutLink({ href, children, onClick, plan = "pro", ...props }: React.ComponentProps<"a"> & { plan?: "pro" | "team" | "monthly" }) {
  const told = React.useRef(false)
  const [referral, setReferral] = React.useState<boolean | null>(null)
  const check = React.useCallback(async () => {
    const response = await fetch("/api/affiliates/status", { cache: "no-store" })
    if (!response.ok) throw new Error("Referral status unavailable")
    const data = await response.json()
    const active = Boolean(data.active)
    return active
  }, [])
  React.useEffect(() => {
    check().then(setReferral).catch(() => {})
  }, [check])
  const base = href ?? ""
  const update = (e: React.SyntheticEvent<HTMLAnchorElement>) => {
    e.currentTarget.href = referral ? "/api/affiliates/checkout" : withRedirect(base, window.location.origin)
  }
  async function click(e: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(e)
    if (e.defaultPrevented) return
    if (!told.current) {
      told.current = true
      notifyClick(plan)
    }
    update(e)
    if (referral !== null || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    // A fast click must wait for attribution; never silently lose the buyer's discount while the check is in flight.
    e.preventDefault()
    try {
      const active = await check()
      const destination = active ? "/api/affiliates/checkout" : withRedirect(base, window.location.origin)
      window.location.assign(new URL(destination, window.location.origin).toString())
    } catch {
      // If the referral check is down, a buyer must still reach the checkout; the plain link only costs a partner's discount.
      window.location.assign(withRedirect(base, window.location.origin))
    }
  }
  return (
    <a
      {...props}
      href={referral ? "/api/affiliates/checkout" : base}
      onPointerDown={update}
      onClick={click}
      onFocus={update}
    >
      {children}
    </a>
  )
}
