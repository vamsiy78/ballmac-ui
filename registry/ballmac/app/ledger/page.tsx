// Ballmac UI: Ledger template route. https://ui.ballmac.com/templates/template-ledger
import type { Metadata } from "next"

import { LedgerHome } from "@/components/ballmac/templates/ledger/ledger-home"

export const metadata: Metadata = {
  title: "Ledger: Your books, kept beautifully",
  description: "A native Mac app for invoices, expenses and reports.",
}

export default function Page() {
  return <LedgerHome />
}
