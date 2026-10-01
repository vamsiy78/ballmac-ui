// Ballmac UI: Summit template route. https://ui.ballmac.com/templates/template-summit
import type { Metadata } from "next"

import { SummitTickets } from "@/components/ballmac/templates/summit/summit-tickets"

export const metadata: Metadata = {
  title: "Tickets · Northlight Summit",
  description: "Early bird $490. Group discounts from five tickets.",
}

export default function Page() {
  return <SummitTickets />
}
