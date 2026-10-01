// Ballmac UI: Ledger template route. https://ui.ballmac.com/templates/template-ledger
import type { Metadata } from "next"

import { LedgerPricing } from "@/components/ballmac/templates/ledger/ledger-pricing"

export const metadata: Metadata = {
  title: "Ledger pricing",
  description: "Buy a license once, or subscribe and always have the latest.",
}

export default function Page() {
  return <LedgerPricing />
}
