"use client"

import { Retention1, type Retention1Cohort } from "@/components/ballmac/blocks/retention-1/retention-1"

const cohorts: Retention1Cohort[] = [
  { id: "a", label: "January", size: 5200, retention: [100, 58, 46, 40, 36, 33, 31] },
  { id: "b", label: "February", size: 5480, retention: [100, 60, 48, 42, 38, 35] },
  { id: "c", label: "March", size: 6100, retention: [100, 63, 51, 45, 41] },
  { id: "d", label: "April", size: 6350, retention: [100, 66, 55, 48] },
  { id: "e", label: "May", size: 7020, retention: [100, 69, 57] },
  { id: "f", label: "June", size: 7410, retention: [100, 71] },
]

export default function Retention1Monthly() {
  return <Retention1 title="Monthly retention" description="Customers who stayed subscribed, by the month they joined." period="Month" defaultMode="people" cohorts={cohorts} />
}
