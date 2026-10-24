"use client"

import * as React from "react"

import { withRedirect } from "@/lib/pro-checkout"

/** Provider link with a same-site return address and server-validated partner discount. */
export function CheckoutLink({ href, children, onClick, ...props }: React.ComponentProps<"a">) {
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
