// Ballmac UI: Pocket template route. https://ui.ballmac.com/templates/template-pocket
import type { Metadata } from "next"

import { PocketPricing } from "@/components/ballmac/templates/pocket/pocket-pricing"

export const metadata: Metadata = {
  title: "Pricing · Pocket",
  description: "Free forever, with Plus and Metal for extras.",
}

export default function Page() {
  return <PocketPricing />
}
