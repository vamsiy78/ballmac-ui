"use client"

import { PlanTracker } from "@/components/ballmac/plan-tracker"

export default function PlanTrackerBlocked() {
  return (
    <div className="w-full max-w-xl">
      <PlanTracker
        title="Ship the fix"
        steps={[
          { id: "1", title: "Run the full test suite", status: "done", estimate: 4, actual: 3.5 },
          { id: "2", title: "Deploy to staging", status: "done", estimate: 3, actual: 3 },
          { id: "3", title: "Deploy to production", status: "blocked", estimate: 3, actual: 0.5, note: "Waiting for approval: production deploys need a person to confirm." },
          { id: "4", title: "Watch the error rate for ten minutes", status: "todo", estimate: 10 },
        ]}
      />
    </div>
  )
}
