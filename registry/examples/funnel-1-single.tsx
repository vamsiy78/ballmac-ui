"use client"

import { Funnel1 } from "@/components/ballmac/blocks/funnel-1/funnel-1"

const steps = [
  { id: "a", name: "Opened the invite", count: 1840 },
  { id: "b", name: "Created an account", count: 1210 },
  { id: "c", name: "Added a teammate", count: 640 },
  { id: "d", name: "Finished setup", count: 590 },
]

export default function Funnel1Single() {
  return <Funnel1 title="Onboarding" description="From an invite email to a finished setup." period="Last 7 days" defaultSelectedId="c" segments={[{ id: "all", label: "Everyone", steps }]} />
}
