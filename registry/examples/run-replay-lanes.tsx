"use client"

import * as React from "react"

import { AgentLanes, type Lane } from "@/components/ballmac/agent-lanes"
import { RunReplay } from "@/components/ballmac/run-replay"

const lanes: Lane[] = [
  { id: "plan", name: "Planner", segments: [{ id: "p1", start: 0, end: 30, kind: "thinking", label: "Plans the change" }, { id: "p2", start: 30, end: 40, kind: "done", label: "Plan ready" }] },
  { id: "code", name: "Coder", segments: [{ id: "c1", start: 40, end: 110, kind: "tool", label: "Edits the files" }, { id: "c2", start: 110, end: 130, kind: "waiting", label: "Waits for tests" }] },
]

export default function RunReplayLanes() {
  const [time, setTime] = React.useState(20)
  return (
    <div className="grid w-full max-w-3xl gap-3">
      <AgentLanes lanes={lanes} duration={140} now={time} handoffs={[{ from: "p2", to: "c1", label: "plan" }]} />
      <RunReplay duration={140} time={time} onTimeChange={setTime} markers={[{ time: 40, label: "Handoff" }, { time: 110, label: "Waiting" }]} />
    </div>
  )
}
