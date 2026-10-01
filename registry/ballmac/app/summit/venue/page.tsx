// Ballmac UI: Summit template route. https://ui.ballmac.com/templates/template-summit
import type { Metadata } from "next"

import { SummitVenue } from "@/components/ballmac/templates/summit/summit-venue"

export const metadata: Metadata = {
  title: "Venue · Northlight Summit",
  description: "Harpa, Reykjavik. How to get there, where to stay and access details.",
}

export default function Page() {
  return <SummitVenue />
}
