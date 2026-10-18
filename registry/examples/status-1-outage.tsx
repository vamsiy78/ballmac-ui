"use client"

import { Status1, type Status1Component, type Status1Incident } from "@/components/ballmac/blocks/status-1/status-1"

const days = (bad: Record<number, "degraded" | "outage"> = {}): Status1Component["days"] => Array.from({ length: 90 }, (_, i) => bad[89 - i] ?? "ok")

const components: Status1Component[] = [
  { id: "api", name: "API", description: "Requests to api.acme.com", status: "outage", days: days({ 0: "outage", 30: "degraded" }) },
  { id: "dash", name: "Dashboard", description: "The web app", status: "degraded", days: days({ 0: "degraded" }) },
  { id: "auth", name: "Sign in", description: "Login, SSO and two-step codes", status: "operational", days: days() },
]

const incidents: Status1Incident[] = [
  {
    id: "o1",
    title: "API requests are failing",
    impact: "major",
    day: "2026-10-18",
    affects: ["API", "Dashboard"],
    updates: [
      { status: "identified", time: "10:31", body: "A bad configuration change took the API down. We are rolling it back." },
      { status: "investigating", time: "10:22", body: "Most API requests are failing. The dashboard may load slowly. We are investigating." },
    ],
  },
]

export default function Status1Outage() {
  return <Status1 components={components} incidents={incidents} updatedAt="10:35 UTC" />
}
