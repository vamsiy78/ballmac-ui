import { LedgerChangelog } from "@/components/ballmac/templates/ledger/ledger-changelog"

export default function TemplateLedgerChangelog() {
  return (
    <LedgerChangelog
      hrefs={{ home: "/preview/template-ledger-demo", download: "/preview/template-ledger-download", pricing: "/preview/template-ledger-pricing", changelog: "/preview/template-ledger-changelog", support: "/preview/template-ledger-support" }}
    />
  )
}
