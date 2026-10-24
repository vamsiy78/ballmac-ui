"use client"

import { PlanTracker, type PlanStep } from "@/components/ballmac/plan-tracker"

const steps: PlanStep[] = [
  { id: "1", title: "Read the ticket and the three linked threads", status: "done", estimate: 1, actual: 1 },
  { id: "2", title: "Find where invoice totals are calculated", status: "done", estimate: 2, actual: 4.5, note: "The totals live in two places, so this took longer." },
  { id: "3", title: "Write the fix in the shared helper", status: "doing", estimate: 6, actual: 2.5, note: "Editing the rounding in the totals helper." },
  { id: "4", title: "Update the snapshot tests", status: "todo", estimate: 3, origin: "added", note: "Added after step 2: two snapshots depend on the old rounding." },
  { id: "5", title: "Write release notes", status: "skipped", note: "Skipped: a bug fix does not need them." },
  { id: "6", title: "Open a pull request", status: "todo", estimate: 2 },
]

export default function PlanTrackerDemo() {
  return (
    <div className="w-full max-w-xl">
      <PlanTracker steps={steps} title="Fix the invoice total" />
    </div>
  )
}
