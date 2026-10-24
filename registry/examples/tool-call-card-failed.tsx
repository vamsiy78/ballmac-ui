"use client"

import { CreditCard } from "lucide-react"

import { ToolCallCard } from "@/components/ballmac/tool-call-card"

export default function ToolCallCardFailed() {
  return (
    <div className="w-full max-w-xl">
      <ToolCallCard
        name="issue_refund"
        server="stripe"
        icon={<CreditCard />}
        status="error"
        duration={3040}
        defaultOpen
        input={{ order: "A-9914", amount: 340 }}
        result="Stripe returned 503: the service is unavailable. Nothing was refunded."
        onRetry={() => new Promise((resolve) => setTimeout(resolve, 600))}
      />
    </div>
  )
}
