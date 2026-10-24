"use client"

import { Agent14 } from "@/components/ballmac/blocks/agent-14/agent-14"

export default function Agent14Small() {
  return <Agent14 items={[{ id: "1", label: "a.csv", status: "done" }, { id: "2", label: "b.csv", status: "running" }, { id: "3", label: "c.csv", status: "queued" }]} tasks={[{ id: "r", title: "Import b.csv", state: "running", progress: 40 }]} />
}
