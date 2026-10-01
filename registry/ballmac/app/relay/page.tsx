// Ballmac UI: Relay template route. https://ui.ballmac.com/templates/template-relay
import type { Metadata } from "next"

import { RelayHome } from "@/components/ballmac/templates/relay/relay-home"

export const metadata: Metadata = {
  title: "Relay: Never lose a webhook again",
  description: "Reliable webhook delivery with retries, signatures, replay and a full audit trail.",
}

export default function Page() {
  return <RelayHome />
}
