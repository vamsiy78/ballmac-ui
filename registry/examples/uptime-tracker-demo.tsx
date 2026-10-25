"use client"

import { UptimeTracker, type UptimeDay } from "@/components/ballmac/uptime-tracker"

function make(seed: number, overrides: Record<number, Partial<UptimeDay>> = {}): UptimeDay[] {
  return Array.from({ length: 60 }, (_, i) => {
    const d = new Date(2026, 7, 27 + i)
    const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    return { date, status: "up" as const, ...overrides[i] }
  })
}

const api = make(1, { 12: { status: "degraded", note: "Slow responses for 25 minutes" }, 33: { status: "down", note: "42 minutes of errors after a bad deploy" }, 34: { status: "degraded", note: "Recovering, queues drained" }, 51: { status: "degraded", note: "Elevated latency in one region" } })
const web = make(2, { 20: { status: "degraded", note: "CDN cache purge slowed pages" } })
const jobs = make(3, { 5: { status: "none" }, 6: { status: "none" }, 44: { status: "down", note: "Queue worker crashed for 3 hours" } })

export default function UptimeTrackerDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-6 rounded-xl border bg-card p-5">
      <UptimeTracker label="API" days={api} startLabel="60 days ago" />
      <UptimeTracker label="Website" days={web} startLabel="60 days ago" />
      <UptimeTracker label="Background jobs" days={jobs} startLabel="60 days ago" />
    </div>
  )
}
