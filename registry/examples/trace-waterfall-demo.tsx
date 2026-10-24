"use client"

import { TraceWaterfall, type TraceSpan } from "@/components/ballmac/trace-waterfall"

const spans: TraceSpan[] = [
  { id: "run", name: "Answer a billing question", kind: "agent", start: 0, duration: 7400, detail: "The whole run, from the customer's message to the sent reply." },
  { id: "route", parentId: "run", name: "Route the message", kind: "model", model: "Haiku 5.5", start: 30, duration: 620, tokens: 1480, cost: 0.0021 },
  { id: "billing", parentId: "run", name: "Billing agent", kind: "agent", start: 700, duration: 5200 },
  { id: "plan", parentId: "billing", name: "Plan the lookup", kind: "model", model: "Sonnet 5.5", start: 720, duration: 910, tokens: 2260, cost: 0.012 },
  { id: "search", parentId: "billing", name: "Search the policy", kind: "retrieval", start: 1650, duration: 380, cost: 0.0004 },
  { id: "pay", parentId: "billing", name: "Look up the payment", kind: "tool", start: 1700, duration: 1240, cost: 0.003, detail: "GET /payments?customer=…  returned 200 in 1.24 s." },
  { id: "refund", parentId: "billing", name: "Check refund eligibility", kind: "tool", start: 2960, duration: 760, cost: 0.002 },
  { id: "think", parentId: "billing", name: "Decide what to say", kind: "model", model: "Opus 5.5", start: 3750, duration: 2100, tokens: 5120, cost: 0.081 },
  { id: "reply", parentId: "run", name: "Write the reply", kind: "model", model: "Sonnet 5.5", start: 5950, duration: 1380, tokens: 3010, cost: 0.034 },
]

export default function TraceWaterfallDemo() {
  return (
    <div className="w-full max-w-4xl">
      <TraceWaterfall spans={spans} defaultSelected="pay" />
    </div>
  )
}
