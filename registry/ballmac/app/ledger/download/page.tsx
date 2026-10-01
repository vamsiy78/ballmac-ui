// Ballmac UI: Ledger template route. https://ui.ballmac.com/templates/template-ledger
import type { Metadata } from "next"

import { LedgerDownload } from "@/components/ballmac/templates/ledger/ledger-download"

export const metadata: Metadata = {
  title: "Download Ledger",
  description: "Download Ledger for Mac. Free for 14 days.",
}

export default function Page() {
  return <LedgerDownload />
}
