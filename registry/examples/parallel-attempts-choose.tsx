"use client"

import * as React from "react"

import { ParallelAttempts, type Attempt } from "@/components/ballmac/parallel-attempts"

const attempts: Attempt[] = [
  { id: "one", label: "Version 1", model: "balanced", status: "done", summary: "Rewrites the onboarding copy in a warmer tone and keeps every step.", added: 36, removed: 29, files: 2, duration: "40 s", cost: "$0.05" },
  { id: "two", label: "Version 2", model: "balanced", status: "done", summary: "Shortens the flow from five steps to three and moves the team invite to the end.", added: 64, removed: 71, files: 3, duration: "52 s", cost: "$0.06" },
]

export default function ParallelAttemptsChoose() {
  const [done, setDone] = React.useState<string | null>(null)
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <ParallelAttempts attempts={attempts} onChoose={setDone} />
      {done && (
        <p role="status" className="rounded-lg border bg-card px-4 py-3 text-sm">
          Continuing with <strong>{attempts.find((a) => a.id === done)?.label}</strong>.
        </p>
      )}
    </div>
  )
}
