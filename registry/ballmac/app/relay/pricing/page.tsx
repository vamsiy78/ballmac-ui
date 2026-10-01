// Ballmac UI: Relay template route. https://ui.ballmac.com/templates/template-relay
import type { Metadata } from "next"

import { RelayPricing } from "@/components/ballmac/templates/relay/relay-pricing"

export const metadata: Metadata = {
  title: "Relay pricing",
  description: "Priced per event, and cheaper as you grow.",
}

export default function Page() {
  return <RelayPricing />
}
