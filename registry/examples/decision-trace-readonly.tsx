"use client"

import { DecisionTrace } from "@/components/ballmac/decision-trace"

export default function DecisionTraceReadonly() {
  return (
    <div className="w-full max-w-xl">
      <DecisionTrace
        question="Which model should write the summary?"
        options={[
          { id: "small", label: "Haiku", score: 0.84, reason: "The document is short and the summary is routine, so the fastest model is enough.", pros: ["Fast"], cons: [] },
          { id: "large", label: "Opus", score: 0.51, reason: "Higher quality than this task needs, at ten times the cost.", pros: [], cons: ["Expensive for a routine task"] },
        ]}
      />
    </div>
  )
}
