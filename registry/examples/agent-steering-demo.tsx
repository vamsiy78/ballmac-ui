"use client"

import * as React from "react"

import { AgentSteering, type SteeringMode, type SteeringNote } from "@/components/ballmac/agent-steering"

const start: SteeringNote[] = [
  { id: "1", text: "Skip the competitor pages and focus on our own pricing.", mode: "now", state: "applied", at: "2:10 pm" },
  { id: "2", text: "Also check whether annual billing is cheaper.", mode: "after-step", state: "queued", at: "2:12 pm" },
]

export default function AgentSteeringDemo() {
  const [notes, setNotes] = React.useState(start)
  return (
    <div className="w-full max-w-xl">
      <AgentSteering
        notes={notes}
        step="Reading the pricing page (step 4 of 9)"
        onSend={async (text: string, mode: SteeringMode) => {
          await new Promise((resolve) => setTimeout(resolve, 500))
          const id = String(Date.now())
          setNotes((n) => [...n, { id, text, mode, state: "queued", at: "now" }])
          setTimeout(() => setNotes((n) => n.map((x) => (x.id === id ? { ...x, state: "applied" } : x))), 2500)
        }}
        onRemove={async (id: string) => {
          await new Promise((resolve) => setTimeout(resolve, 300))
          setNotes((n) => n.filter((x) => x.id !== id))
        }}
      />
    </div>
  )
}
