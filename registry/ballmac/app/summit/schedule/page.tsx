// Ballmac UI: Summit template route. https://ui.ballmac.com/templates/template-summit
import type { Metadata } from "next"

import { SummitSchedule } from "@/components/ballmac/templates/summit/summit-schedule"

export const metadata: Metadata = {
  title: "Schedule · Northlight Summit",
  description: "Three rooms, two days. Star talks to build your agenda.",
}

export default function Page() {
  return <SummitSchedule />
}
