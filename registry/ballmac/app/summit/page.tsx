// Ballmac UI: Summit template route. https://ui.ballmac.com/templates/template-summit
import type { Metadata } from "next"

import { SummitHome } from "@/components/ballmac/templates/summit/summit-home"

export const metadata: Metadata = {
  title: "Northlight Summit 2027: look further",
  description: "Two days of talks about design, engineering and the long view. Reykjavik, 14 and 15 May 2027.",
}

export default function Page() {
  return <SummitHome />
}
