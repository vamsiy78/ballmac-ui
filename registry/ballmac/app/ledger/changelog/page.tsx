// Ballmac UI: Ledger template route. https://ui.ballmac.com/templates/template-ledger
import type { Metadata } from "next"

import { LedgerChangelog } from "@/components/ballmac/templates/ledger/ledger-changelog"

export const metadata: Metadata = {
  title: "What’s new in Ledger",
  description: "Release notes for every version of Ledger.",
}

export default function Page() {
  return <LedgerChangelog />
}
