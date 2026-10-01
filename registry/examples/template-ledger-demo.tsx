import { LedgerHome } from "@/components/ballmac/templates/ledger/ledger-home"

export default function TemplateLedgerDemo() {
  return (
    <LedgerHome
      hrefs={{ home: "/preview/template-ledger-demo", download: "/preview/template-ledger-download", pricing: "/preview/template-ledger-pricing", changelog: "/preview/template-ledger-changelog", support: "/preview/template-ledger-support" }}
    />
  )
}
