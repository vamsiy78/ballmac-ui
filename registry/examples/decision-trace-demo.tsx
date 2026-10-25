"use client"

import { DecisionTrace } from "@/components/ballmac/decision-trace"

const options = [
  { id: "kb", label: "Search the help center", score: 0.91, cost: "$0.002 · about 1 s", reason: "The question is about the refund policy, which is written down in the help center. Searching it gives an answer with a source a person can check.", pros: ["Answers come with a source", "Cheapest option", "Policy text is current"], cons: ["Cannot see this customer's order"] },
  { id: "orders", label: "Look up the customer's order", score: 0.64, cost: "$0.01 · about 2 s", reason: "Useful once the policy is known, because the order decides whether the refund applies. It cannot answer the policy question on its own.", pros: ["Knows the real delivery date"], cons: ["Needs the order number first", "Does not explain the policy"] },
  { id: "human", label: "Hand over to a person", score: 0.22, cost: "About 4 hours", reason: "A person would be accurate but slow, and nothing here is unusual enough to need one. Kept as the fallback if the policy search finds nothing.", pros: ["Can make exceptions"], cons: ["Slow", "Costs the most"] },
]

export default function DecisionTraceDemo() {
  return (
    <div className="w-full max-w-2xl">
      <DecisionTrace question="How should the agent answer “Can I return a damaged speaker?”" decidedBy="Router agent" options={options} onOverride={() => new Promise((resolve) => setTimeout(resolve, 500))} />
    </div>
  )
}
