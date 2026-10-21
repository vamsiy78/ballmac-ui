"use client"
import * as React from "react"
import { Tag } from "lucide-react"

export function ReferralNotice() {
  const [active, setActive] = React.useState(false)
  const [error, setError] = React.useState("")
  React.useEffect(() => {
    fetch("/api/affiliates/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setActive(Boolean(data?.active))
        const reason = new URLSearchParams(window.location.search).get("referral_error")
        const messages: Record<string, string> = {
          expired: "Your referral has expired. Open your partner’s link again to claim 10% off.",
          founding: "Partner discounts begin after the founding offer ends.",
          busy: "Too many checkout attempts. Please try again in a few minutes.",
          unavailable:
            "We couldn’t open your discounted checkout. Please try again shortly or contact support.",
        }
        setError(reason ? (messages[reason] ?? "") : "")
      })
      .catch(() => {})
  }, [])
  if (error)
    return (
      <aside role="status" className="border-b bg-muted/50 px-4 py-3 text-center text-sm">
        {error}{" "}
        <a href="/support" className="underline underline-offset-4">
          Get help
        </a>
      </aside>
    )
  if (!active) return null
  return (
    <aside className="border-b bg-muted/50 px-4 py-3 text-center text-sm">
      <Tag className="me-2 inline size-4" aria-hidden="true" />
      <strong className="font-medium">A good recommendation comes with 10% off.</strong> Your partner discount
      will be applied at checkout.
    </aside>
  )
}
