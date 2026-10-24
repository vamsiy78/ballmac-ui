"use client"

import * as React from "react"

import { AgentLanes, type Lane } from "@/components/ballmac/agent-lanes"

const lanes: Lane[] = [
  {
    id: "triage",
    name: "Triage",
    role: "Sorts incoming reports",
    segments: [
      { id: "t1", start: 0, end: 24, kind: "thinking", label: "Classifies the report" },
      { id: "t2", start: 24, end: 30, kind: "done", label: "Routed" },
    ],
  },
  {
    id: "fix",
    name: "Fixer",
    role: "Prepares a patch",
    segments: [
      { id: "f1", start: 30, end: 74, kind: "tool", label: "Runs the failing test" },
      { id: "f2", start: 74, end: 96, kind: "thinking", label: "Writes a patch" },
      { id: "f3", start: 96, end: 150, kind: "blocked", label: "Needs write access", detail: "The patch touches the payments module, which this agent is not allowed to change without a person's approval." },
    ],
  },
  {
    id: "human",
    name: "On-call engineer",
    role: "Approves risky changes",
    segments: [{ id: "h1", start: 100, end: 150, kind: "waiting", label: "Approval requested", detail: "The request has been waiting for 50 seconds." }],
  },
]

export default function AgentLanesBlocked() {
  const [picked, setPicked] = React.useState<string | null>("f3")
  return (
    <div className="grid w-full max-w-3xl gap-3">
      <AgentLanes lanes={lanes} duration={160} now={150} selected={picked} onSelectedChange={setPicked} handoffs={[{ from: "t2", to: "f1" }, { from: "f2", to: "h1", label: "asks" }]} />
    </div>
  )
}
