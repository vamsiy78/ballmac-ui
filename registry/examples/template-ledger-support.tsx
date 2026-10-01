import { LedgerSupport } from "@/components/ballmac/templates/ledger/ledger-support"

export default function TemplateLedgerSupport() {
  return (
    <LedgerSupport
      hrefs={{ home: "/preview/template-ledger-demo", download: "/preview/template-ledger-download", pricing: "/preview/template-ledger-pricing", changelog: "/preview/template-ledger-changelog", support: "/preview/template-ledger-support" }}
    />
  )
}
