"use client"

import * as React from "react"

import { withRedirect } from "@/lib/pro-checkout"

/**
 * A link to the payment provider's checkout. It renders the plain link (so it works without scripts) and, just before the buyer
 * follows it, adds the return address of the current site, so a purchase made on a preview returns to that preview.
 */
export function CheckoutLink({ href, children, ...props }: React.ComponentProps<"a">) {
  const base = href ?? ""
  const update = (e: React.SyntheticEvent<HTMLAnchorElement>) => {
    e.currentTarget.href = withRedirect(base, window.location.origin)
  }
  return (
    <a {...props} href={base} onPointerDown={update} onClick={update} onFocus={update}>
      {children}
    </a>
  )
}
