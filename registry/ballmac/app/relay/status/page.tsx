// Ballmac UI: Relay template route. https://ui.ballmac.com/templates/template-relay
import type { Metadata } from "next"

import { RelayStatus } from "@/components/ballmac/templates/relay/relay-status"

export const metadata: Metadata = {
  title: "Relay status",
  description: "Uptime and incidents for every Relay component.",
}

export default function Page() {
  return <RelayStatus />
}
