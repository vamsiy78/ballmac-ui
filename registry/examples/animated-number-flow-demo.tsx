"use client"

import * as React from "react"

import { AnimatedNumberFlow } from "@/components/ballmac/animated-number-flow"

const plans = [
  { id: "starter", name: "Starter", monthly: 12, yearly: 9 },
  { id: "team", name: "Team", monthly: 49, yearly: 39 },
  { id: "scale", name: "Scale", monthly: 199, yearly: 159 },
]

export default function AnimatedNumberFlowDemo() {
  const [yearly, setYearly] = React.useState(false)
  return (
    <div className="grid w-full max-w-md gap-4">
      <div role="group" aria-label="Billing period" className="mx-auto inline-flex gap-0.5 rounded-lg bg-muted p-0.5">
        {[false, true].map((y) => (
          <button
            key={String(y)}
            type="button"
            aria-pressed={yearly === y}
            onClick={() => setYearly(y)}
            className="h-8 rounded-md px-4 text-[13px] font-medium text-muted-foreground outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs"
          >
            {y ? "Yearly" : "Monthly"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {plans.map((p) => (
          <div key={p.id} className="rounded-xl border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{p.name}</p>
            <AnimatedNumberFlow className="text-2xl font-semibold" value={yearly ? p.yearly : p.monthly} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
            <p className="text-[11px] text-muted-foreground">per seat / month</p>
          </div>
        ))}
      </div>
    </div>
  )
}
