"use client"

import * as React from "react"

import { AgentPlan, type PlanStep } from "@/components/ballmac/agent-plan"

const failed: PlanStep[] = [
  { id: "fetch", title: "Fetch the latest invoices", status: "done", duration: "0.8s" },
  { id: "parse", title: "Extract line items", status: "done", duration: "2.1s", detail: "Found 212 line items across 37 invoices." },
  {
    id: "send",
    title: "Send the summary to accounting",
    status: "failed",
    description: "POST to the accounting webhook",
    error: "The webhook returned 503 after 3 attempts.",
    detail: "Last response: Service Unavailable. The payload was not stored.",
  },
  { id: "notify", title: "Notify the finance channel", status: "skipped" },
]

export default function AgentPlanFailed() {
  const [steps, setSteps] = React.useState(failed)
  return (
    <div className="w-full max-w-lg">
      <AgentPlan
        title="Monthly invoice summary"
        steps={steps}
        onRetry={(step) =>
          setSteps((list) => list.map((s) => (s.id === step.id ? { ...s, status: "running", error: undefined } : s)))
        }
      />
    </div>
  )
}
