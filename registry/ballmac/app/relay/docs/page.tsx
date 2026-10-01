// Ballmac UI: Relay template route. https://ui.ballmac.com/templates/template-relay
import type { Metadata } from "next"

import { RelayDocs } from "@/components/ballmac/templates/relay/relay-docs"

export const metadata: Metadata = {
  title: "Relay docs: Quickstart",
  description: "Send your first event and verify it in two minutes.",
}

export default function Page() {
  return <RelayDocs />
}
