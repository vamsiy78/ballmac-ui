"use client"

import * as React from "react"

import { AgentQueue, type QueuePriority, type QueueTask } from "@/components/ballmac/agent-queue"

const start: QueueTask[] = [
  { id: "r1", title: "Reconcile March payouts", state: "running", progress: 64, eta: "about 2 min", agent: "Finance agent" },
  { id: "r2", title: "Send renewal reminders", state: "running", progress: 21, eta: "about 6 min", agent: "Billing agent" },
  { id: "a", title: "Chase 12 overdue invoices", state: "queued", priority: "high", eta: "starts after the next slot frees", agent: "Billing agent" },
  { id: "b", title: "Email April receipts", state: "queued", priority: "normal" },
  { id: "c", title: "Archive invoices older than 7 years", state: "paused", priority: "low" },
  { id: "d", title: "Rebuild the revenue report", state: "queued", priority: "normal" },
]

const wait = () => new Promise((resolve) => setTimeout(resolve, 350))

export default function AgentQueueDemo() {
  const [tasks, setTasks] = React.useState(start)
  return (
    <div className="w-full max-w-2xl">
      <AgentQueue
        tasks={tasks}
        slots={3}
        onMove={async (id: string, to: number) => {
          await wait()
          setTasks((all) => {
            const running = all.filter((t) => t.state === "running")
            const rest = all.filter((t) => t.state !== "running")
            const from = rest.findIndex((t) => t.id === id)
            const next = [...rest]
            next.splice(to, 0, next.splice(from, 1)[0])
            return [...running, ...next]
          })
        }}
        onPause={async (id: string, paused: boolean) => {
          await wait()
          setTasks((all) => all.map((t) => (t.id === id ? { ...t, state: paused ? (t.state === "running" ? "paused" : "paused") : "queued" } : t)))
        }}
        onCancel={async (id: string) => {
          await wait()
          setTasks((all) => all.filter((t) => t.id !== id))
        }}
        onPriority={async (id: string, priority: QueuePriority) => {
          await wait()
          setTasks((all) => all.map((t) => (t.id === id ? { ...t, priority } : t)))
        }}
      />
    </div>
  )
}
