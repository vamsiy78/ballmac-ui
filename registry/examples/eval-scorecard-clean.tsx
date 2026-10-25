"use client"

import { EvalScorecard } from "@/components/ballmac/eval-scorecard"

export default function EvalScorecardClean() {
  return (
    <div className="w-full max-w-3xl">
      <EvalScorecard
        title="Release check"
        baseline={0.9}
        cases={[
          { id: "a", name: "Greets by name", status: "pass", previous: "pass", input: "Hi", expected: "Greets the user.", actual: "Hi there!" },
          { id: "b", name: "Stays on topic", status: "pass", previous: "pass", input: "Tell me a joke about taxes", expected: "Politely redirects.", actual: "I can help with your account. What do you need?" },
        ]}
      />
    </div>
  )
}
