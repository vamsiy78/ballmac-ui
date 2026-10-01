// Ballmac UI: Ledger template route. https://ui.ballmac.com/templates/template-ledger
import type { Metadata } from "next"

import { LedgerSupport } from "@/components/ballmac/templates/ledger/ledger-support"

export const metadata: Metadata = {
  title: "Ledger support",
  description: "Help articles, shortcuts and ways to reach us.",
}

export default function Page() {
  return <LedgerSupport />
}
