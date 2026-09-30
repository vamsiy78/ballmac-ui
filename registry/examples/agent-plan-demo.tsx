"use client"

import * as React from "react"
import { Pause, Play } from "lucide-react"

import { AgentPlan, type PlanStep } from "@/components/ballmac/agent-plan"

const base: PlanStep[] = [
  { id: "read", title: "Read the repository", description: "Find where checkout totals are computed.", status: "pending", detail: "Opened 14 files. Totals are built in lib/cart.ts and formatted in components/summary.tsx." },
  { id: "plan", title: "Choose a fix", status: "pending", steps: [
    { id: "plan-a", title: "Round once, at the end", status: "pending" },
    { id: "plan-b", title: "Store prices as integer cents", status: "pending" },
  ] },
  { id: "edit", title: "Edit the files", description: "Change 3 files and add a regression test.", status: "pending", detail: "lib/cart.ts +18 −9 · components/summary.tsx +4 −4 · cart.test.ts +31" },
  { id: "test", title: "Run the test suite", status: "pending" },
]

export default function AgentPlanDemo() {
  const [tick, setTick] = React.useState(1)
  const [playing, setPlaying] = React.useState(true)
  React.useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setTick((t) => (t >= 9 ? 9 : t + 1)), 1600)
    return () => clearInterval(id)
  }, [playing])

  const order = ["read", "plan-a", "plan-b", "edit", "test"]
  const at = Math.floor(tick / 2)
  const status = (id: string) => {
    const i = order.indexOf(id)
    return i < at ? "done" : i === at ? "running" : "pending"
  }
  const steps = base.map((s): PlanStep => {
    if (s.steps) {
      const kids = s.steps.map((k): PlanStep => ({ ...k, status: status(k.id), duration: status(k.id) === "done" ? "1.2s" : undefined }))
      const parent = kids.every((k) => k.status === "done") ? "done" : kids.some((k) => k.status !== "pending") ? "running" : "pending"
      return { ...s, status: parent, steps: kids }
    }
    return { ...s, status: status(s.id), duration: status(s.id) === "done" ? "3.4s" : undefined }
  })

  return (
    <div className="w-full max-w-lg">
      <AgentPlan
        title="Fix rounding in checkout"
        description="The total is off by one cent for some carts."
        steps={steps}
        actions={
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-2.5 text-[13px] font-medium shadow-xs outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {playing ? <Pause aria-hidden="true" className="size-3.5" /> : <Play aria-hidden="true" className="size-3.5" />}
            {playing ? "Pause" : "Resume"}
          </button>
        }
      />
    </div>
  )
}
