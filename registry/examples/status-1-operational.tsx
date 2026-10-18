"use client"

import { Status1, type Status1Component } from "@/components/ballmac/blocks/status-1/status-1"

const days = (bad: Record<number, "degraded" | "outage"> = {}): Status1Component["days"] => Array.from({ length: 90 }, (_, i) => bad[89 - i] ?? "ok")

const components: Status1Component[] = [
  { id: "api", name: "API", description: "Requests to api.acme.com", status: "operational", days: days({ 41: "degraded" }) },
  { id: "dash", name: "Dashboard", description: "The web app", status: "operational", days: days() },
  { id: "hooks", name: "Webhooks", description: "Event delivery", status: "operational", days: days({ 12: "degraded", 70: "outage" }) },
]

export default function Status1Operational() {
  return <Status1 components={components} incidents={[]} />
}
