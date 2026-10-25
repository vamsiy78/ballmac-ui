"use client"

import { UptimeTracker } from "@/components/ballmac/uptime-tracker"

export default function UptimeTrackerPerfect() {
  return (
    <div className="w-full max-w-xl">
      <UptimeTracker label="Dashboard" days={Array.from({ length: 30 }, (_, i) => ({ date: `Day ${i + 1}`, status: "up" as const }))} uptime={100} />
    </div>
  )
}
