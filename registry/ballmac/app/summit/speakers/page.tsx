// Ballmac UI: Summit template route. https://ui.ballmac.com/templates/template-summit
import type { Metadata } from "next"

import { SummitSpeakers } from "@/components/ballmac/templates/summit/summit-speakers"

export const metadata: Metadata = {
  title: "Speakers · Northlight Summit",
  description: "Twelve speakers, forty-five minutes each.",
}

export default function Page() {
  return <SummitSpeakers />
}
