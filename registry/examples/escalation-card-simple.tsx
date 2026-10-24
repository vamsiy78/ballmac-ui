"use client"

import { EscalationCard } from "@/components/ballmac/escalation-card"

export default function EscalationCardSimple() {
  return (
    <div className="w-full max-w-xl">
      <EscalationCard
        customer="Jonas Weber"
        channel="Email"
        sentiment="calm"
        waiting="22 min"
        reason="The question is about a contract, which the agent is not allowed to answer."
        summary={["Asks whether the annual plan can be switched to a team plan mid-term"]}
        onTakeOver={() => new Promise((r) => setTimeout(r, 400))}
        onSnooze={() => Promise.reject(new Error("The inbox service is unavailable, so it is still open."))}
      />
    </div>
  )
}
